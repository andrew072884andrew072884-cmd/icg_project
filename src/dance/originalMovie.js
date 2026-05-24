import * as THREE from "three";

export const ORIGINAL_AUDIO_URL = "/assets/original/dance.mp3";
export const ORIGINAL_AUDIO_NAME = "Original VR Dance Demo - dance.mp3";

export const ORIGINAL_WORLD_SCALE = 0.34;

export const ORIGINAL_STAGE_POSITION = [0, 0.02, 0];

export const ORIGINAL_STAGE_ROTATION_Y = Math.PI;

export const ORIGINAL_DANCER_BASE_POSITIONS = {
  lead: [10, 12.5, 0],
  partner: [-10, 11.5, 0],
};

export const ORIGINAL_MOVIE_URLS = {
  lead: "/assets/original/MMOVIE.TXT",
  partner: "/assets/original/FMOVIE.TXT",
};

export const ORIGINAL_MOVIE_FRAME_COUNT = 512;

const ORIGINAL_ROOT_LEAN_SCALE = 0.16;
const ORIGINAL_INTERACTION_PHRASES = new Set([5, 6, 7, 12, 13, 14]);
const ORIGINAL_INTERACTION_MIN_SEPARATION = 1.35;
const ORIGINAL_INTERACTION_LEAN_SCALE = 0.04;
const ORIGINAL_INTERACTION_YAW_BLEND = 0.48;
const ORIGINAL_PUPPET_TARGET_MIRROR_X = 1;
const ORIGINAL_PUPPET_TARGET_MIRROR_Z = -1;
const ORIGINAL_GROUNDED_LEG_MIN_REACH = 0.9;
const ORIGINAL_CLOSING_LEG_MIN_REACH = 0.97;
const ORIGINAL_LIFT_VERTICAL_SCALE = 0.26;
const ORIGINAL_LIFT_VERTICAL_BASE = 2.15;
const ORIGINAL_LIFT_MIN_BODY_Y = 2;

const defaultOriginalRetargetProfile = {
  targetMirrorX: ORIGINAL_PUPPET_TARGET_MIRROR_X,
  targetMirrorZ: ORIGINAL_PUPPET_TARGET_MIRROR_Z,
  modelRightSignMultiplier: 1,
  legMinReach: ORIGINAL_GROUNDED_LEG_MIN_REACH,
  liftVerticalBase: ORIGINAL_LIFT_VERTICAL_BASE,
  liftVerticalScale: ORIGINAL_LIFT_VERTICAL_SCALE,
  liftPositionOffset: [0, 0, 0],
  liftRotationXOffset: Math.PI,
  liftRotationYOffset: 0,
  liftRotationZOffset: 0,
};

const originalRetargetProfiles = {
  1: {
    targetMirrorX: -1,
    modelRightSignMultiplier: -1,
    legMinReach: 0.94,
  },
  2: {
    targetMirrorX: -1,
    modelRightSignMultiplier: -1,
    legMinReach: 0.94,
  },
  3: {
    targetMirrorX: -1,
    modelRightSignMultiplier: -1,
    legMinReach: 0.94,
  },
  5: {
    liftVerticalBase: 2.48,
    liftVerticalScale: 0.3,
    liftPositionOffset: [0, 0.24, -0.16],
    liftRotationZOffset: Math.PI,
  },
  6: {
    liftVerticalBase: 2.72,
    liftVerticalScale: 0.31,
    liftPositionOffset: [0, 0.32, -0.2],
    liftRotationZOffset: Math.PI,
  },
  7: {
    liftVerticalBase: 2.32,
    liftVerticalScale: 0.28,
    liftPositionOffset: [0, 0.18, -0.12],
    liftRotationZOffset: Math.PI,
  },
  12: {
    liftVerticalBase: 2.48,
    liftVerticalScale: 0.3,
    liftPositionOffset: [0, 0.24, -0.16],
    liftRotationZOffset: Math.PI,
  },
  13: {
    liftVerticalBase: 2.72,
    liftVerticalScale: 0.31,
    liftPositionOffset: [0, 0.32, -0.2],
    liftRotationZOffset: Math.PI,
  },
  14: {
    liftVerticalBase: 2.32,
    liftVerticalScale: 0.28,
    liftPositionOffset: [0, 0.18, -0.12],
    liftRotationZOffset: Math.PI,
  },
};

function getOriginalRetargetProfile(sourcePhrase) {
  return {
    ...defaultOriginalRetargetProfile,
    ...(originalRetargetProfiles[sourcePhrase] ?? {}),
  };
}

