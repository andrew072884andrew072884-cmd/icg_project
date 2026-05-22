import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

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
  verse: { visibility: 0, intensity: 0, angle: 0.12, opacity: 0, radius: 0.58 },
  preChorus: { visibility: 0, intensity: 0, angle: 0.13, opacity: 0, radius: 0.62 },
  chorus: { visibility: 1, intensity: 36, angle: 0.18, opacity: 0.112, radius: 1.08 },
};

function createBeamMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vBeamY;

      void main() {
        vUv = uv;
        vBeamY = position.y + 0.5;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uTime;
      varying vec2 vUv;
      varying float vBeamY;

      void main() {
        float headFade = smoothstep(0.02, 0.18, vBeamY);
        float tailFade = 1.0 - smoothstep(0.7, 1.0, vBeamY);
        float circumference = 1.0 - abs(vUv.x - 0.5) * 2.0;
        float softEdge = smoothstep(0.0, 0.28, circumference);
        float hazeNoiseA = sin(vUv.y * 15.0 + vUv.x * 8.0 + uTime * 0.9);
        float hazeNoiseB = sin(vUv.y * 29.0 - vUv.x * 13.0 + uTime * 0.43);
        float hazeNoise = 0.74 + 0.2 * hazeNoiseA + 0.12 * hazeNoiseB;
        float depthGlow = 0.72 + 0.28 * smoothstep(0.1, 0.95, vBeamY);
        float airyScatter = 0.28 + softEdge * 0.52;
        float alpha = uOpacity * headFade * tailFade * airyScatter * hazeNoise * depthGlow;

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

export default function BeamMatrix({ syncState }) {
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
    const movementOffset = Math.sin(phraseProgress * Math.PI * 2) * 2.45;
    const cueVisibility = cueProfile.visibility;

    beamRig.forEach((beamDefinition, beamIndex) => {
      const targetObject = targetObjects[beamIndex];
      const spotLight = spotRefs.current[beamIndex];
      const beamCone = coneRefs.current[beamIndex];
      const floorHit = hitRefs.current[beamIndex];

      getWallTarget(
        beamDefinition.coordinate,
        beamIndex,
        wallPatterns[formationIndex],
        phraseProgress,
        movementOffset,
        scratch.target,
      );
      scratch.target.y += beatPulse * 0.08;

      targetObject.position.lerp(scratch.target, 0.075);
      targetObject.updateMatrixWorld();

      if (spotLight) {
        const phraseAccent = beatIndex % 4 === 0 ? beatPulse * 0.32 : beatPulse * 0.12;
        spotLight.visible = cueVisibility > 0.01;
        spotLight.intensity =
          cueVisibility > 0.01
            ? cueProfile.intensity * (0.68 + phraseAccent + bassEnergy * 0.2)
            : 0;
        spotLight.angle = cueProfile.angle + beatPulse * 0.008 + bassEnergy * 0.006;
        spotLight.penumbra = 0.74;
      }

      if (beamCone) {
        const material = beamCone.material;

        if (cueVisibility <= 0.01) {
          beamCone.visible = false;
          material.uniforms.uOpacity.value = 0;
          if (floorHit) {
            floorHit.visible = false;
            floorHit.material.opacity = 0;
          }
          return;
        }

        const sourcePosition = sourcePositions[beamIndex];
        const beamLength = sourcePosition.distanceTo(targetObject.position);
        const beamRadius = cueProfile.radius + beatPulse * 0.12 + bassEnergy * 0.12;
        const targetOpacity = Math.min(
          0.3,
          cueProfile.opacity + beatPulse * 0.052 + bassEnergy * 0.05,
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
          floorHit.scale.setScalar(0.95 + beatPulse * 0.18 + bassEnergy * 0.22);
          floorHit.material.opacity += (targetOpacity * 0.58 - floorHit.material.opacity) * 0.16;
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
          position={beamDefinition.position}
          color={beamDefinition.color}
          intensity={0}
          angle={cueProfiles.chorus.angle}
          penumbra={0.74}
          distance={50}
          target={targetObjects[beamIndex]}
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
