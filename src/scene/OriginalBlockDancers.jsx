import { useEffect, useMemo, useState } from "react";
import {
  ORIGINAL_DANCER_BASE_POSITIONS,
  ORIGINAL_STAGE_POSITION,
  ORIGINAL_STAGE_ROTATION_Y,
  ORIGINAL_WORLD_SCALE,
  loadOriginalMovieData,
  originalChannelOffsets,
  sampleOriginalMovieFrame,
} from "../dance/originalMovie";

const ZERO_FRAME = Array.from({ length: 32 }, () => 0);

const dancerSpecs = {
  lead: {
    basePosition: ORIGINAL_DANCER_BASE_POSITIONS.lead,
    colors: {
      skin: "#ffd0a5",
      torso: "#f5f7ff",
      pelvis: "#07080c",
      legs: "#050507",
      shoes: "#050507",
    },
    head: { position: [0, 3.5, 0], radius: 1.2 },
    bodyParts: [
      { position: [0, 0, 0], scale: [3, 3, 2], colorKey: "torso" },
      { position: [0, -3, 0], scale: [3, 3, 2], colorKey: "pelvis" },
    ],
    arm: {
      shoulderX: 2.5,
      shoulderY: 1,
      elbowY: -2,
      upperCenterY: 0,
      lowerCenterY: -3,
      fistY: -5,
      upperScale: [1.2, 3, 1.2],
      lowerScale: [1, 3, 1],
      fistRadius: 0.8,
      upperColorKey: "torso",
      lowerColorKey: "skin",
    },
    leg: {
      hipX: 1,
      hipY: -4,
      kneeY: -7,
      upperCenterY: -6.25,
      lowerCenterY: -9.75,
      ankleY: -12,
      ankleZ: 0.5,
      footCenterY: -12,
      footCenterZ: -0.5,
      upperScale: [1.5, 3.5, 2],
      lowerScale: [1.5, 3.5, 2],
      footScale: [1.5, 1, 3],
      upperColorKey: "legs",
      lowerColorKey: "legs",
      footColorKey: "shoes",
    },
  },
  partner: {
    basePosition: ORIGINAL_DANCER_BASE_POSITIONS.partner,
    colors: {
      skin: "#ffd0a5",
      torso: "#ff294f",
      pelvis: "#ff294f",
      legs: "#ffd0a5",
      shoes: "#ffe44d",
    },
    head: { position: [0, 2.7, 0], radius: 1 },
    bodyParts: [
      { position: [0, 0, 0], scale: [2.625, 2.625, 1.8], colorKey: "torso" },
      { position: [0, -2.625, 0], scale: [2.2, 2.625, 1.6], colorKey: "pelvis" },
      { position: [0, -4.2, 0], radius: 0.7, colorKey: "pelvis", shape: "sphere" },
    ],
    arm: {
      shoulderX: 2,
      shoulderY: 1,
      elbowY: -2,
      upperCenterY: 0,
      lowerCenterY: -2.625,
      fistY: -5,
      upperScale: [0.8, 2.625, 1],
      lowerScale: [0.7, 2.625, 0.9],
      fistRadius: 0.7,
      upperColorKey: "skin",
      lowerColorKey: "skin",
    },
    leg: {
      hipX: 1,
      hipY: -4,
      kneeY: -7,
      upperCenterY: -5.5,
      lowerCenterY: -8.5,
      ankleY: -10.5,
      ankleZ: 0,
      footCenterY: -11,
      footCenterZ: -0.55,
      upperScale: [1.2, 3, 1.6],
      lowerScale: [1, 3, 1.4],
      footScale: [1, 1, 2.5],
      upperColorKey: "legs",
      lowerColorKey: "legs",
      footColorKey: "shoes",
    },
  },
};

function degToRad(value) {
  return ((Number.isFinite(value) ? value : 0) * Math.PI) / 180;
}

function rotationFrom(values = []) {
  return [degToRad(values[0]), degToRad(values[1]), degToRad(values[2])];
}

function slice3(frame, offset) {
  return [frame[offset] ?? 0, frame[offset + 1] ?? 0, frame[offset + 2] ?? 0];
}

function BoxPart({ color, position, scale }) {
  return (
    <mesh castShadow receiveShadow position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        roughness={0.38}
        metalness={0.08}
        envMapIntensity={0.45}
      />
    </mesh>
  );
}

function SpherePart({ color, position, radius }) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial
        color={color}
        roughness={0.42}
        metalness={0.04}
        envMapIntensity={0.38}
      />
    </mesh>
  );
}

function Arm({ side, spec, upperRotation, lowerRotation }) {
  const sign = side === "right" ? -1 : 1;
  const arm = spec.arm;
  const colors = spec.colors;
  const shoulderPosition = [sign * arm.shoulderX, arm.shoulderY, 0];
  const elbowPosition = [0, arm.elbowY - arm.shoulderY, 0];

  return (
    <group position={shoulderPosition} rotation={rotationFrom(upperRotation)}>
      <BoxPart
        color={colors[arm.upperColorKey]}
        position={[0, arm.upperCenterY - arm.shoulderY, 0]}
        scale={arm.upperScale}
      />
      <group position={elbowPosition} rotation={rotationFrom(lowerRotation)}>
        <BoxPart
          color={colors[arm.lowerColorKey]}
          position={[0, arm.lowerCenterY - arm.elbowY, 0]}
          scale={arm.lowerScale}
        />
        <SpherePart
          color={colors.skin}
          position={[0, arm.fistY - arm.elbowY, 0]}
          radius={arm.fistRadius}
        />
      </group>
    </group>
  );
}

