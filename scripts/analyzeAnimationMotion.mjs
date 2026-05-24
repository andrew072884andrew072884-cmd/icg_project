import fs from "node:fs";
import path from "node:path";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const animationDir = path.resolve("public/assets/animations");
const assumedBpm = Number(process.env.ANIMATION_ANALYSIS_BPM ?? 120);
const beatSeconds = 60 / assumedBpm;
const files = fs
  .readdirSync(animationDir)
  .filter((file) => file.toLowerCase().endsWith(".fbx"))
  .sort();
const loader = new FBXLoader();

function toArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function quaternionAngularDistance(values) {
  let distance = 0;
  const previous = new THREE.Quaternion();
  const current = new THREE.Quaternion();

  for (let index = 4; index < values.length; index += 4) {
    previous.set(values[index - 4], values[index - 3], values[index - 2], values[index - 1]);
    current.set(values[index], values[index + 1], values[index + 2], values[index + 3]);
    distance += 2 * Math.acos(Math.min(1, Math.abs(previous.dot(current))));
  }

  return distance;
}

function vectorDistance(values, stride) {
  let distance = 0;

  for (let index = stride; index < values.length; index += stride) {
    let squaredDistance = 0;

    for (let axis = 0; axis < stride; axis += 1) {
      const delta = values[index + axis] - values[index - stride + axis];
      squaredDistance += delta * delta;
    }

    distance += Math.sqrt(squaredDistance);
  }

  return distance;
}

function analyzeClip(clip) {
  const duration = Math.max(clip.duration, 0.001);
  let angularDistance = 0;
  let positionDistance = 0;
  let scaleDistance = 0;
  let keyCount = 0;
  let animatedTrackCount = 0;

  clip.tracks.forEach((track) => {
    const property = track.name.split(".").pop();
    const valueSize = track.getValueSize();
    const transitions = Math.max(0, track.times.length - 1);

    keyCount += track.times.length;

    if (transitions === 0) {
      return;
    }

    animatedTrackCount += 1;

    if (track.ValueTypeName === "quaternion" || property === "quaternion") {
      angularDistance += quaternionAngularDistance(track.values);
    } else if (property === "position") {
      positionDistance += vectorDistance(track.values, valueSize);
    } else if (property === "scale") {
      scaleDistance += vectorDistance(track.values, valueSize);
    }
  });

  const angularPerSecond = angularDistance / duration;
  const positionPerSecond = positionDistance / duration;
  const keyFrequency = keyCount / duration;
  const motionScore = angularPerSecond + positionPerSecond * 0.35 + scaleDistance * 0.05;

  return {
    duration,
    tracks: clip.tracks.length,
    animatedTrackCount,
    angularPerSecond,
    positionPerSecond,
    keyFrequency,
    motionScore,
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function suggestedBeatSpan({ duration }) {
  const durationInBeats = duration / beatSeconds;
  const roundedToEight = Math.round(durationInBeats / 8) * 8;

  return clamp(roundedToEight || 8, 8, 256);
}

function playbackSpeedAtSuggestedBeats({ duration }, beatSpan) {
  return duration / Math.max(0.001, beatSpan * beatSeconds);
}

const rows = files.map((file) => {
  const filePath = path.join(animationDir, file);
  const buffer = fs.readFileSync(filePath);
  const object = loader.parse(toArrayBuffer(buffer), `${path.dirname(filePath)}/`);
  const clip =
    object.animations
      .filter((animationClip) => animationClip.duration > 0.01)
      .sort((a, b) => b.duration - a.duration)[0] ?? object.animations[0];
  const metrics = clip ? analyzeClip(clip) : null;

  const suggestedBeats = metrics ? suggestedBeatSpan(metrics) : 8;

  return {
    file,
    clip: clip?.name ?? "(none)",
    duration: metrics?.duration ?? 0,
    tracks: metrics?.tracks ?? 0,
    angularPerSecond: metrics?.angularPerSecond ?? 0,
    positionPerSecond: metrics?.positionPerSecond ?? 0,
    keyFrequency: metrics?.keyFrequency ?? 0,
    motionScore: metrics?.motionScore ?? 0,
    suggestedBeatSpan: suggestedBeats,
    playbackSpeed: metrics ? playbackSpeedAtSuggestedBeats(metrics, suggestedBeats) : 0,
  };
});

console.log(`Animation timing assumption: ${assumedBpm} BPM, ${beatSeconds.toFixed(3)}s / beat`);

console.table(
  rows.map((row) => ({
    file: row.file,
    duration: row.duration.toFixed(2),
    tracks: row.tracks,
    angular: row.angularPerSecond.toFixed(1),
    position: row.positionPerSecond.toFixed(1),
    keyHz: row.keyFrequency.toFixed(1),
    score: row.motionScore.toFixed(1),
    beats: row.suggestedBeatSpan,
    speed: `${row.playbackSpeed.toFixed(2)}x`,
  })),
);