export const originalChannelOffsets = {
  bodyT: 0,
  bodyR: 3,
  rightUpperArm: 6,
  rightLowerArm: 9,
  leftUpperArm: 12,
  leftLowerArm: 15,
  rightUpperLeg: 18,
  rightLowerLeg: 21,
  leftUpperLeg: 24,
  leftLowerLeg: 27,
  rightFoot: 30,
  leftFoot: 31,
};

const originalLimbChannels = {
  rightUpperArm: { offset: originalChannelOffsets.rightUpperArm, size: 3 },
  rightLowerArm: { offset: originalChannelOffsets.rightLowerArm, size: 3 },
  leftUpperArm: { offset: originalChannelOffsets.leftUpperArm, size: 3 },
  leftLowerArm: { offset: originalChannelOffsets.leftLowerArm, size: 3 },
  rightUpperLeg: { offset: originalChannelOffsets.rightUpperLeg, size: 3 },
  rightLowerLeg: { offset: originalChannelOffsets.rightLowerLeg, size: 3 },
  leftUpperLeg: { offset: originalChannelOffsets.leftUpperLeg, size: 3 },
  leftLowerLeg: { offset: originalChannelOffsets.leftLowerLeg, size: 3 },
  rightFoot: { offset: originalChannelOffsets.rightFoot, size: 1 },
  leftFoot: { offset: originalChannelOffsets.leftFoot, size: 1 },
};

const originalPuppetJointSpecs = {
  lead: {
    arm: {
      shoulderX: 2.5,
      shoulderY: 1,
      elbowY: -2,
      handY: -5,
    },
    leg: {
      hipX: 1,
      hipY: -4,
      kneeY: -7,
      ankleY: -12,
      ankleZ: 0.5,
      toeY: -0.05,
      toeZ: -2.45,
    },
  },
  partner: {
    arm: {
      shoulderX: 2,
      shoulderY: 1,
      elbowY: -2,
      handY: -5,
    },
    leg: {
      hipX: 1,
      hipY: -4,
      kneeY: -7,
      ankleY: -10.5,
      ankleZ: 0,
      toeY: -0.5,
      toeZ: -1.8,
    },
  },
};

const reusableEuler = new THREE.Euler(0, 0, 0, "XYZ");
const reusableQuaternion = new THREE.Quaternion();
const reusableQuaternionA = new THREE.Quaternion();
const reusableQuaternionB = new THREE.Quaternion();
const reusableQuaternionC = new THREE.Quaternion();
const reusableQuaternionD = new THREE.Quaternion();
const reusableVectorA = new THREE.Vector3();
const reusableVectorB = new THREE.Vector3();
const reusableVectorC = new THREE.Vector3();
const reusableVectorD = new THREE.Vector3();
const reusableVectorE = new THREE.Vector3();
const reusableVectorF = new THREE.Vector3();
const reusableVectorG = new THREE.Vector3();
const reusableVectorH = new THREE.Vector3();
const reusableMatrixA = new THREE.Matrix4();
const reusableMatrixB = new THREE.Matrix4();

let originalMoviePromise = null;

export function parseOriginalMovieText(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.match(/-?\d+/g)?.map(Number) ?? [])
    .filter((frame) => frame.length === 32);
}

function interpolateFrame(startFrame, endFrame, alpha) {
  return startFrame.map((value, index) => value + (endFrame[index] - value) * alpha);
}

function degToRad(value) {
  return ((Number.isFinite(value) ? value : 0) * Math.PI) / 180;
}

function normalizeDegrees(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return ((((value + 180) % 360) + 360) % 360) - 180;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, alpha) {
  return start + (end - start) * alpha;
}

function smoothstep(value) {
  const x = clamp(value, 0, 1);

  return x * x * (3 - 2 * x);
}

function otherSlotId(slotId) {
  return slotId === "partner" ? "lead" : "partner";
}

function getBodyTranslation(frame) {
  return [
    frame[originalChannelOffsets.bodyT] ?? 0,
    frame[originalChannelOffsets.bodyT + 1] ?? 0,
    frame[originalChannelOffsets.bodyT + 2] ?? 0,
  ];
}

function getBodyRotation(frame) {
  return [
    normalizeDegrees(frame[originalChannelOffsets.bodyR] ?? 0),
    normalizeDegrees(frame[originalChannelOffsets.bodyR + 1] ?? 0),
    normalizeDegrees(frame[originalChannelOffsets.bodyR + 2] ?? 0),
  ];
}

function sliceOriginalFrame(frame, offset, size) {
  return Array.from({ length: size }, (_, index) => frame[offset + index] ?? 0);
}

function getOriginalLimbRotations(frame) {
  return Object.fromEntries(
    Object.entries(originalLimbChannels).map(([channelName, channel]) => [
      channelName,
      sliceOriginalFrame(frame, channel.offset, channel.size),
    ]),
  );
}

