function mirrored(slotId) {
  return slotId === "partner" ? -1 : 1;
}

const originalProfiles = [
  { base: "power-hit", x: 0.1, y: 0.08, turn: 0.18, z: 0.05 },
  { base: "jump-kick", x: 0.18, y: 0.06, turn: 0.08, z: 0.12 },
  { base: "side-groove", x: 0.34, y: 0.02, turn: 0.08, z: 0.04 },
  { base: "turn-accent", x: 0.22, y: 0.02, turn: 0.24, z: 0.06 },
  { base: "turn-accent", x: 0.1, y: 0.08, turn: 0.28, z: 0.04 },
  { base: "cross-step", x: 0.28, y: 0.18, turn: 0.2, z: 0.12 },
  { base: "side-groove", x: 0.32, y: 0.08, turn: 0.16, z: 0.08 },
  { base: "power-hit", x: 0.08, y: 0.06, turn: 0.22, z: 0.1 },
  { base: "jump-kick", x: 0.18, y: 0.06, turn: 0.08, z: 0.12 },
  { base: "side-groove", x: 0.34, y: 0.02, turn: 0.08, z: 0.04 },
  { base: "turn-accent", x: 0.22, y: 0.02, turn: 0.24, z: 0.06 },
  { base: "turn-accent", x: 0.1, y: 0.08, turn: 0.28, z: 0.04 },
  { base: "cross-step", x: 0.28, y: 0.18, turn: 0.2, z: 0.12 },
  { base: "side-groove", x: 0.34, y: 0.08, turn: 0.16, z: 0.08 },
  { base: "freeze-pose", x: 0.02, y: 0.05, turn: 0, z: 0.02 },
  { base: "freeze-pose", x: 0.02, y: 0.05, turn: 0, z: 0.02 },
];

export function getProceduralDancePose(moveId, slotId, modulePhase, beatPulse, bassEnergy) {
  if (moveId.startsWith("original-latin-")) {
    const phraseIndex = Number(moveId.replace("original-latin-", "")) - 1;
    const profile = originalProfiles[phraseIndex] ?? originalProfiles[0];
    const basePose = getProceduralDancePose(
      profile.base,
      slotId,
      modulePhase,
      beatPulse,
      bassEnergy,
    );
    const mirror = mirrored(slotId);
    const loop = modulePhase * Math.PI * 2;

    return {
      x: basePose.x + Math.sin(loop) * profile.x * mirror,
      y: basePose.y + Math.abs(Math.sin(loop)) * profile.y,
      z: basePose.z + Math.cos(loop) * profile.z,
      rotationY: basePose.rotationY + Math.sin(loop) * profile.turn * mirror,
      rotationZ: basePose.rotationZ + Math.cos(loop * 2) * profile.turn * 0.35 * mirror,
    };
  }

  const mirror = mirrored(slotId);
  const loop = modulePhase * Math.PI * 2;
  const doubleLoop = loop * 2;
  const pulse = beatPulse + bassEnergy * 0.45;

  switch (moveId) {
    case "neutral-ready":
      return {
        x: 0,
        y: 0,
        z: 0,
        rotationY: 0,
        rotationZ: 0,
      };
    case "female-standing-pose":
    case "female-dance-pose":
    case "female-dance-pose-1":
    case "male-dance-pose":
      return {
        x: Math.sin(loop) * 0.025 * mirror,
        y: pulse * 0.025,
        z: Math.cos(loop) * 0.018,
        rotationY: Math.sin(loop) * 0.025 * mirror,
        rotationZ: Math.cos(loop) * 0.018 * mirror,
      };
    case "side-groove":
      return {
        x: Math.sin(loop) * 0.26 * mirror,
        y: Math.abs(Math.sin(doubleLoop)) * 0.12 + pulse * 0.08,
        z: Math.cos(loop) * 0.08,
        rotationY: Math.sin(loop) * 0.18 * mirror,
        rotationZ: Math.sin(loop) * 0.08 * mirror,
      };
    case "bounce-step":
      return {
        x: Math.sin(doubleLoop) * 0.08 * mirror,
        y: Math.abs(Math.sin(doubleLoop)) * 0.18 + pulse * 0.1,
        z: 0,
        rotationY: Math.sin(loop) * 0.08 * mirror,
        rotationZ: Math.sin(doubleLoop) * 0.04 * mirror,
      };
    case "arm-wave":
      return {
        x: Math.sin(loop) * 0.14 * mirror,
        y: Math.sin(loop - Math.PI / 2) * 0.1 + pulse * 0.08,
        z: Math.cos(doubleLoop) * 0.12,
        rotationY: Math.sin(doubleLoop) * 0.2 * mirror,
        rotationZ: Math.sin(loop) * 0.18 * mirror,
      };
    case "cross-step":
      return {
        x: Math.sin(loop) * 0.34 * mirror,
        y: Math.abs(Math.sin(loop)) * 0.12 + pulse * 0.08,
        z: Math.sin(doubleLoop) * 0.16,
        rotationY: Math.sin(loop) * 0.28 * mirror,
        rotationZ: Math.sin(loop + Math.PI / 3) * 0.12 * mirror,
      };
    case "turn-accent":
      return {
        x: Math.sin(loop) * 0.16 * mirror,
        y: Math.abs(Math.sin(doubleLoop)) * 0.16 + pulse * 0.12,
        z: Math.cos(loop) * 0.1,
        rotationY: loop * mirror,
        rotationZ: Math.sin(doubleLoop) * 0.08 * mirror,
      };
    case "power-hit":
      return {
        x: Math.sin(loop) * 0.12 * mirror,
        y: pulse * 0.22,
        z: Math.cos(loop) * 0.12,
        rotationY: Math.sin(loop) * 0.12 * mirror,
        rotationZ: Math.sin(doubleLoop) * 0.22 * mirror,
      };
    case "jump-kick":
      return {
        x: Math.sin(loop) * 0.18 * mirror,
        y: Math.max(0, Math.sin(loop)) * 0.32 + pulse * 0.16,
        z: Math.cos(loop) * 0.18,
        rotationY: Math.sin(loop) * 0.22 * mirror,
        rotationZ: Math.max(0, Math.sin(loop)) * 0.24 * mirror,
      };
    case "freeze-pose":
      return {
        x: Math.sin(loop) * 0.05 * mirror,
        y: pulse * 0.07,
        z: 0,
        rotationY: 0.32 * mirror,
        rotationZ: 0.18 * mirror,
      };
    default:
      return {
        x: 0,
        y: pulse * 0.08,
        z: 0,
        rotationY: 0,
        rotationZ: 0,
      };
  }
}
