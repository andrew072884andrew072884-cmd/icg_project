import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const raysPerFan = 8;
const minTiltDegrees = 0;
const maxTiltDegrees = 70;
const fanRigs = [
  {
    id: "center-left-forward-up",
    type: "centerForward",
    origin: [-4.9, 9.9, -22.0],
    xSpread: 1.55,
    forwardAmount: 2,
    upAmount: 1,
    tiltSweepDegrees: 22,
    lengthBias: 1.08,
  },
  {
    id: "center-right-forward-up",
    type: "centerForward",
    origin: [4.9, 9.9, -22.0],
    xSpread: 1.55,
    forwardAmount: 2,
    upAmount: 1,
    tiltSweepDegrees: 22,
    lengthBias: 1.08,
  },
  {
    id: "left-side-inward-up",
    type: "sideInward",
    origin: [-18.4, 4.35, -11.2],
    side: 1,
    inwardAmount: 1,
    upAmount: 1.5,
    depthSpread: 0.46,
    rayTiltSpreadDegrees: 8,
    tiltSweepDegrees: 12,
    lengthBias: 1.12,
  },
  {
    id: "right-side-inward-up",
    type: "sideInward",
    origin: [18.4, 4.35, -11.2],
    side: -1,
    inwardAmount: 1,
    upAmount: 1.5,
    depthSpread: 0.46,
    rayTiltSpreadDegrees: 8,
    tiltSweepDegrees: 12,
    lengthBias: 1.12,
  },
];

const visibilityProfiles = {
  intro: { visibility: 0.16, length: 11.2, opacity: 0.13, width: 0.18 },
  verse: { visibility: 0.52, length: 13.4, opacity: 0.2, width: 0.22 },
  preChorus: { visibility: 0.82, length: 15.2, opacity: 0.3, width: 0.27 },
  chorus: { visibility: 1, length: 17.4, opacity: 0.42, width: 0.33 },
};

const fanModeProfiles = {
  off: { visibility: 0, opacityMultiplier: 0, widthMultiplier: 0.8, lengthMultiplier: 0.92 },
  weak: { visibility: 0.42, opacityMultiplier: 0.48, widthMultiplier: 0.82, lengthMultiplier: 0.96 },
  full: { visibility: 1, opacityMultiplier: 1.18, widthMultiplier: 1.08, lengthMultiplier: 1 },
};

const sectionColors = {
  intro: "#7eb8ff",
  verse: "#39dcff",
  preChorus: "#ff65d0",
  chorus: "#68f3ff",
};

function resolveFanMode(stageCue, beatIndex, beatPulse, bassEnergy) {
  if (stageCue === "intro") {
    return "off";
  }

  if (stageCue === "verse") {
    return "weak";
  }

  if (stageCue === "preChorus") {
    return beatIndex % 4 === 0 || beatPulse > 0.72 || bassEnergy > 0.48 ? "full" : "weak";
  }

  if (stageCue === "chorus") {
    return "full";
  }

  return "weak";
}

function createFanMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        float center = 1.0 - abs(vUv.x - 0.5) * 2.0;
        float core = smoothstep(0.0, 0.58, center);
        float outerGlow = smoothstep(0.0, 1.0, center) * 0.34;
        float startFade = smoothstep(0.0, 0.08, vUv.y);
        float endFade = 1.0 - smoothstep(0.8, 1.0, vUv.y);
        float centerHotspot = 0.58 + 0.42 * smoothstep(0.22, 1.0, center);
        float shimmer = 0.88 + sin(vUv.y * 24.0 - uTime * 8.5) * 0.08;
        float alpha = uOpacity * (core + outerGlow) * centerHotspot * startFade * endFade * shimmer;

        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function clampTiltDegrees(value) {
  return Math.min(maxTiltDegrees, Math.max(minTiltDegrees, value));
}

function setDirectionFromHorizontal(horizontalX, horizontalZ, elevationDegrees, target) {
  const horizontalLength = Math.max(0.001, Math.hypot(horizontalX, horizontalZ));
  const elevation = THREE.MathUtils.degToRad(clampTiltDegrees(elevationDegrees));
  const horizontalScale = Math.cos(elevation);

  target.set(
    (horizontalX / horizontalLength) * horizontalScale,
    Math.sin(elevation),
    (horizontalZ / horizontalLength) * horizontalScale,
  );

  return target.normalize();
}

function getFanDirection(fanRig, centered, spreadBreath, dynamicTiltDegrees, target) {
  if (fanRig.type === "centerForward") {
    const baseTiltDegrees = THREE.MathUtils.radToDeg(
      Math.atan2(fanRig.upAmount, fanRig.forwardAmount),
    );

    return setDirectionFromHorizontal(
      centered * fanRig.xSpread * spreadBreath,
      fanRig.forwardAmount,
      baseTiltDegrees + dynamicTiltDegrees,
      target,
    );
  }

  const baseTiltDegrees = THREE.MathUtils.radToDeg(
    Math.atan2(fanRig.upAmount, fanRig.inwardAmount),
  );
  const rayTiltDegrees = centered * fanRig.rayTiltSpreadDegrees;

  return setDirectionFromHorizontal(
    fanRig.side * fanRig.inwardAmount,
    centered * fanRig.depthSpread * spreadBreath,
    baseTiltDegrees + dynamicTiltDegrees + rayTiltDegrees,
    target,
  );
}