function mapOriginalBodyPosition(
  frame,
  basePosition,
  includeVertical = false,
  retargetProfile = defaultOriginalRetargetProfile,
) {
  const [bodyX, bodyY, bodyZ] = getBodyTranslation(frame);
  const [offsetX, offsetY, offsetZ] = retargetProfile.liftPositionOffset ?? [0, 0, 0];
  const verticalOffset = includeVertical
    ? retargetProfile.liftVerticalBase +
      Math.max(0, bodyY * retargetProfile.liftVerticalScale)
    : 0;

  return [
    basePosition[0] - bodyX * ORIGINAL_WORLD_SCALE + (includeVertical ? offsetX : 0),
    basePosition[1] + verticalOffset + (includeVertical ? offsetY : 0),
    basePosition[2] - bodyZ * ORIGINAL_WORLD_SCALE + (includeVertical ? offsetZ : 0),
  ];
}

function stabilizeInteractionPositions(slotId, positions, modulePhase) {
  const leadPosition = positions.lead;
  const partnerPosition = positions.partner;

  if (!leadPosition || !partnerPosition) {
    return positions[slotId] ?? null;
  }

  const centerX = (leadPosition[0] + partnerPosition[0]) * 0.5;
  const currentSeparation = Math.abs(partnerPosition[0] - leadPosition[0]);

  if (currentSeparation >= ORIGINAL_INTERACTION_MIN_SEPARATION) {
    return positions[slotId];
  }

  const orderDirection = partnerPosition[0] >= leadPosition[0] ? 1 : -1;
  const moduleEase = smoothstep(Math.sin(modulePhase * Math.PI));
  const targetSeparation = lerp(
    ORIGINAL_INTERACTION_MIN_SEPARATION * 0.86,
    ORIGINAL_INTERACTION_MIN_SEPARATION,
    moduleEase,
  );
  const safeLeadX = centerX - orderDirection * targetSeparation * 0.5;
  const safePartnerX = centerX + orderDirection * targetSeparation * 0.5;
  const leadZ = leadPosition[2] - 0.12 * moduleEase;
  const partnerZ = partnerPosition[2] + 0.12 * moduleEase;

  return slotId === "lead"
    ? [safeLeadX, leadPosition[1], leadZ]
    : [safePartnerX, partnerPosition[1], partnerZ];
}

function getInteractionFacingRotation(positionX, defaultRotation) {
  if (Math.abs(positionX) < 0.08) {
    return defaultRotation;
  }

  return -Math.sign(positionX) * 0.32;
}