function Leg({ side, spec, upperRotation, lowerRotation, footRotation }) {
  const sign = side === "right" ? -1 : 1;
  const leg = spec.leg;
  const colors = spec.colors;
  const hipPosition = [sign * leg.hipX, leg.hipY, 0];
  const kneePosition = [0, leg.kneeY - leg.hipY, 0];
  const anklePosition = [0, leg.ankleY - leg.kneeY, leg.ankleZ];

  return (
    <group position={hipPosition} rotation={rotationFrom(upperRotation)}>
      <BoxPart
        color={colors[leg.upperColorKey]}
        position={[0, leg.upperCenterY - leg.hipY, 0]}
        scale={leg.upperScale}
      />
      <group position={kneePosition} rotation={rotationFrom(lowerRotation)}>
        <BoxPart
          color={colors[leg.lowerColorKey]}
          position={[0, leg.lowerCenterY - leg.kneeY, 0]}
          scale={leg.lowerScale}
        />
        <group position={anklePosition} rotation={[degToRad(footRotation), 0, 0]}>
          <BoxPart
            color={colors[leg.footColorKey]}
            position={[
              0,
              leg.footCenterY - leg.ankleY,
              leg.footCenterZ - leg.ankleZ,
            ]}
            scale={leg.footScale}
          />
        </group>
      </group>
    </group>
  );
}

function OriginalDancer({ frame = ZERO_FRAME, spec }) {
  const bodyT = slice3(frame, originalChannelOffsets.bodyT);
  const bodyR = slice3(frame, originalChannelOffsets.bodyR);
  const [baseX, baseY, baseZ] = spec.basePosition;
  const position = [baseX + bodyT[0], baseY + bodyT[1], baseZ + bodyT[2]];

  return (
    <group position={position} rotation={rotationFrom(bodyR)}>
      <SpherePart
        color={spec.colors.skin}
        position={spec.head.position}
        radius={spec.head.radius}
      />
      {spec.bodyParts.map((part) =>
        part.shape === "sphere" ? (
          <SpherePart
            key={`${part.colorKey}-${part.position.join("-")}`}
            color={spec.colors[part.colorKey]}
            position={part.position}
            radius={part.radius}
          />
        ) : (
          <BoxPart
            key={`${part.colorKey}-${part.position.join("-")}`}
            color={spec.colors[part.colorKey]}
            position={part.position}
            scale={part.scale}
          />
        ),
      )}
      <Arm
        side="right"
        spec={spec}
        upperRotation={slice3(frame, originalChannelOffsets.rightUpperArm)}
        lowerRotation={slice3(frame, originalChannelOffsets.rightLowerArm)}
      />
      <Arm
        side="left"
        spec={spec}
        upperRotation={slice3(frame, originalChannelOffsets.leftUpperArm)}
        lowerRotation={slice3(frame, originalChannelOffsets.leftLowerArm)}
      />
      <Leg
        side="right"
        spec={spec}
        upperRotation={slice3(frame, originalChannelOffsets.rightUpperLeg)}
        lowerRotation={slice3(frame, originalChannelOffsets.rightLowerLeg)}
        footRotation={frame[originalChannelOffsets.rightFoot]}
      />
      <Leg
        side="left"
        spec={spec}
        upperRotation={slice3(frame, originalChannelOffsets.leftUpperLeg)}
        lowerRotation={slice3(frame, originalChannelOffsets.leftLowerLeg)}
        footRotation={frame[originalChannelOffsets.leftFoot]}
      />
    </group>
  );
}

export default function OriginalBlockDancers({ danceState }) {
  const [movieData, setMovieData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    loadOriginalMovieData()
      .then((loadedMovieData) => {
        if (!cancelled) {
          setMovieData(loadedMovieData);
        }
      })
      .catch((error) => {
        console.error("Original movie data failed to load", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const activeMove = danceState?.activeMove;
  const sourceFrames = activeMove?.sourceFrames ?? [1, 32];
  const modulePhase = danceState?.modulePhase ?? 0;

  const frames = useMemo(
    () => ({
      lead:
        sampleOriginalMovieFrame(movieData?.lead, sourceFrames, modulePhase) ??
        ZERO_FRAME,
      partner:
        sampleOriginalMovieFrame(movieData?.partner, sourceFrames, modulePhase) ??
        ZERO_FRAME,
    }),
    [modulePhase, movieData, sourceFrames],
  );

  return (
    <group
      scale={ORIGINAL_WORLD_SCALE}
      position={ORIGINAL_STAGE_POSITION}
      rotation={[0, ORIGINAL_STAGE_ROTATION_Y, 0]}
    >
      <OriginalDancer frame={frames.lead} spec={dancerSpecs.lead} />
      <OriginalDancer frame={frames.partner} spec={dancerSpecs.partner} />
    </group>
  );
}
