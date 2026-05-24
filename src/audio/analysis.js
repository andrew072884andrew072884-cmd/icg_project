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

function analyzeSections(beatTimes, envelopeTimes, envelope, novelty, duration, activeBounds = null) {
  if (beatTimes.length < 8) {
    return createStructuralFallbackSections(beatTimes, duration, activeBounds);
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
  const threshold = percentile(scores, 0.64);

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

  const refinedSections = refineSections(sections, beatTimes, duration, activeBounds);

  return refinedSections.length
    ? refinedSections
    : createStructuralFallbackSections(beatTimes, duration, activeBounds);
}

function findNearestBeatTime(beatTimes, targetTime, fallbackTime) {
  if (!beatTimes.length) {
    return fallbackTime;
  }

  let bestTime = beatTimes[0];
  let bestDistance = Math.abs(bestTime - targetTime);

  beatTimes.forEach((beatTime) => {
    const distance = Math.abs(beatTime - targetTime);

    if (distance < bestDistance) {
      bestTime = beatTime;
      bestDistance = distance;
    }
  });

  return bestTime;
}

function createStructuralFallbackSections(beatTimes, duration, activeBounds = null) {
  const activeStartTime = activeBounds?.startTime ?? 0;
  const activeEndTime = activeBounds?.endTime ?? duration;
  const activeDuration = Math.max(0, activeEndTime - activeStartTime);

  if (activeDuration <= 0) {
    return [];
  }

  const averageBeatDuration =
    beatTimes.length > 1
      ? (beatTimes[beatTimes.length - 1] - beatTimes[0]) / (beatTimes.length - 1)
      : activeDuration / 128;
  const safeBeatDuration = Math.max(0.25, Math.min(1.2, averageBeatDuration || 0.5));
  const minSectionDuration = Math.min(
    activeDuration,
    Math.max(10, safeBeatDuration * 24, activeDuration * 0.08),
  );
  const preferredSectionDuration = Math.min(
    activeDuration * 0.26,
    Math.max(safeBeatDuration * 40, activeDuration * 0.16),
  );
  const sectionDuration = Math.max(minSectionDuration, preferredSectionDuration);

  if (activeDuration < minSectionDuration * 2.2) {
    return [
      {
        label: "Main section fallback 1",
        startTime: activeStartTime,
        endTime: activeEndTime,
        confidence: 0.45,
        fallback: true,
      },
    ];
  }

  const windows = [
    [0.34, 0.34 + sectionDuration / activeDuration],
    [0.68, 0.68 + sectionDuration / activeDuration],
  ];
  const sections = [];

  windows.forEach(([relativeStart, relativeEnd]) => {
    const rawStart = activeStartTime + activeDuration * relativeStart;
    const rawEnd = activeStartTime + activeDuration * Math.min(0.96, relativeEnd);
    const snappedStart = findNearestBeatTime(beatTimes, rawStart, rawStart);
    const snappedEnd = findNearestBeatTime(beatTimes, rawEnd, rawEnd);
    const startTime = clamp(snappedStart, activeStartTime, activeEndTime);
    const endTime = clamp(
      Math.max(snappedEnd, startTime + minSectionDuration),
      startTime,
      activeEndTime,
    );

    if (
      endTime - startTime >= minSectionDuration &&
      !sections.some(
        (section) => startTime < section.endTime && endTime > section.startTime,
      )
    ) {
      sections.push({
        label: `Main section fallback ${sections.length + 1}`,
        startTime,
        endTime,
        confidence: 0.42,
        fallback: true,
      });
    }
  });

  return sections;
}

function expandSectionToPhrase(section, targetDuration, beatTimes, activeStartTime, activeEndTime) {
  const activeDuration = Math.max(0.001, activeEndTime - activeStartTime);
  const targetSpan = Math.min(targetDuration, activeDuration);
  const currentDuration = section.endTime - section.startTime;

  if (currentDuration >= targetSpan || targetSpan <= 0) {
    return { ...section };
  }

  const centerTime = clamp(
    (section.startTime + section.endTime) * 0.5,
    activeStartTime,
    activeEndTime,
  );
  const desiredStart = centerTime - targetSpan * 0.5;
  const desiredEnd = centerTime + targetSpan * 0.5;
  let startTime = findNearestBeatTime(beatTimes, desiredStart, desiredStart);
  let endTime = findNearestBeatTime(beatTimes, desiredEnd, desiredEnd);

  if (endTime - startTime < targetSpan * 0.9) {
    startTime = desiredStart;
    endTime = desiredEnd;
  }

  if (startTime < activeStartTime) {
    endTime += activeStartTime - startTime;
    startTime = activeStartTime;
  }

  if (endTime > activeEndTime) {
    startTime -= endTime - activeEndTime;
    endTime = activeEndTime;
  }

  startTime = clamp(startTime, activeStartTime, activeEndTime);
  endTime = clamp(Math.max(endTime, startTime + targetSpan * 0.9), startTime, activeEndTime);

  return {
    ...section,
    startTime,
    endTime,
  };
}

function mergeOverlappingSections(sections, mergeGap = 0) {
  return sections
    .sort((a, b) => a.startTime - b.startTime)
    .reduce((mergedSections, section) => {
      const previous = mergedSections[mergedSections.length - 1];

      if (previous && section.startTime - previous.endTime <= mergeGap) {
        const previousDuration = previous.endTime - previous.startTime;
        const sectionDuration = section.endTime - section.startTime;
        const totalDuration = Math.max(0.001, previousDuration + sectionDuration);

        previous.endTime = Math.max(previous.endTime, section.endTime);
        previous.confidence =
          (previous.confidence * previousDuration + section.confidence * sectionDuration) /
          totalDuration;
        previous.fallback = previous.fallback && section.fallback;
        return mergedSections;
      }

      mergedSections.push({ ...section });
      return mergedSections;
    }, []);
}

function refineSections(sections, beatTimes, duration, activeBounds = null) {
  if (!sections.length) {
    return [];
  }

  const averageBeatDuration =
    beatTimes.length > 1
      ? (beatTimes[beatTimes.length - 1] - beatTimes[0]) / (beatTimes.length - 1)
      : 0.5;
  const safeBeatDuration = Math.max(0.25, Math.min(1.2, averageBeatDuration || 0.5));
  const activeStartTime = activeBounds?.startTime ?? 0;
  const activeEndTime = activeBounds?.endTime ?? duration;
  const activeDuration = Math.max(0.001, activeEndTime - activeStartTime);
  const minSectionDuration = Math.min(
    activeDuration,
    Math.max(10, safeBeatDuration * 24, activeDuration * 0.08),
  );
  const targetSectionDuration = Math.max(
    minSectionDuration,
    Math.min(activeDuration * 0.24, Math.max(safeBeatDuration * 32, activeDuration * 0.12)),
  );
  const mergeGap = safeBeatDuration * 16;
  const mergedSections = [];

  sections
    .forEach((section) => {
      const previous = mergedSections[mergedSections.length - 1];

      if (previous && section.startTime - previous.endTime <= mergeGap) {
        const previousDuration = previous.endTime - previous.startTime;
        const sectionDuration = section.endTime - section.startTime;

        previous.endTime = section.endTime;
        previous.confidence =
          (previous.confidence * previousDuration + section.confidence * sectionDuration) /
          Math.max(0.001, previousDuration + sectionDuration);
        return;
      }

      mergedSections.push({ ...section });
    });

  return mergeOverlappingSections(
    mergedSections.map((section) =>
      expandSectionToPhrase(
        section,
        targetSectionDuration,
        beatTimes,
        activeStartTime,
        activeEndTime,
      ),
    ),
    safeBeatDuration * 4,
  )
    .filter((section) => {
      const sectionDuration = section.endTime - section.startTime;

      return (
        sectionDuration >= minSectionDuration &&
        section.startTime >= activeStartTime + activeDuration * 0.08 &&
        section.endTime <= activeStartTime + activeDuration * 0.98
      );
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)
    .sort((a, b) => a.startTime - b.startTime)
    .map((section, index) => ({
      ...section,
      label: `Main section candidate ${index + 1}`,
    }));
}

function detectActiveMusicBounds(envelopeTimes, envelope, duration, hopDuration) {
  if (!envelope.length || duration <= 0) {
    return {
      startTime: 0,
      endTime: duration,
      duration,
    };
  }

  const noiseFloor = percentile(envelope, 0.1);
  const bodyLevel = percentile(envelope, 0.88);
  const peakLevel = percentile(envelope, 0.98);
  const dynamicRange = Math.max(0, bodyLevel - noiseFloor);
  const threshold = Math.max(
    noiseFloor + dynamicRange * 0.12,
    peakLevel * 0.025,
    0.0005,
  );
  const activeFlags = envelope.map((value) => (value >= threshold ? 1 : 0));
  const windowRadius = Math.max(1, Math.round(0.42 / Math.max(hopDuration, 0.001)));
  const activityRatio = movingAverage(activeFlags, windowRadius);
  const minRatio = 0.26;
  let firstActiveIndex = activityRatio.findIndex((value) => value >= minRatio);
  let lastActiveIndex = -1;

  for (let index = activityRatio.length - 1; index >= 0; index -= 1) {
    if (activityRatio[index] >= minRatio) {
      lastActiveIndex = index;
      break;
    }
  }

  if (firstActiveIndex < 0 || lastActiveIndex < firstActiveIndex) {
    return {
      startTime: 0,
      endTime: duration,
      duration,
    };
  }

  const startTime = clamp(envelopeTimes[firstActiveIndex] - 0.12, 0, duration);
  const endTime = clamp(
    envelopeTimes[lastActiveIndex] + hopDuration * (windowRadius + 2),
    startTime,
    duration,
  );
  const activeDuration = endTime - startTime;

  if (activeDuration < Math.min(8, duration * 0.35)) {
    return {
      startTime: 0,
      endTime: duration,
      duration,
    };
  }

  return {
    startTime,
    endTime,
    duration: activeDuration,
  };
}

export async function analyzeAudioBuffer(audioBuffer) {
  const channelData = mergeChannels(audioBuffer);
  const duration = audioBuffer.duration;
  const sampleRate = audioBuffer.sampleRate;
  const { envelope, times, hopDuration } = createEnvelope(channelData, sampleRate);
  const novelty = createNovelty(envelope);
  const activeBounds = detectActiveMusicBounds(times, envelope, duration, hopDuration);
  const { beatInterval, confidence } = estimateBeatInterval(novelty, hopDuration);
  const peaks = detectPeaks(novelty, times, beatInterval);
  const beatTimes = buildBeatGrid(peaks, beatInterval, duration);
  const detectedBpm = clamp(Math.round(60 / Math.max(beatInterval, 0.001)), 40, 220);
  const sections = analyzeSections(beatTimes, times, envelope, novelty, duration, activeBounds);

  return {
    detectedBpm,
    beatInterval,
    beatTimes,
    sections,
    confidence,
    activeBounds,
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
