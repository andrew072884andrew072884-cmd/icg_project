function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function percentile(values, p) {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = clamp(Math.floor((sorted.length - 1) * p), 0, sorted.length - 1);
  return sorted[index];
}

function normalizeArray(values) {
  if (!values.length) {
    return values;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values.map((value) => (value - min) / range);
}

function movingAverage(values, radius) {
  return values.map((_, index) => {
    const start = Math.max(0, index - radius);
    const end = Math.min(values.length - 1, index + radius);
    let sum = 0;

    for (let cursor = start; cursor <= end; cursor += 1) {
      sum += values[cursor];
    }

    return sum / (end - start + 1);
  });
}

function mergeChannels(audioBuffer) {
  const length = audioBuffer.length;
  const mono = new Float32Array(length);
  const channelCount = audioBuffer.numberOfChannels;

  for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
    const channel = audioBuffer.getChannelData(channelIndex);

    for (let sampleIndex = 0; sampleIndex < length; sampleIndex += 1) {
      mono[sampleIndex] += channel[sampleIndex] / channelCount;
    }
  }

  return mono;
}

function createEnvelope(channelData, sampleRate) {
  const frameSize = 1024;
  const hopSize = 512;
  const envelope = [];
  const times = [];

  for (let offset = 0; offset + frameSize < channelData.length; offset += hopSize) {
    let energy = 0;

    for (let frameOffset = 0; frameOffset < frameSize; frameOffset += 1) {
      const sample = channelData[offset + frameOffset];
      energy += sample * sample;
    }

    envelope.push(Math.sqrt(energy / frameSize));
    times.push(offset / sampleRate);
  }

  return {
    envelope: movingAverage(envelope, 2),
    times,
    hopDuration: hopSize / sampleRate,
  };
}

function createNovelty(envelope) {
  const novelty = new Array(envelope.length).fill(0);
  const smoothed = movingAverage(envelope, 8);

  for (let index = 1; index < envelope.length; index += 1) {
    novelty[index] = Math.max(0, envelope[index] - smoothed[index - 1]);
  }

  return movingAverage(novelty, 2);
}

function estimateBeatInterval(novelty, hopDuration) {
  const minBpm = 70;
  const maxBpm = 180;
  const minLag = Math.round((60 / maxBpm) / hopDuration);
  const maxLag = Math.round((60 / minBpm) / hopDuration);

  let bestLag = minLag;
  let bestScore = -Infinity;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let score = 0;

    for (let index = lag; index < novelty.length; index += 1) {
      score += novelty[index] * novelty[index - lag];
    }

    const halfLag = Math.max(1, Math.round(lag / 2));
    const doubleLag = Math.min(maxLag, lag * 2);
    let harmonicBonus = 0;

    for (let index = doubleLag; index < novelty.length; index += 1) {
      harmonicBonus += novelty[index] * novelty[index - doubleLag];
    }

    for (let index = halfLag; index < novelty.length; index += 1) {
      harmonicBonus += 0.35 * novelty[index] * novelty[index - halfLag];
    }

    const weightedScore = score + harmonicBonus * 0.35;

    if (weightedScore > bestScore) {
      bestScore = weightedScore;
      bestLag = lag;
    }
  }

  return {
    beatInterval: bestLag * hopDuration,
    confidence: bestScore,
  };
}

function detectPeaks(novelty, times, beatInterval) {
  const mean =
    novelty.reduce((sum, value) => sum + value, 0) / Math.max(1, novelty.length);
  const variance =
    novelty.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    Math.max(1, novelty.length);
  const stdDev = Math.sqrt(variance);
  const threshold = mean + stdDev * 0.6;
  const minGap = Math.max(0.18, beatInterval * 0.45);
  const peaks = [];
  let lastPeakTime = -Infinity;

  for (let index = 1; index < novelty.length - 1; index += 1) {
    const value = novelty[index];

    if (
      value > threshold &&
      value >= novelty[index - 1] &&
      value >= novelty[index + 1] &&
      times[index] - lastPeakTime >= minGap
    ) {
      peaks.push({
        time: times[index],
        strength: value,
      });
      lastPeakTime = times[index];
    }
  }

  return peaks;
}

function buildBeatGrid(peaks, beatInterval, duration) {
  if (!peaks.length || !Number.isFinite(beatInterval) || beatInterval <= 0) {
    return [];
  }

  const tolerance = beatInterval * 0.18;
  const candidateAnchors = peaks.slice(0, Math.min(16, peaks.length));
  let bestBeats = [];
  let bestScore = -Infinity;

  candidateAnchors.forEach((anchor) => {
    const beats = [];
    let score = 0;
    let time = anchor.time;
    let peakCursor = 0;

    while (time <= duration + beatInterval) {
      while (peakCursor < peaks.length && peaks[peakCursor].time < time - tolerance) {
        peakCursor += 1;
      }

      let snappedTime = time;
      let snappedStrength = 0;

      for (
        let candidateIndex = peakCursor;
        candidateIndex < peaks.length &&
        peaks[candidateIndex].time <= time + tolerance;
        candidateIndex += 1
      ) {
        const candidate = peaks[candidateIndex];
        const distance = Math.abs(candidate.time - time);

        if (distance <= tolerance) {
          snappedTime = candidate.time;
          snappedStrength = Math.max(snappedStrength, candidate.strength);
        }
      }

      beats.push(snappedTime);
      score += snappedStrength || 0.03;
      time += beatInterval;
    }

    if (score > bestScore) {
      bestScore = score;
      bestBeats = beats;
    }
  });

  return bestBeats.filter((time, index, beatArray) => {
    if (index === 0) {
      return time >= 0 && time <= duration;
    }

    return time <= duration && time - beatArray[index - 1] > beatInterval * 0.4;
  });
}