function normalizeRigNodeName(value) {
  const nodeName = String(value ?? "");
  const namespaceIndex = nodeName.lastIndexOf(":");
  const withoutNamespace =
    namespaceIndex >= 0 ? nodeName.slice(namespaceIndex + 1) : nodeName;
  const withoutMixamoPrefix = withoutNamespace.replace(/^mixamorig\d*/i, "");

  return withoutMixamoPrefix.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findBoneByNames(boneMap, names) {
  return names.map((name) => boneMap.get(normalizeRigNodeName(name))).find(Boolean) ?? null;
}

function createTargetBone(name, bone) {
  return bone
    ? {
        name,
        bone,
        neutralQuaternion: bone.quaternion.clone(),
      }
    : null;
}

function alignBoneToWorldDirection(parentTarget, childTarget, desiredDirection, blend = 1) {
  const bone = parentTarget?.bone;
  const child = childTarget?.bone;

  if (!bone || !child || !desiredDirection || desiredDirection.lengthSq() < 0.000001) {
    return;
  }

  bone.updateWorldMatrix(true, false);
  child.updateWorldMatrix(true, false);

  const bonePosition = bone.getWorldPosition(reusableVectorA);
  const childPosition = child.getWorldPosition(reusableVectorB);
  const currentDirection = reusableVectorC
    .copy(childPosition)
    .sub(bonePosition)
    .normalize();
  const targetDirection = reusableVectorD.copy(desiredDirection).normalize();

  if (currentDirection.lengthSq() < 0.000001 || targetDirection.lengthSq() < 0.000001) {
    return;
  }

  const currentWorldQuaternion = bone.getWorldQuaternion(reusableQuaternionA);
  const targetWorldQuaternion = reusableQuaternionB
    .setFromUnitVectors(currentDirection, targetDirection)
    .multiply(currentWorldQuaternion);
  const parentWorldQuaternion = bone.parent
    ? bone.parent.getWorldQuaternion(reusableQuaternionC)
    : reusableQuaternionC.identity();
  const targetLocalQuaternion = reusableQuaternionD
    .copy(parentWorldQuaternion)
    .invert()
    .multiply(targetWorldQuaternion);

  bone.quaternion.copy(bone.quaternion).slerp(targetLocalQuaternion, clamp(blend, 0, 1));
  bone.updateMatrixWorld(true);
}

function getOriginalRotationMatrix(values = []) {
  reusableEuler.set(
    degToRad(values[0] ?? 0),
    degToRad(values[1] ?? 0),
    degToRad(values[2] ?? 0),
    "XYZ",
  );

  return reusableMatrixA.makeRotationFromEuler(reusableEuler).clone();
}

function getOriginalPuppetSpec(slotId) {
  return originalPuppetJointSpecs[slotId] ?? originalPuppetJointSpecs.lead;
}

function setVirtualJointTarget(targets, key, matrix, coordinates) {
  targets[key] = new THREE.Vector3(...coordinates).applyMatrix4(matrix);
}

function createVirtualJointMatrix(parentMatrix, position, rotationValues = null) {
  const matrix = parentMatrix
    .clone()
    .multiply(reusableMatrixB.makeTranslation(position[0], position[1], position[2]));

  if (rotationValues) {
    matrix.multiply(getOriginalRotationMatrix(rotationValues));
  }

  return matrix;
}

function buildVirtualArmTargets(targets, side, armSpec, upperRotation, lowerRotation, modelRightSign) {
  const sideSign = side === "right" ? modelRightSign : -modelRightSign;
  const shoulderKey = `${side}Shoulder`;
  const elbowKey = `${side}Elbow`;
  const handKey = `${side}Hand`;
  const rootMatrix = reusableMatrixB.identity().clone();
  const shoulderPosition = [sideSign * armSpec.shoulderX, armSpec.shoulderY, 0];
  const elbowPosition = [0, armSpec.elbowY - armSpec.shoulderY, 0];
  const handPosition = [0, armSpec.handY - armSpec.elbowY, 0];
  const upperArmMatrix = createVirtualJointMatrix(rootMatrix, shoulderPosition, upperRotation);

  setVirtualJointTarget(targets, shoulderKey, rootMatrix, shoulderPosition);
  setVirtualJointTarget(targets, elbowKey, upperArmMatrix, elbowPosition);

  const lowerArmMatrix = createVirtualJointMatrix(upperArmMatrix, elbowPosition, lowerRotation);

  setVirtualJointTarget(targets, handKey, lowerArmMatrix, handPosition);
}

function buildVirtualLegTargets(targets, side, legSpec, upperRotation, lowerRotation, footRotationDegrees, modelRightSign) {
  const sideSign = side === "right" ? modelRightSign : -modelRightSign;
  const hipKey = `${side}Hip`;
  const kneeKey = `${side}Knee`;
  const ankleKey = `${side}Ankle`;
  const toeKey = `${side}Toe`;
  const rootMatrix = reusableMatrixB.identity().clone();
  const hipPosition = [sideSign * legSpec.hipX, legSpec.hipY, 0];
  const kneePosition = [0, legSpec.kneeY - legSpec.hipY, 0];
  const anklePosition = [0, legSpec.ankleY - legSpec.kneeY, legSpec.ankleZ];
  const toePosition = [0, legSpec.toeY, legSpec.toeZ];
  const upperLegMatrix = createVirtualJointMatrix(rootMatrix, hipPosition, upperRotation);

  setVirtualJointTarget(targets, hipKey, rootMatrix, hipPosition);
  setVirtualJointTarget(targets, kneeKey, upperLegMatrix, kneePosition);

  const lowerLegMatrix = createVirtualJointMatrix(upperLegMatrix, kneePosition, lowerRotation);

  setVirtualJointTarget(targets, ankleKey, lowerLegMatrix, anklePosition);

  const footMatrix = createVirtualJointMatrix(lowerLegMatrix, anklePosition, [
    footRotationDegrees ?? 0,
    0,
    0,
  ]);

  setVirtualJointTarget(targets, toeKey, footMatrix, toePosition);
}

function buildVirtualOriginalJointTargets(originalPose, puppetRig) {
  const limbRotations = originalPose?.limbs;
  const spec = getOriginalPuppetSpec(originalPose?.slotId);
  const retargetProfile = getOriginalRetargetProfile(originalPose?.sourcePhrase);
  const modelRightSign =
    (puppetRig?.modelRightSign ?? -1) * retargetProfile.modelRightSignMultiplier;

  if (!limbRotations) {
    return null;
  }

  const targets = {
    __profile: retargetProfile,
  };

  buildVirtualArmTargets(
    targets,
    "right",
    spec.arm,
    limbRotations.rightUpperArm,
    limbRotations.rightLowerArm,
    modelRightSign,
  );
  buildVirtualArmTargets(
    targets,
    "left",
    spec.arm,
    limbRotations.leftUpperArm,
    limbRotations.leftLowerArm,
    modelRightSign,
  );
  buildVirtualLegTargets(
    targets,
    "right",
    spec.leg,
    limbRotations.rightUpperLeg,
    limbRotations.rightLowerLeg,
    limbRotations.rightFoot?.[0],
    modelRightSign,
  );
  buildVirtualLegTargets(
    targets,
    "left",
    spec.leg,
    limbRotations.leftUpperLeg,
    limbRotations.leftLowerLeg,
    limbRotations.leftFoot?.[0],
    modelRightSign,
  );

  return targets;
}

function getTargetWorldDirection(root, targets, fromKey, toKey) {
  const fromTarget = targets?.[fromKey];
  const toTarget = targets?.[toKey];

  if (!fromTarget || !toTarget) {
    return null;
  }

  const direction = reusableVectorA.copy(toTarget).sub(fromTarget);

  if (direction.lengthSq() < 0.000001) {
    return null;
  }

  const retargetProfile = targets.__profile ?? defaultOriginalRetargetProfile;

  direction.x *= retargetProfile.targetMirrorX;
  direction.z *= retargetProfile.targetMirrorZ;

  if (root) {
    root.getWorldQuaternion(reusableQuaternionB);
    direction.applyQuaternion(reusableQuaternionB);
  }

  return direction.clone().normalize();
}

function getTargetWorldDelta(root, targets, fromKey, toKey) {
  const fromTarget = targets?.[fromKey];
  const toTarget = targets?.[toKey];

  if (!fromTarget || !toTarget) {
    return null;
  }

  const delta = toTarget.clone().sub(fromTarget);

  const retargetProfile = targets.__profile ?? defaultOriginalRetargetProfile;

  delta.x *= retargetProfile.targetMirrorX;
  delta.z *= retargetProfile.targetMirrorZ;

  if (root) {
    root.getWorldQuaternion(reusableQuaternionB);
    delta.applyQuaternion(reusableQuaternionB);
  }

  return delta;
}

function getBoneWorldPosition(target) {
  if (!target?.bone) {
    return null;
  }

  return target.bone.getWorldPosition(new THREE.Vector3());
}

function getStablePoleDirection(start, middle, targetDirection, sourceMidDelta) {
  const poleDirection = sourceMidDelta
    ? sourceMidDelta
        .clone()
        .sub(targetDirection.clone().multiplyScalar(sourceMidDelta.dot(targetDirection)))
    : new THREE.Vector3();

  if (poleDirection.lengthSq() > 0.000001) {
    return poleDirection.normalize();
  }

  if (middle) {
    poleDirection
      .copy(middle)
      .sub(start)
      .sub(targetDirection.clone().multiplyScalar(middle.clone().sub(start).dot(targetDirection)));

    if (poleDirection.lengthSq() > 0.000001) {
      return poleDirection.normalize();
    }
  }

  poleDirection.crossVectors(targetDirection, reusableVectorB.set(0, 1, 0));

  if (poleDirection.lengthSq() < 0.000001) {
    poleDirection.crossVectors(targetDirection, reusableVectorC.set(1, 0, 0));
  }

  return poleDirection.normalize();
}

function solveTwoBoneMidpoint(start, end, poleDirection, upperLength, lowerLength) {
  const targetVector = end.clone().sub(start);
  const targetLength = targetVector.length();

  if (
    targetLength < 0.000001 ||
    upperLength < 0.000001 ||
    lowerLength < 0.000001
  ) {
    return null;
  }

  const targetDirection = targetVector.clone().normalize();
  const maxReach = Math.max(0.001, upperLength + lowerLength - 0.001);
  const minReach = Math.max(0.001, Math.abs(upperLength - lowerLength) + 0.001);
  const distance = clamp(targetLength, minReach, maxReach);
  const alongDistance = clamp(
    (upperLength * upperLength - lowerLength * lowerLength + distance * distance) /
      (2 * distance),
    0,
    upperLength,
  );
  const poleDistance = Math.sqrt(Math.max(0, upperLength * upperLength - alongDistance * alongDistance));

  return start
    .clone()
    .add(targetDirection.multiplyScalar(alongDistance))
    .add(poleDirection.clone().multiplyScalar(poleDistance));
}

function alignTwoBoneChainToTargets({
  upperTarget,
  middleTarget,
  endTarget,
  root,
  targets,
  sourceStartKey,
  sourceMiddleKey,
  sourceEndKey,
  blend,
  minReachRatio = 0.02,
}) {
  if (!upperTarget?.bone || !middleTarget?.bone || !endTarget?.bone) {
    return;
  }

  upperTarget.bone.updateWorldMatrix(true, false);
  middleTarget.bone.updateWorldMatrix(true, false);
  endTarget.bone.updateWorldMatrix(true, false);

  const start = getBoneWorldPosition(upperTarget);
  const middle = getBoneWorldPosition(middleTarget);
  const end = getBoneWorldPosition(endTarget);
  const sourceUpperDelta = getTargetWorldDelta(root, targets, sourceStartKey, sourceMiddleKey);
  const sourceLowerDelta = getTargetWorldDelta(root, targets, sourceMiddleKey, sourceEndKey);
  const sourceEndDelta = getTargetWorldDelta(root, targets, sourceStartKey, sourceEndKey);

  if (!start || !middle || !end || !sourceUpperDelta || !sourceLowerDelta || !sourceEndDelta) {
    return;
  }

  const upperLength = start.distanceTo(middle);
  const lowerLength = middle.distanceTo(end);
  const sourceChainLength = sourceUpperDelta.length() + sourceLowerDelta.length();
  const targetDirection = sourceEndDelta.lengthSq() > 0.000001
    ? sourceEndDelta.clone().normalize()
    : end.clone().sub(start).normalize();

  if (
    upperLength < 0.000001 ||
    lowerLength < 0.000001 ||
    sourceChainLength < 0.000001 ||
    targetDirection.lengthSq() < 0.000001
  ) {
    return;
  }

  const reachRatio = clamp(
    sourceEndDelta.length() / sourceChainLength,
    minReachRatio,
    0.999,
  );
  const targetDistance = reachRatio * (upperLength + lowerLength);
  const desiredEnd = start.clone().add(targetDirection.clone().multiplyScalar(targetDistance));
  const poleDirection = getStablePoleDirection(
    start,
    middle,
    targetDirection,
    sourceUpperDelta,
  );
  const desiredMiddle = solveTwoBoneMidpoint(
    start,
    desiredEnd,
    poleDirection,
    upperLength,
    lowerLength,
  );

  if (!desiredMiddle) {
    return;
  }

  alignBoneToWorldDirection(
    upperTarget,
    middleTarget,
    desiredMiddle.sub(start),
    blend,
  );

  middleTarget.bone.updateWorldMatrix(true, false);

  const updatedMiddle = getBoneWorldPosition(middleTarget);

  if (updatedMiddle) {
    alignBoneToWorldDirection(
      middleTarget,
      endTarget,
      desiredEnd.sub(updatedMiddle),
      blend,
    );
  }
}

function resetPuppetRig(puppetRig) {
  Object.values(puppetRig ?? {}).forEach((target) => {
    if (target?.bone && target?.neutralQuaternion) {
      target.bone.quaternion.copy(target.neutralQuaternion);
      target.bone.updateMatrixWorld(true);
    }
  });
}

function inferModelRightSign(rightTarget, leftTarget) {
  const rightBone = rightTarget?.bone;
  const leftBone = leftTarget?.bone;

  if (!rightBone || !leftBone) {
    return -1;
  }

  rightBone.updateWorldMatrix(true, false);
  leftBone.updateWorldMatrix(true, false);

  const rightPosition = rightBone.getWorldPosition(reusableVectorE);
  const leftPosition = leftBone.getWorldPosition(reusableVectorF);
  const deltaX = rightPosition.x - leftPosition.x;

  if (Math.abs(deltaX) < 0.000001) {
    return -1;
  }

  return Math.sign(deltaX);
}

export function createOriginalPuppetRig(scene) {
  const boneMap = new Map();

  scene.traverse((child) => {
    if (!child.isBone || !child.name) {
      return;
    }

    const normalizedName = normalizeRigNodeName(child.name);

    if (!boneMap.has(normalizedName)) {
      boneMap.set(normalizedName, child);
    }
  });

  const rig = {
    leftShoulder: createTargetBone("leftShoulder", findBoneByNames(boneMap, ["leftShoulder"])),
    rightShoulder: createTargetBone("rightShoulder", findBoneByNames(boneMap, ["rightShoulder"])),
    leftArm: createTargetBone("leftArm", findBoneByNames(boneMap, ["leftArm"])),
    rightArm: createTargetBone("rightArm", findBoneByNames(boneMap, ["rightArm"])),
    leftForeArm: createTargetBone("leftForeArm", findBoneByNames(boneMap, ["leftForeArm"])),
    rightForeArm: createTargetBone("rightForeArm", findBoneByNames(boneMap, ["rightForeArm"])),
    leftHand: createTargetBone("leftHand", findBoneByNames(boneMap, ["leftHand"])),
    rightHand: createTargetBone("rightHand", findBoneByNames(boneMap, ["rightHand"])),
    leftUpLeg: createTargetBone("leftUpLeg", findBoneByNames(boneMap, ["leftUpLeg"])),
    rightUpLeg: createTargetBone("rightUpLeg", findBoneByNames(boneMap, ["rightUpLeg"])),
    leftLeg: createTargetBone("leftLeg", findBoneByNames(boneMap, ["leftLeg"])),
    rightLeg: createTargetBone("rightLeg", findBoneByNames(boneMap, ["rightLeg"])),
    leftFoot: createTargetBone("leftFoot", findBoneByNames(boneMap, ["leftFoot"])),
    rightFoot: createTargetBone("rightFoot", findBoneByNames(boneMap, ["rightFoot"])),
    leftToeBase: createTargetBone("leftToeBase", findBoneByNames(boneMap, ["leftToeBase", "leftToe_End"])),
    rightToeBase: createTargetBone("rightToeBase", findBoneByNames(boneMap, ["rightToeBase", "rightToe_End"])),
  };

  rig.modelRightSign = inferModelRightSign(rig.rightUpLeg ?? rig.rightArm, rig.leftUpLeg ?? rig.leftArm);

  return rig;
}

export function applyOriginalPuppetPose(puppetRig, originalPose, root, blend = 1) {
  if (!puppetRig || !originalPose?.limbs) {
    return;
  }

  resetPuppetRig(puppetRig);
  root?.updateMatrixWorld(true);

  const targets = buildVirtualOriginalJointTargets(originalPose, puppetRig);
  const retargetProfile = targets?.__profile ?? defaultOriginalRetargetProfile;
  const groundedLegMinReach =
    originalPose.sourcePhrase >= 15
      ? ORIGINAL_CLOSING_LEG_MIN_REACH
      : retargetProfile.legMinReach;
  const legMinReachRatio = originalPose.isLiftedPose ? 0.08 : groundedLegMinReach;

  alignTwoBoneChainToTargets(
    {
      upperTarget: puppetRig.rightArm,
      middleTarget: puppetRig.rightForeArm,
      endTarget: puppetRig.rightHand,
      root,
      targets,
      sourceStartKey: "rightShoulder",
      sourceMiddleKey: "rightElbow",
      sourceEndKey: "rightHand",
      blend,
    },
  );
  alignTwoBoneChainToTargets(
    {
      upperTarget: puppetRig.leftArm,
      middleTarget: puppetRig.leftForeArm,
      endTarget: puppetRig.leftHand,
      root,
      targets,
      sourceStartKey: "leftShoulder",
      sourceMiddleKey: "leftElbow",
      sourceEndKey: "leftHand",
      blend,
    },
  );
  alignTwoBoneChainToTargets(
    {
      upperTarget: puppetRig.rightUpLeg,
      middleTarget: puppetRig.rightLeg,
      endTarget: puppetRig.rightFoot,
      root,
      targets,
      sourceStartKey: "rightHip",
      sourceMiddleKey: "rightKnee",
      sourceEndKey: "rightAnkle",
      blend,
      minReachRatio: legMinReachRatio,
    },
  );
  alignTwoBoneChainToTargets(
    {
      upperTarget: puppetRig.leftUpLeg,
      middleTarget: puppetRig.leftLeg,
      endTarget: puppetRig.leftFoot,
      root,
      targets,
      sourceStartKey: "leftHip",
      sourceMiddleKey: "leftKnee",
      sourceEndKey: "leftAnkle",
      blend,
      minReachRatio: legMinReachRatio,
    },
  );

  alignBoneToWorldDirection(
    puppetRig.rightFoot,
    puppetRig.rightToeBase,
    getTargetWorldDirection(root, targets, "rightAnkle", "rightToe"),
    blend * 0.72,
  );
  alignBoneToWorldDirection(
    puppetRig.leftFoot,
    puppetRig.leftToeBase,
    getTargetWorldDirection(root, targets, "leftAnkle", "leftToe"),
    blend * 0.72,
  );
}

export function sampleOriginalMovieFrame(frames, sourceFrames, modulePhase) {
  if (!frames?.length) {
    return null;
  }

  const [sourceStart = 1, sourceEnd = ORIGINAL_MOVIE_FRAME_COUNT] = sourceFrames ?? [];
  const startIndex = Math.max(0, Math.min(frames.length - 1, sourceStart - 1));
  const endIndex = Math.max(startIndex, Math.min(frames.length - 1, sourceEnd - 1));
  const localPhase = Number.isFinite(modulePhase) ? modulePhase : 0;
  const framePosition = startIndex + (endIndex - startIndex) * localPhase;
  const lowerIndex = Math.floor(framePosition);
  const upperIndex = Math.min(endIndex, lowerIndex + 1);
  const alpha = framePosition - lowerIndex;

  if (lowerIndex === upperIndex) {
    return frames[lowerIndex];
  }

  return interpolateFrame(frames[lowerIndex], frames[upperIndex], alpha);
}

export async function loadOriginalMovieData() {
  if (!originalMoviePromise) {
    originalMoviePromise = Promise.all(
      Object.entries(ORIGINAL_MOVIE_URLS).map(async ([slotId, url]) => {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to load original movie data: ${url}`);
        }

        const text = await response.text();
        return [slotId, parseOriginalMovieText(text)];
      }),
    ).then((entries) => Object.fromEntries(entries));
  }

  return originalMoviePromise;
}

export function getOriginalRootMotionPose({
  movieData,
  slotId,
  activeMove,
  modulePhase,
  basePosition,
  baseRotationY,
  slotBasePositions,
}) {
  if (!activeMove?.id?.startsWith("original-latin-")) {
    return null;
  }

  const frame = sampleOriginalMovieFrame(
    movieData?.[slotId],
    activeMove.sourceFrames,
    modulePhase,
  );

  if (!frame || !basePosition) {
    return null;
  }

  const [bodyPitch, bodyYaw, bodyRoll] = getBodyRotation(frame);
  const retargetProfile = getOriginalRetargetProfile(activeMove.sourcePhrase);
  const isInteractionPhrase = ORIGINAL_INTERACTION_PHRASES.has(activeMove.sourcePhrase);
  const [, bodyY] = getBodyTranslation(frame);
  const isLiftedPose =
    isInteractionPhrase &&
    slotId === "partner" &&
    bodyY >= ORIGINAL_LIFT_MIN_BODY_Y;
  const rawPosition = mapOriginalBodyPosition(
    frame,
    basePosition,
    isLiftedPose,
    retargetProfile,
  );
  let position = rawPosition;
  let rotationX = degToRad(bodyPitch) * ORIGINAL_ROOT_LEAN_SCALE;
  let rotationY = baseRotationY + degToRad(bodyYaw);
  let rotationZ = degToRad(bodyRoll) * ORIGINAL_ROOT_LEAN_SCALE;

  if (isInteractionPhrase && slotBasePositions) {
    const pairedSlotId = otherSlotId(slotId);
    const pairedFrame = sampleOriginalMovieFrame(
      movieData?.[pairedSlotId],
      activeMove.sourceFrames,
      modulePhase,
    );
    const pairedBasePosition = slotBasePositions[pairedSlotId];
    const pairedBodyY = pairedFrame ? getBodyTranslation(pairedFrame)[1] : 0;
    const pairedIsLiftedPose =
      isInteractionPhrase &&
      pairedSlotId === "partner" &&
      pairedBodyY >= ORIGINAL_LIFT_MIN_BODY_Y;
    const pairedPosition =
      pairedFrame && pairedBasePosition
        ? mapOriginalBodyPosition(
            pairedFrame,
            pairedBasePosition,
            pairedIsLiftedPose,
            getOriginalRetargetProfile(activeMove.sourcePhrase),
          )
        : null;

    position = stabilizeInteractionPositions(
      slotId,
      {
        [slotId]: rawPosition,
        [pairedSlotId]: pairedPosition,
      },
      modulePhase,
    );
    if (isLiftedPose) {
      rotationX = degToRad(bodyPitch) + retargetProfile.liftRotationXOffset;
      rotationY = baseRotationY + degToRad(bodyYaw) + retargetProfile.liftRotationYOffset;
      rotationZ = degToRad(bodyRoll) + retargetProfile.liftRotationZOffset;
    } else {
      rotationX = degToRad(bodyPitch) * ORIGINAL_INTERACTION_LEAN_SCALE;
      rotationY = lerp(
        rotationY,
        getInteractionFacingRotation(position[0], baseRotationY),
        ORIGINAL_INTERACTION_YAW_BLEND,
      );
      rotationZ = degToRad(bodyRoll) * ORIGINAL_INTERACTION_LEAN_SCALE;
    }
  }

  return {
    slotId,
    position,
    isLiftedPose,
    rotationX,
    rotationY,
    rotationZ,
    limbs: getOriginalLimbRotations(frame),
    sourcePhrase: activeMove.sourcePhrase,
    modulePhase,
  };
}