export default function BackgroundFanLights({ syncState }) {
  const fanGroupRefs = useRef([]);
  const rayRefs = useRef([]);

  const rayMaterials = useMemo(
    () =>
      fanRigs.flatMap(() =>
        Array.from({ length: raysPerFan }, () => createFanMaterial(sectionColors.intro)),
      ),
    [],
  );
  const scratch = useMemo(
    () => ({
      color: new THREE.Color(),
      origin: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      orientation: new THREE.Quaternion(),
      localBeamAxis: new THREE.Vector3(0, 1, 0),
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
    const profile = visibilityProfiles[stageCue] ?? visibilityProfiles.intro;
    const fanMode = resolveFanMode(stageCue, beatIndex, beatPulse, bassEnergy);
    const modeProfile = fanModeProfiles[fanMode] ?? fanModeProfiles.weak;
    const sectionColor = sectionColors[stageCue] ?? sectionColors.intro;
    const beatGate = Math.max(0, 1 - beatPhase * 2.4);
    const strongBeat = beatIndex % 4 === 0 ? 1.35 : beatIndex % 2 === 0 ? 0.95 : 0.64;
    const fanBreath =
      1 + Math.sin(((beatIndex % 8) + beatPhase) / 8 * Math.PI * 2) * 0.08;
    scratch.color.set(sectionColor);

    fanRigs.forEach((fanRig, fanIndex) => {
      const fanGroup = fanGroupRefs.current[fanIndex];
      const targetOpacity =
        profile.opacity *
        profile.visibility *
        modeProfile.visibility *
        modeProfile.opacityMultiplier *
        (0.78 + beatPulse * 1.65 + beatGate * strongBeat * 0.62 + bassEnergy * 0.72);

      if (fanGroup) {
        scratch.origin.set(...fanRig.origin);
        scratch.origin.x += Math.sin(time * 0.35 + fanIndex) * 0.12;
        scratch.origin.y += Math.cos(time * 0.4 + fanIndex) * 0.08;
        fanGroup.position.lerp(scratch.origin, 0.12);
      }

      for (let rayIndex = 0; rayIndex < raysPerFan; rayIndex += 1) {
        const flatIndex = fanIndex * raysPerFan + rayIndex;
        const ray = rayRefs.current[flatIndex];

        if (!ray) {
          continue;
        }

        const normalized = raysPerFan === 1 ? 0.5 : rayIndex / (raysPerFan - 1);
        const centered = normalized - 0.5;
        const spreadBreath = fanBreath + beatPulse * 0.12 + bassEnergy * 0.08;
        const tiltPhase = ((beatIndex % 8) + beatPhase) / 8;
        const dynamicTiltDegrees =
          Math.sin(tiltPhase * Math.PI * 2 + fanIndex * 0.7) *
            fanRig.tiltSweepDegrees +
          beatPulse * 3 +
          bassEnergy * 2;
        const direction = getFanDirection(
          fanRig,
          centered,
          spreadBreath,
          dynamicTiltDegrees,
          scratch.direction,
        );
        const length =
          profile.length *
          fanRig.lengthBias *
          modeProfile.lengthMultiplier *
          (0.9 + normalized * 0.13 + beatPulse * 0.045 + bassEnergy * 0.05);
        const width =
          (profile.width + beatPulse * 0.07 + bassEnergy * 0.06) *
          modeProfile.widthMultiplier;
        const material = ray.material;

        material.uniforms.uColor.value.lerp(scratch.color, 0.2);
        material.uniforms.uTime.value = time + rayIndex * 0.27 + fanIndex * 0.61;
        material.uniforms.uOpacity.value +=
          (Math.min(0.68, targetOpacity) - material.uniforms.uOpacity.value) * 0.2;

        ray.position.copy(direction).multiplyScalar(length * 0.5);
        scratch.orientation.setFromUnitVectors(scratch.localBeamAxis, direction);
        ray.quaternion.copy(scratch.orientation);
        ray.scale.set(width, length, 1);
        ray.visible = material.uniforms.uOpacity.value > 0.006;
      }
    });
  });

  return (
    <group renderOrder={3}>
      {fanRigs.map((fanRig, fanIndex) => (
        <group
          key={fanRig.id}
          ref={(groupElement) => {
            fanGroupRefs.current[fanIndex] = groupElement;
          }}
          position={fanRig.origin}
        >
          {Array.from({ length: raysPerFan }, (_, rayIndex) => {
            const flatIndex = fanIndex * raysPerFan + rayIndex;

            return (
              <mesh
                key={`${fanRig.id}-ray-${rayIndex}`}
                ref={(meshElement) => {
                  rayRefs.current[flatIndex] = meshElement;
                }}
                renderOrder={3}
              >
                <planeGeometry args={[1, 1]} />
                <primitive object={rayMaterials[flatIndex]} attach="material" />
              </mesh>
            );
          })}

        </group>
      ))}
    </group>
  );
}
