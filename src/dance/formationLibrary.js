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

function getFacingRotation(positionX, defaultRotation) {
  const centerBias = positionX === 0 ? 0 : -Math.sign(positionX) * 0.18;

  return defaultRotation + centerBias;
}

function createPose(slot, x, y, z, rotationY) {
  return {
    position: [x, y, z],
    rotationY,
  };
}

export function getFormationPose({
  activeMove,
  slot,
  modulePhase = 0,
  activeSlotIndex = 0,
}) {
  const [baseX, baseY, baseZ] = slot.position;
  const side = getSide(slot.id);
  const category = activeMove?.category ?? "verse";
  const progress = smoothstep(wave(modulePhase));
  const phraseVariant = activeSlotIndex % 4;

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
