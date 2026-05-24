import * as THREE from "three";
import { characterSlots } from "../config/characterSlots";
import { getFormationPose } from "./formationLibrary";
import { getProceduralDancePose } from "./proceduralDance";
import {
  ORIGINAL_DANCER_BASE_POSITIONS,
  ORIGINAL_STAGE_POSITION,
  ORIGINAL_STAGE_ROTATION_Y,
  ORIGINAL_WORLD_SCALE,
  sampleOriginalMovieFrame,
} from "./originalMovie";

const fallbackPoints = {
  lead: new THREE.Vector3(-3.1, 3.9, 0),
  partner: new THREE.Vector3(3.1, 3.9, 0),
};
const upAxis = new THREE.Vector3(0, 1, 0);
const originalStagePosition = new THREE.Vector3(...ORIGINAL_STAGE_POSITION);

function getBodyTranslation(frame) {
  return frame ? [frame[0] ?? 0, frame[1] ?? 0, frame[2] ?? 0] : [0, 0, 0];
}

function getOriginalFocusPoint(slotId, movieData, activeMove, modulePhase) {
  const basePosition = ORIGINAL_DANCER_BASE_POSITIONS[slotId];

  if (!basePosition) {
    return fallbackPoints[slotId].clone();
  }

  const frame = sampleOriginalMovieFrame(
    movieData?.[slotId],
    activeMove?.sourceFrames,
    modulePhase,
  );
  const bodyT = getBodyTranslation(frame);

  const localFocus = new THREE.Vector3(
    (basePosition[0] + bodyT[0]) * ORIGINAL_WORLD_SCALE,
    (basePosition[1] + bodyT[1]) * ORIGINAL_WORLD_SCALE,
    (basePosition[2] + bodyT[2]) * ORIGINAL_WORLD_SCALE,
  );

  localFocus.applyAxisAngle(upAxis, ORIGINAL_STAGE_ROTATION_Y);
  localFocus.add(originalStagePosition);

  return localFocus;
}

function getSlotFocusPoint(slot, danceState, syncState) {
  const formationPose = getFormationPose({
    activeMove: danceState?.activeMove,
    slot,
    modulePhase: danceState?.modulePhase ?? 0,
    activeSlotIndex: danceState?.activeSlotIndex ?? 0,
    sequence: danceState?.sequence ?? [],
  });
  const pose = getProceduralDancePose(
    danceState?.activeMove?.id ?? "neutral-ready",
    slot.id,
    danceState?.modulePhase ?? 0,
    syncState?.beatPulse ?? 0,
    syncState?.bassEnergy ?? 0,
  );
  const proceduralScale = slot.url ? 0.45 : 1;
  const targetHeight = slot.targetHeight ?? 5;

  return new THREE.Vector3(
    formationPose.position[0] + pose.x * proceduralScale,
    formationPose.position[1] + pose.y * proceduralScale + targetHeight * 0.55,
    formationPose.position[2] + pose.z * proceduralScale,
  );
}

export function getDancerFocusPoints({ danceState, syncState, originalMovieData }) {
  if (
    danceState?.sequenceMode === "original" ||
    danceState?.sequenceMode === "originalPuppet"
  ) {
    return {
      lead: getOriginalFocusPoint(
        "lead",
        originalMovieData,
        danceState?.activeMove,
        danceState?.modulePhase ?? 0,
      ),
      partner: getOriginalFocusPoint(
        "partner",
        originalMovieData,
        danceState?.activeMove,
        danceState?.modulePhase ?? 0,
      ),
    };
  }

  return Object.fromEntries(
    characterSlots.map((slot) => [slot.id, getSlotFocusPoint(slot, danceState, syncState)]),
  );
}

export function getDuoFocusPoint(points) {
  const lead = points?.lead ?? fallbackPoints.lead;
  const partner = points?.partner ?? fallbackPoints.partner;

  return lead.clone().add(partner).multiplyScalar(0.5);
}
