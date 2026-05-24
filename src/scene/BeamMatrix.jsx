import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { characterSlots } from "../config/characterSlots";
import { getFormationPose } from "../dance/formationLibrary";

const wallCoordinates = [-6.8, -4.85, -2.9, -0.95, 0.95, 2.9, 4.85, 6.8];
const wallPatterns = [
  "centerCurtain",
  "frontBackTilt",
  "fanOpen",
  "fanClose",
  "diagonalLeft",
  "diagonalRight",
  "tiltWave",
  "splitCurtain",
];

const beamRig = wallCoordinates.map((coordinate, index) => ({
  position: [-8.4 + index * 2.4, 20.4 + (index % 2) * 0.9, -17.2 - (index % 3) * 0.35],
  color: ["#53caff", "#7d92ff", "#a06dff", "#44f3ff", "#5cffd8", "#ff64c8", "#ff7ab8", "#ffe36b"][
    index
  ],
  coordinate,
}));

const cueProfiles = {
  intro: { visibility: 0, intensity: 0, angle: 0.12, opacity: 0, radius: 0.58 },
  verse: { visibility: 0.42, intensity: 34, angle: 0.14, opacity: 0.052, radius: 0.74 },
  preChorus: { visibility: 0, intensity: 0, angle: 0.13, opacity: 0, radius: 0.62 },
  chorus: { visibility: 1, intensity: 88, angle: 0.18, opacity: 0.13, radius: 1.12 },
};

function createBeamMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
      uDancerA: { value: new THREE.Vector3(-3.1, 0, 0) },
      uDancerB: { value: new THREE.Vector3(3.1, 0, 0) },
      uBeamSource: { value: new THREE.Vector3() },
      uDancerFade: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vBeamY;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;
        vBeamY = position.y + 0.5;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uTime;
      uniform vec3 uDancerA;
      uniform vec3 uDancerB;
      uniform vec3 uBeamSource;
      uniform float uDancerFade;
      varying vec2 vUv;
      varying float vBeamY;
      varying vec3 vWorldPosition;

      float getDancerRayClip(vec3 rayOrigin, vec3 fragmentPosition, vec3 dancerCenter) {
        const float dancerRadius = 0.92;
        const float dancerBottom = 0.42;
        const float dancerTop = 5.65;
        vec3 ray = fragmentPosition - rayOrigin;
        float rayLength = length(ray);

        if (rayLength < 0.001) {
          return 1.0;
        }

        vec3 rayDirection = ray / rayLength;
        vec2 originToDancer = rayOrigin.xz - dancerCenter.xz;
        vec2 rayDirectionXZ = rayDirection.xz;
        float a = dot(rayDirectionXZ, rayDirectionXZ);

        if (a < 0.0001) {
          return 1.0;
        }

        float b = 2.0 * dot(originToDancer, rayDirectionXZ);
        float c = dot(originToDancer, originToDancer) - dancerRadius * dancerRadius;
        float discriminant = b * b - 4.0 * a * c;

        if (discriminant <= 0.0) {
          return 1.0;
        }

        float hitDistance = (-b - sqrt(discriminant)) / (2.0 * a);

        if (hitDistance <= 0.0 || hitDistance >= rayLength) {
          return 1.0;
        }

        float hitY = rayOrigin.y + rayDirection.y * hitDistance;
        float bodyHeight =
          smoothstep(dancerBottom, dancerBottom + 0.58, hitY) *
          (1.0 - smoothstep(dancerTop - 0.78, dancerTop, hitY));
        float afterBody = smoothstep(hitDistance, hitDistance + 1.35, rayLength);
        float clipAmount = bodyHeight * afterBody * uDancerFade;

        return mix(1.0, 0.06, clipAmount);
      }

      void main() {
        float distalCarry = mix(0.48, 1.0, smoothstep(0.0, 0.22, vBeamY));
        float sourceFade = mix(0.58, 1.0, 1.0 - smoothstep(0.86, 1.0, vBeamY));
        float endpointFeather =
          smoothstep(0.0, 0.035, vBeamY) *
          (1.0 - smoothstep(0.985, 1.0, vBeamY));
        float circumference = 1.0 - abs(vUv.x - 0.5) * 2.0;
        float hazeNoiseA = sin(vUv.y * 15.0 + vUv.x * 8.0 + uTime * 0.9);
        float hazeNoiseB = sin(vUv.y * 29.0 - vUv.x * 13.0 + uTime * 0.43);
        float hazeNoise = 0.74 + 0.2 * hazeNoiseA + 0.12 * hazeNoiseB;
        float depthGlow = 0.72 + 0.28 * smoothstep(0.1, 0.95, vBeamY);
        float featheredCircumference = clamp(
          circumference + hazeNoiseA * 0.055 + hazeNoiseB * 0.035,
          0.0,
          1.0
        );
        float outerMist = smoothstep(0.0, 0.5, featheredCircumference) * 0.18;
        float broadHaze = smoothstep(0.0, 0.88, featheredCircumference) * 0.32;
        float denseCore = pow(smoothstep(0.18, 1.0, circumference), 1.55) * 0.42;
        float airyScatter = outerMist + broadHaze + denseCore;
        float bodyHeightMask =
          smoothstep(0.45, 1.2, vWorldPosition.y) *
          (1.0 - smoothstep(5.1, 6.1, vWorldPosition.y));
        float dancerDistance = min(
          length(vWorldPosition.xz - uDancerA.xz),
          length(vWorldPosition.xz - uDancerB.xz)
        );
        float dancerCutout = smoothstep(0.72, 1.9, dancerDistance);
        float overlapFade = mix(1.0, dancerCutout, uDancerFade * bodyHeightMask * 0.45);
        float rayClip = min(
          getDancerRayClip(uBeamSource, vWorldPosition, uDancerA),
          getDancerRayClip(uBeamSource, vWorldPosition, uDancerB)
        );
        float dancerFade = min(overlapFade, rayClip);
        float alpha =
          uOpacity *
          distalCarry *
          sourceFade *
          endpointFeather *
          airyScatter *
          hazeNoise *
          depthGlow *
          dancerFade;

        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

function getWallTarget(coordinate, beamIndex, formationName, phraseProgress, movementOffset, target) {
  const normalizedIndex = beamIndex / Math.max(1, wallCoordinates.length - 1);
  const centeredIndex = normalizedIndex * 2 - 1;
  const fanAmount = 0.48 + Math.sin(phraseProgress * Math.PI) * 0.78;
  const tiltWave = Math.sin(phraseProgress * Math.PI * 2 + beamIndex * 0.72) * 3.25;
  const bounce = Math.sin(phraseProgress * Math.PI);

  if (formationName === "centerCurtain") {
    target.set(movementOffset, 0.55, coordinate);
    return target;
  }

  if (formationName === "frontBackTilt") {
    target.set(coordinate, 0.55, movementOffset);
    return target;
  }

  if (formationName === "fanOpen") {
    target.set(coordinate * fanAmount, 0.55, -5.1 + Math.abs(centeredIndex) * 9.2);
    return target;
  }

  if (formationName === "fanClose") {
    target.set(coordinate * (1.18 - fanAmount * 0.42), 0.55, 5.1 - Math.abs(centeredIndex) * 9.2);
    return target;
  }

  if (formationName === "diagonalLeft") {
    target.set(coordinate, 0.55, coordinate * 0.9 + movementOffset);
    return target;
  }

  if (formationName === "diagonalRight") {
    target.set(coordinate, 0.55, -coordinate * 0.9 + movementOffset);
    return target;
  }

  if (formationName === "tiltWave") {
    target.set(coordinate, 0.55, tiltWave);
    return target;
  }

  target.set(Math.sign(coordinate) * (1.0 + Math.abs(coordinate) * 0.62 + bounce * 1.1), 0.55, coordinate * 0.72);
  return target;
}

function isVerseOuterBeam(beamIndex) {
  return beamIndex <= 1 || beamIndex >= wallCoordinates.length - 2;
}

function getVerseParallelSweepTarget(coordinate, beamIndex, phraseProgress, target) {
  const sweep = Math.sin(phraseProgress * Math.PI * 2) * 1.9;
  const outerSide = Math.sign(coordinate);
  const laneIndex = beamIndex <= 1 ? beamIndex : beamIndex - (wallCoordinates.length - 2);
  const depthLane = laneIndex === 0 ? -3.2 : 3.2;

  target.set(coordinate + sweep, 0.55, depthLane + outerSide * 0.18);
  return target;
}

function resolveDancerMaskPosition(slot, danceState, target) {
  if (!danceState?.activeMove) {
    target.set(slot.position[0], 0, slot.position[2]);
    return target;
  }

  const formationPose = getFormationPose({
    activeMove: danceState.activeMove,
    slot,
    modulePhase: danceState.modulePhase ?? 0,
    activeSlotIndex: danceState.activeSlotIndex ?? 0,
    sequence: danceState.sequence ?? [],
  });

  target.set(formationPose.position[0], 0, formationPose.position[2]);
  return target;
}

function createSaturatedSpotColor(colorValue) {
  const color = new THREE.Color(colorValue);
  const hsl = {};

  color.getHSL(hsl);
  color.setHSL(
    hsl.h,
    Math.min(1, hsl.s * 1.35 + 0.18),
    Math.min(0.72, Math.max(0.5, hsl.l * 1.12)),
  );

  return color;
}

export default function BeamMatrix({ syncState, danceState }) {
  const spotRefs = useRef([]);
  const coneRefs = useRef([]);
  const hitRefs = useRef([]);

  const targetObjects = useMemo(() => beamRig.map(() => new THREE.Object3D()), []);
  const sourcePositions = useMemo(
    () => beamRig.map((beamDefinition) => new THREE.Vector3(...beamDefinition.position)),
    [],
  );
  const beamMaterials = useMemo(
    () => beamRig.map((beamDefinition) => createBeamMaterial(beamDefinition.color)),
    [],
  );
  const spotColors = useMemo(
    () => beamRig.map((beamDefinition) => createSaturatedSpotColor(beamDefinition.color)),
    [],
  );
  const hitMaterials = useMemo(
    () =>
      beamRig.map(
        (beamDefinition) =>
          new THREE.MeshBasicMaterial({
            color: beamDefinition.color,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
      ),
    [],
  );
  const scratch = useMemo(
    () => ({
      upDirection: new THREE.Vector3(0, 1, 0),
      beamDirection: new THREE.Vector3(),
      midpoint: new THREE.Vector3(),
      orientation: new THREE.Quaternion(),
      target: new THREE.Vector3(),
      lightTarget: new THREE.Vector3(),
      dancerA: new THREE.Vector3(),
      dancerB: new THREE.Vector3(),
    }),
    [],
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const beatIndex = syncState?.beatIndex ?? 0;
    const beatPhase = syncState?.beatPhase ?? 0;
    const beatPulse = syncState?.beatPulse ?? 0;
    const bassEnergy = syncState?.bassEnergy ?? 0;
    const stageCue = syncState?.stageCue ?? "intro";
    const cueProfile = cueProfiles[stageCue] ?? cueProfiles.intro;
    const formationIndex = Math.floor(beatIndex / 4) % wallPatterns.length;
    const phraseProgress = ((beatIndex % 4) + beatPhase) / 4;
    const versePhraseProgress = ((beatIndex % 16) + beatPhase) / 16;
    const movementOffset = Math.sin(phraseProgress * Math.PI * 2) * 2.45;
    const leadSlot = characterSlots.find((slot) => slot.id === "lead") ?? characterSlots[0];
    const partnerSlot = characterSlots.find((slot) => slot.id === "partner") ?? characterSlots[1] ?? leadSlot;
    const dancerFade = stageCue === "verse" || stageCue === "chorus" ? 0.82 : 0.42;

    resolveDancerMaskPosition(leadSlot, danceState, scratch.dancerA);
    resolveDancerMaskPosition(partnerSlot, danceState, scratch.dancerB);

    const verseAccent =
      stageCue === "verse"
        ? beatIndex % 16 < 4
          ? 1
          : beatIndex % 16 >= 12
            ? 0.54
            : 0
        : 1;
    const cueVisibility = cueProfile.visibility * verseAccent;

    beamRig.forEach((beamDefinition, beamIndex) => {
      const targetObject = targetObjects[beamIndex];
      const spotLight = spotRefs.current[beamIndex];
      const beamCone = coneRefs.current[beamIndex];
      const floorHit = hitRefs.current[beamIndex];

      const beamVisibility =
        stageCue === "verse" && !isVerseOuterBeam(beamIndex) ? 0 : cueVisibility;
      const realVerseLight = stageCue === "verse" && isVerseOuterBeam(beamIndex);
      const realChorusLight = stageCue === "chorus";
      const realBeamLight = realVerseLight || realChorusLight;

      if (stageCue === "verse") {
        getVerseParallelSweepTarget(
          beamDefinition.coordinate,
          beamIndex,
          versePhraseProgress,
          scratch.target,
        );
      } else {
        getWallTarget(
          beamDefinition.coordinate,
          beamIndex,
          wallPatterns[formationIndex],
          phraseProgress,
          movementOffset,
          scratch.target,
        );
      }
      scratch.target.y += beatPulse * 0.08;
      scratch.lightTarget.copy(scratch.target);

      if (realVerseLight) {
        scratch.lightTarget.y = 2.65 + beatPulse * 0.18;
        scratch.lightTarget.z *= 0.55;
      } else if (realChorusLight) {
        scratch.lightTarget.y = Math.max(scratch.lightTarget.y, 2.15 + beatPulse * 0.22);
        scratch.lightTarget.z *= 0.72;
      }

      targetObject.position.lerp(realBeamLight ? scratch.lightTarget : scratch.target, 0.075);
      targetObject.updateMatrixWorld();

      const sourcePosition = sourcePositions[beamIndex];
      const beamLength = sourcePosition.distanceTo(targetObject.position);
      const beamRadius = cueProfile.radius + beatPulse * 0.12 + bassEnergy * 0.12;
      const syncedSpotAngle = Math.max(
        0.012,
        Math.atan(beamRadius / Math.max(beamLength, 0.001)),
      );

      if (spotLight) {
        const phraseAccent = beatIndex % 4 === 0 ? beatPulse * 0.32 : beatPulse * 0.12;
        const realLightMultiplier = realChorusLight ? 5.2 : realVerseLight ? 4.2 : 1;

        spotLight.visible = true;
        spotLight.color.copy(spotColors[beamIndex]);
        spotLight.castShadow = true;
        spotLight.intensity =
          beamVisibility > 0.01
            ? cueProfile.intensity *
              realLightMultiplier *
              (0.68 + phraseAccent + bassEnergy * 0.2)
            : 0;
        spotLight.angle = syncedSpotAngle;
        spotLight.distance = beamLength + beamRadius * 2.5;
        spotLight.decay = realBeamLight ? 0.48 : 1;
        spotLight.penumbra = realBeamLight ? 0.44 : 0.74;
        spotLight.shadow.bias = -0.00008;
        spotLight.shadow.normalBias = 0.012;
        spotLight.shadow.radius = realBeamLight ? 3 : 1;
      }

      if (beamCone) {
        const material = beamCone.material;

        material.uniforms.uDancerA.value.copy(scratch.dancerA);
        material.uniforms.uDancerB.value.copy(scratch.dancerB);
        material.uniforms.uBeamSource.value.copy(sourcePosition);
        material.uniforms.uDancerFade.value = dancerFade;

        const beamActivation =
          cueProfile.visibility > 0
            ? Math.min(1, Math.max(0, beamVisibility / cueProfile.visibility))
            : 0;
        const targetOpacity = Math.min(
          0.42,
          (cueProfile.opacity + beatPulse * 0.052 + bassEnergy * 0.05) *
            (stageCue === "verse" ? 1.08 : 1),
        ) * beamActivation;
        const floorHitOpacity = Math.min(
          0.48,
          targetOpacity * (stageCue === "chorus" ? 1.22 : stageCue === "verse" ? 1.45 : 0.75),
        );

        scratch.midpoint.addVectors(sourcePosition, targetObject.position).multiplyScalar(0.5);
        scratch.beamDirection.subVectors(sourcePosition, targetObject.position).normalize();
        scratch.orientation.setFromUnitVectors(scratch.upDirection, scratch.beamDirection);

        beamCone.visible = true;
        beamCone.position.copy(scratch.midpoint);
        beamCone.quaternion.copy(scratch.orientation);
        beamCone.scale.set(beamRadius, beamLength, beamRadius);
        material.uniforms.uTime.value = time + beamIndex * 0.17;
        material.uniforms.uOpacity.value +=
          (targetOpacity - material.uniforms.uOpacity.value) * 0.12;

        if (floorHit) {
          floorHit.visible = true;
          floorHit.position.set(targetObject.position.x, 0.255, targetObject.position.z);
          floorHit.scale.setScalar(1.22 + beatPulse * 0.34 + bassEnergy * 0.32);
          floorHit.material.opacity += (floorHitOpacity - floorHit.material.opacity) * 0.22;
        }
      }
    });
  });

  return (
    <group>
      {targetObjects.map((targetObject, beamIndex) => (
        <primitive key={`beam-target-${beamIndex}`} object={targetObject} />
      ))}

      {beamRig.map((beamDefinition, beamIndex) => (
        <spotLight
          key={`matrix-spot-${beamIndex}`}
          ref={(lightElement) => {
            spotRefs.current[beamIndex] = lightElement;
          }}
          castShadow
          position={beamDefinition.position}
          color={beamDefinition.color}
          intensity={0}
          angle={cueProfiles.chorus.angle}
          penumbra={0.74}
          distance={50}
          target={targetObjects[beamIndex]}
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-camera-near={3}
          shadow-camera-far={54}
        />
      ))}

      {beamRig.map((beamDefinition, beamIndex) => (
        <mesh
          key={`matrix-beam-${beamIndex}`}
          ref={(meshElement) => {
            coneRefs.current[beamIndex] = meshElement;
          }}
          renderOrder={2}
        >
          <coneGeometry args={[1, 1, 40, 1, true]} />
          <primitive object={beamMaterials[beamIndex]} attach="material" />
        </mesh>
      ))}

      {beamRig.map((beamDefinition, beamIndex) => (
        <mesh
          key={`beam-floor-hit-${beamIndex}`}
          ref={(meshElement) => {
            hitRefs.current[beamIndex] = meshElement;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={1}
        >
          <circleGeometry args={[1, 36]} />
          <primitive object={hitMaterials[beamIndex]} attach="material" />
        </mesh>
      ))}
    </group>
  );
}