function locateSegmentIndex(times, currentTime) {
  if (!times.length) {
    return 0;
  }

  let low = 0;
  let high = times.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (times[mid] <= currentTime) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return clamp(high, 0, times.length - 1);
}

function analyzeSections(beatTimes, envelopeTimes, envelope, novelty, duration) {
  if (beatTimes.length < 8) {
    return [];
  }

  const sections = [];
  const barMetrics = [];

  for (let beatIndex = 0; beatIndex + 4 < beatTimes.length; beatIndex += 4) {
    const startTime = beatTimes[beatIndex];
    const endTime = beatTimes[beatIndex + 4] ?? duration;
    let envelopeSum = 0;
    let noveltySum = 0;
    let sampleCount = 0;

    for (let sampleIndex = 0; sampleIndex < envelopeTimes.length; sampleIndex += 1) {
      const time = envelopeTimes[sampleIndex];

      if (time < startTime) {
        continue;
      }

      if (time >= endTime) {
        break;
      }

      envelopeSum += envelope[sampleIndex];
      noveltySum += novelty[sampleIndex];
      sampleCount += 1;
    }

    barMetrics.push({
      beatIndex,
      startTime,
      endTime,
      energy: sampleCount ? envelopeSum / sampleCount : 0,
      activity: sampleCount ? noveltySum / sampleCount : 0,
    });
  }

  const normalizedEnergy = normalizeArray(barMetrics.map((bar) => bar.energy));
  const normalizedActivity = normalizeArray(barMetrics.map((bar) => bar.activity));
  const scores = barMetrics.map((_, index) => normalizedEnergy[index] * 0.7 + normalizedActivity[index] * 0.3);
  const threshold = percentile(scores, 0.68);

  let sectionStart = null;

  barMetrics.forEach((bar, index) => {
    const score = scores[index];
    const active = score >= threshold;

    if (active && sectionStart === null) {
      sectionStart = index;
      return;
    }

    if (!active && sectionStart !== null) {
      if (index - sectionStart >= 2) {
        sections.push({
          label: `Main section candidate ${sections.length + 1}`,
          startTime: barMetrics[sectionStart].startTime,
          endTime: barMetrics[index - 1].endTime,
          confidence: scores
            .slice(sectionStart, index)
            .reduce((sum, value) => sum + value, 0) / (index - sectionStart),
        });
      }

      sectionStart = null;
    }
  });

  if (sectionStart !== null && barMetrics.length - sectionStart >= 2) {
    sections.push({
      label: `Main section candidate ${sections.length + 1}`,
      startTime: barMetrics[sectionStart].startTime,
      endTime: barMetrics[barMetrics.length - 1].endTime,
      confidence: scores
        .slice(sectionStart)
        .reduce((sum, value) => sum + value, 0) / (barMetrics.length - sectionStart),
    });
  }

  return sections;
}

export async function analyzeAudioBuffer(audioBuffer) {
  const channelData = mergeChannels(audioBuffer);
  const duration = audioBuffer.duration;
  const sampleRate = audioBuffer.sampleRate;
  const { envelope, times, hopDuration } = createEnvelope(channelData, sampleRate);
  const novelty = createNovelty(envelope);
  const { beatInterval, confidence } = estimateBeatInterval(novelty, hopDuration);
  const peaks = detectPeaks(novelty, times, beatInterval);
  const beatTimes = buildBeatGrid(peaks, beatInterval, duration);
  const detectedBpm = clamp(Math.round(60 / Math.max(beatInterval, 0.001)), 40, 220);
  const sections = analyzeSections(beatTimes, times, envelope, novelty, duration);

  return {
    detectedBpm,
    beatInterval,
    beatTimes,
    sections,
    confidence,
  };
}

export function computeBeatMetricsFromGrid(currentTime, duration, beatTimes, fallbackBpm, sections) {
  const safeDuration = Number.isFinite(duration) ? duration : 0;

  if (!beatTimes.length) {
    const beatsPerSecond = fallbackBpm / 60;
    const rawBeat = currentTime * beatsPerSecond;
    const beatIndex = Math.floor(rawBeat);
    const beatPhase = rawBeat - beatIndex;

    return {
      currentTime,
      duration: safeDuration,
      beatIndex,
      barIndex: Math.floor(beatIndex / 4),
      beatPhase,
      beatPulse: Math.max(0, 1 - beatPhase * 4),
      beatDuration: 60 / fallbackBpm,
      currentSection: null,
      isMainSection: false,
    };
  }

  const beatIndex = locateSegmentIndex(beatTimes, currentTime);
  const currentBeatTime = beatTimes[beatIndex];
  const nextBeatTime =
    beatTimes[beatIndex + 1] ??
    currentBeatTime + (beatTimes[beatIndex] - (beatTimes[beatIndex - 1] ?? currentBeatTime - 0.5));
  const beatDuration = Math.max(0.001, nextBeatTime - currentBeatTime);
  const beatPhase = clamp((currentTime - currentBeatTime) / beatDuration, 0, 1);
  const currentSection =
    sections.find(
      (section) => currentTime >= section.startTime && currentTime < section.endTime,
    ) ?? null;

  return {
    currentTime,
    duration: safeDuration,
    beatIndex,
    barIndex: Math.floor(beatIndex / 4),
    beatPhase,
    beatPulse: Math.max(0, 1 - beatPhase * 4),
    beatDuration,
    currentSection,
    isMainSection: Boolean(currentSection),
  };
}
