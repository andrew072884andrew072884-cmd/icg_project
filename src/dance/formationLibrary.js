import { danceMoveMap } from "./danceLibrary";
import { characterSlots } from "../config/characterSlots";

const STAGE_LIMITS = {
  x: 4.35,
  z: 2.35,
};
const DANCER_CYLINDER_RADIUS = 0.95;
const MIN_DANCER_DISTANCE = DANCER_CYLINDER_RADIUS * 2;

function smoothstep(value) {
  const x = Math.min(1, Math.max(0, value));

  return x * x * (3 - 2 * x);
}

function wave(phase) {
  return Math.sin(Math.PI * phase);
}

function getSide(slotId) {
  return slotId === "partner" ? 1 : -1;
}

function getPairedSlots(slot) {
  const pairedSlots = characterSlots.filter(
    (characterSlot) => characterSlot.id === "lead" || characterSlot.id === "partner",
  );

  if (!pairedSlots.some((characterSlot) => characterSlot.id === slot.id)) {
    return [slot];
  }

  return pairedSlots;
}

function getFacingRotation(positionX, defaultRotation) {
  const centerBias = positionX === 0 ? 0 : -Math.sign(positionX) * 0.18;

  return defaultRotation + centerBias;
}

function getTravelRotation(startX, startZ, targetX, targetZ, fallbackRotation) {
  const deltaX = targetX - startX;
  const deltaZ = targetZ - startZ;

  if (Math.hypot(deltaX, deltaZ) < 0.05) {
    return fallbackRotation;
  }

  return Math.atan2(deltaX, deltaZ);
}

function clamp(value, limit) {
  return Math.min(limit, Math.max(-limit, value));
}

function clampPosition([x, y, z]) {
  return [clamp(x, STAGE_LIMITS.x), y, clamp(z, STAGE_LIMITS.z)];
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function isWalkTravelMove(move) {
  return move?.tags?.includes("walk");
}

function isPoseHoldMove(move) {
  return move?.tags?.includes("poseHold");
}

function getFormationEndOffset(move, slot, progress = 1) {
  if (!Array.isArray(move?.formationEndOffset)) {
    return [0, 0, 0];
  }

  const [offsetX = 0, offsetY = 0, offsetZ = 0] = move.formationEndOffset;
  const side = getSide(slot.id);
  const clampedProgress = smoothstep(progress);

  return [
    offsetX * side * clampedProgress,
    offsetY * clampedProgress,
    offsetZ * clampedProgress,
  ];
}

function applyFormationEndOffset(position, move, slot, progress = 1) {
  const [offsetX, offsetY, offsetZ] = getFormationEndOffset(move, slot, progress);

  return clampPosition([
    position[0] + offsetX,
    position[1] + offsetY,
    position[2] + offsetZ,
  ]);
}

function createPose(slot, x, y, z, rotationY) {
  return {
    position: clampPosition([x, y, z]),
    rotationY,
  };
}

function createTravelTarget({ activeMove, slot, startPosition, activeSlotIndex = 0 }) {
  const [startX, startY, startZ] = startPosition;
  const side = getSide(slot.id);
  const phraseVariant = activeSlotIndex % 4;

  if (!isWalkTravelMove(activeMove)) {
    return startPosition;
  }

  if (activeMove?.id === "actorcore-catwalk-travel") {
    const swapTargetX = clamp(-startX, STAGE_LIMITS.x);
    const passLaneZ = phraseVariant % 2 === 0 ? side * 0.85 : -side * 0.85;
    const targetZ = clamp(startZ * 0.35 + passLaneZ, STAGE_LIMITS.z);

    return clampPosition([swapTargetX, startY, targetZ]);
  }

  if (phraseVariant === 0) {
    return clampPosition([
      clamp(-startX, STAGE_LIMITS.x),
      startY,
      clamp(startZ + side * 0.95, STAGE_LIMITS.z),
    ]);
  }

  if (phraseVariant === 1) {
    return clampPosition([
      clamp(startX + side * 1.55, STAGE_LIMITS.x),
      startY,
      clamp(startZ - 1.25, STAGE_LIMITS.z),
    ]);
  }

  if (phraseVariant === 2) {
    return clampPosition([
      clamp(startX * 0.35, STAGE_LIMITS.x),
      startY,
      clamp(startZ + 1.15, STAGE_LIMITS.z),
    ]);
  }

  return clampPosition([
    clamp(startX + side * 1.35, STAGE_LIMITS.x),
    startY,
    clamp(startZ - side * 0.85, STAGE_LIMITS.z),
  ]);
}

function separateDancerPositions(positionsBySlotId, minimumDistance = MIN_DANCER_DISTANCE) {
  const leadPosition = positionsBySlotId.lead;
  const partnerPosition = positionsBySlotId.partner;

  if (!leadPosition || !partnerPosition) {
    return positionsBySlotId;
  }

  const deltaX = partnerPosition[0] - leadPosition[0];
  const deltaZ = partnerPosition[2] - leadPosition[2];
  const distance = Math.hypot(deltaX, deltaZ);

  if (distance >= minimumDistance) {
    return {
      ...positionsBySlotId,
      lead: clampPosition(leadPosition),
      partner: clampPosition(partnerPosition),
    };
  }

  const centerX = (leadPosition[0] + partnerPosition[0]) * 0.5;
  const centerZ = (leadPosition[2] + partnerPosition[2]) * 0.5;
  const orderSign = Math.abs(deltaX) > 0.01 ? Math.sign(deltaX) : 1;
  const normalX = distance > 0.001 ? deltaX / distance : orderSign;
  const normalZ = distance > 0.001 ? deltaZ / distance : 0;
  const halfDistance = minimumDistance * 0.5;
  let lead = clampPosition([
    centerX - normalX * halfDistance,
    leadPosition[1],
    centerZ - normalZ * halfDistance,
  ]);
  let partner = clampPosition([
    centerX + normalX * halfDistance,
    partnerPosition[1],
    centerZ + normalZ * halfDistance,
  ]);
  const resolvedDistance = Math.hypot(partner[0] - lead[0], partner[2] - lead[2]);

  if (resolvedDistance < minimumDistance * 0.96) {
    const safeCenterX = Math.min(
      STAGE_LIMITS.x - halfDistance,
      Math.max(-STAGE_LIMITS.x + halfDistance, centerX),
    );
    const safeCenterZ = clamp(centerZ, STAGE_LIMITS.z);

    lead = [safeCenterX - orderSign * halfDistance, leadPosition[1], safeCenterZ];
    partner = [safeCenterX + orderSign * halfDistance, partnerPosition[1], safeCenterZ];
  }

  return {
    ...positionsBySlotId,
    lead,
    partner,
  };
}

function getAccumulatedTravelBases({ sequence = [], activeSlotIndex = 0, slots }) {
  return sequence.slice(0, activeSlotIndex).reduce((currentPositions, sequenceSlot, index) => {
    const move = danceMoveMap[sequenceSlot.moveId];

    if (!isWalkTravelMove(move)) {
      if (!move?.formationEndOffset) {
        return currentPositions;
      }

      const rawTargets = Object.fromEntries(
        slots.map((pairedSlot) => [
          pairedSlot.id,
          applyFormationEndOffset(
            currentPositions[pairedSlot.id] ?? pairedSlot.position,
            move,
            pairedSlot,
            1,
          ),
        ]),
      );

      return {
        ...currentPositions,
        ...separateDancerPositions(rawTargets),
      };
    }

    const rawTargets = Object.fromEntries(
      slots.map((pairedSlot) => [
        pairedSlot.id,
        createTravelTarget({
          activeMove: move,
          slot: pairedSlot,
          startPosition: currentPositions[pairedSlot.id] ?? pairedSlot.position,
          activeSlotIndex: index,
        }),
      ]),
    );

    return {
      ...currentPositions,
      ...separateDancerPositions(rawTargets),
    };
  }, Object.fromEntries(slots.map((pairedSlot) => [pairedSlot.id, pairedSlot.position])));
}

function createTravelPose({
  activeMove,
  slot,
  startPosition,
  targetPosition,
  modulePhase,
  activeSlotIndex,
}) {
  const side = getSide(slot.id);
  const travelProgress = smoothstep(modulePhase);
  const resolvedTargetPosition =
    targetPosition ??
    createTravelTarget({
      activeMove,
      slot,
      startPosition,
      activeSlotIndex,
    });
  const [startX, startY, startZ] = startPosition;
  const [targetX, , targetZ] = resolvedTargetPosition;
  const crossingArc = activeMove?.id === "actorcore-catwalk-travel" ? side * 0.48 : side * 0.32;
  const x = lerp(startX, targetX, travelProgress);
  const z = lerp(startZ, targetZ, travelProgress) + Math.sin(modulePhase * Math.PI) * crossingArc;
  const travelRotation = getTravelRotation(
    startX,
    startZ,
    targetX,
    targetZ,
    getFacingRotation(x, slot.rotationY),
  );
  const entryExitBlend = Math.min(
    smoothstep(modulePhase * 4),
    smoothstep((1 - modulePhase) * 4),
  );
  const rotationY =
    lerp(getFacingRotation(x, slot.rotationY), travelRotation, entryExitBlend) +
    side * Math.sin(modulePhase * Math.PI) * (activeMove?.id === "actorcore-catwalk-travel" ? 0.24 : 0.18);

  return createPose(slot, x, startY, z, rotationY);
}

function getRawFormationPose({
  activeMove,
  slot,
  basePosition,
  modulePhase = 0,
  activeSlotIndex = 0,
}) {
  const activeBasePosition = applyFormationEndOffset(
    basePosition,
    activeMove,
    slot,
    modulePhase,
  );
  const [baseX, baseY, baseZ] = activeBasePosition;
  const side = getSide(slot.id);
  const category = activeMove?.category ?? "verse";
  const progress = smoothstep(wave(modulePhase));
  const phraseVariant = activeSlotIndex % 4;

  if (activeMove?.id === "neutral-ready" || activeMove?.id === "female-standing-pose") {
    return createPose(slot, baseX, baseY, baseZ, slot.rotationY);
  }

  if (isPoseHoldMove(activeMove)) {
    const poseSway = Math.sin(modulePhase * Math.PI * 2);
    const poseBreath = Math.sin(modulePhase * Math.PI);

    return createPose(
      slot,
      baseX + poseSway * 0.035 * side,
      baseY,
      baseZ + poseBreath * 0.025,
      getFacingRotation(baseX, slot.rotationY) + poseSway * 0.025 * side,
    );
  }

  if (activeMove?.id === "rumba-dancing") {
    const x = baseX + Math.sin(modulePhase * Math.PI * 2) * 0.16 * side;
    const z = baseZ + Math.cos(modulePhase * Math.PI * 2) * 0.12;
    const rotationY = getFacingRotation(x, slot.rotationY) + Math.sin(modulePhase * Math.PI) * 0.08 * side;

    return createPose(slot, x, baseY, z, rotationY);
  }

  if (category === "intro") {
    const x = baseX * (1 - progress * 0.08);
    const z = baseZ - progress * 0.18;

    return createPose(slot, x, baseY, z, getFacingRotation(x, slot.rotationY));
  }

  if (category === "main") {
    const depth = phraseVariant % 2 === 0 ? -0.8 : 0.55;
    const x = baseX + side * progress * 0.45;
    const z = baseZ + progress * depth;

    return createPose(slot, x, baseY, z, getFacingRotation(x, slot.rotationY));
  }

  if (category === "transition") {
    const crossAmount = phraseVariant < 2 ? 0.44 : 0.62;
    const x = baseX * (1 - progress * crossAmount);
    const z = baseZ + side * progress * 0.7;
    const rotationY = slot.rotationY + side * progress * 0.34;

    return createPose(slot, x, baseY, z, rotationY);
  }

  if (category === "formation") {
    if (phraseVariant === 0) {
      const x = baseX * (1 - progress * 0.54);
      const z = baseZ + side * progress * 1.05;

      return createPose(slot, x, baseY, z, getFacingRotation(x, slot.rotationY));
    }

    if (phraseVariant === 1) {
      const x = baseX + side * progress * 0.75;
      const z = baseZ - progress * 0.55;

      return createPose(slot, x, baseY, z, getFacingRotation(x, slot.rotationY));
    }

    if (phraseVariant === 2) {
      const x = baseX * (1 - progress * 0.72);
      const z = baseZ - progress * 0.95;
      const rotationY = slot.rotationY - side * progress * 0.42;

      return createPose(slot, x, baseY, z, rotationY);
    }

    const x = baseX + side * Math.sin(modulePhase * Math.PI * 2) * 0.42;
    const z = baseZ + Math.cos(modulePhase * Math.PI * 2) * progress * 0.5;

    return createPose(slot, x, baseY, z, getFacingRotation(x, slot.rotationY));
  }

  if (category === "accent") {
    const hit = modulePhase < 0.5 ? smoothstep(modulePhase * 2) : smoothstep((1 - modulePhase) * 2);
    const x = baseX * (1 - hit * 0.18);
    const z = baseZ - hit * 0.85;
    const rotationY = slot.rotationY + side * hit * 0.18;

    return createPose(slot, x, baseY, z, rotationY);
  }

  if (category === "ending") {
    const settle = smoothstep(modulePhase);
    const x = baseX * (1 - settle * 0.48);
    const z = baseZ - settle * 0.62;

    return createPose(slot, x, baseY, z, getFacingRotation(x, slot.rotationY));
  }

  const groove = Math.sin(modulePhase * Math.PI * 2);
  const x = baseX + groove * 0.12 * side;
  const z = baseZ + Math.cos(modulePhase * Math.PI * 2) * 0.08;

  return createPose(slot, x, baseY, z, getFacingRotation(x, slot.rotationY));
}

export function getFormationPose({
  activeMove,
  slot,
  modulePhase = 0,
  activeSlotIndex = 0,
  sequence = [],
}) {
  const pairedSlots = getPairedSlots(slot);
  const accumulatedBases = getAccumulatedTravelBases({
    sequence,
    activeSlotIndex,
    slots: pairedSlots,
  });
  const isWalkTravel = activeMove?.tags?.includes("walk");

  if (isWalkTravel) {
    const separatedTargets = separateDancerPositions(
      Object.fromEntries(
        pairedSlots.map((pairedSlot) => [
          pairedSlot.id,
          createTravelTarget({
            activeMove,
            slot: pairedSlot,
            startPosition: accumulatedBases[pairedSlot.id] ?? pairedSlot.position,
            activeSlotIndex,
          }),
        ]),
      ),
    );
    const rawTravelPoses = Object.fromEntries(
      pairedSlots.map((pairedSlot) => [
        pairedSlot.id,
        createTravelPose({
          activeMove,
          slot: pairedSlot,
          startPosition: accumulatedBases[pairedSlot.id] ?? pairedSlot.position,
          targetPosition: separatedTargets[pairedSlot.id],
          modulePhase,
          activeSlotIndex,
        }),
      ]),
    );
    const separatedTravelPositions = separateDancerPositions(
      Object.fromEntries(
        pairedSlots.map((pairedSlot) => [
          pairedSlot.id,
          rawTravelPoses[pairedSlot.id].position,
        ]),
      ),
      MIN_DANCER_DISTANCE * 1.08,
    );
    const selectedPose = rawTravelPoses[slot.id] ?? rawTravelPoses[pairedSlots[0]?.id];

    return {
      ...selectedPose,
      position: separatedTravelPositions[slot.id] ?? selectedPose.position,
    };
  }

  const rawPoses = Object.fromEntries(
    pairedSlots.map((pairedSlot) => [
      pairedSlot.id,
      getRawFormationPose({
        activeMove,
        slot: pairedSlot,
        basePosition: accumulatedBases[pairedSlot.id] ?? pairedSlot.position,
        modulePhase,
        activeSlotIndex,
      }),
    ]),
  );
  const separatedPositions = separateDancerPositions(
    Object.fromEntries(
      pairedSlots.map((pairedSlot) => [pairedSlot.id, rawPoses[pairedSlot.id].position]),
    ),
  );
  const selectedPose = rawPoses[slot.id] ?? rawPoses[pairedSlots[0]?.id];

  return {
    ...selectedPose,
    position: separatedPositions[slot.id] ?? selectedPose.position,
  };
}
