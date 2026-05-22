import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

function createHazeMaterial(color) {
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
        float radial = distance(vUv, vec2(0.5));
        float stageFalloff = 1.0 - smoothstep(0.16, 0.56, radial);
        float hazeFlowA = sin(vUv.x * 18.0 + vUv.y * 11.0 + uTime * 0.35);
        float hazeFlowB = sin(vUv.x * 7.0 - vUv.y * 21.0 + uTime * 0.22);
        float hazeNoise = 0.72 + hazeFlowA * 0.18 + hazeFlowB * 0.1;
        float alpha = uOpacity * stageFalloff * hazeNoise;

        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    fog: false,
  });
}

export default function BeatHaze({ syncState }) {
  const hazeMaterials = useMemo(
    () => [
      createHazeMaterial("#5dbdff"),
      createHazeMaterial("#7f65ff"),
      createHazeMaterial("#5affdd"),
    ],
    [],
  );

  const hazeProfiles = useMemo(
    () => ({
      intro: 0.018,
      verse: 0.026,
      preChorus: 0.038,
      chorus: 0.054,
    }),
    [],
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const beatPulse = syncState?.beatPulse ?? 0;
    const bassEnergy = syncState?.bassEnergy ?? 0;
    const stageCue = syncState?.stageCue ?? "intro";
    const baseOpacity = hazeProfiles[stageCue] ?? hazeProfiles.intro;
    const targetOpacity = baseOpacity + beatPulse * 0.016 + bassEnergy * 0.014;

    hazeMaterials.forEach((material, index) => {
      const layerMultiplier = 1 - index * 0.18;
      material.uniforms.uTime.value = time + index * 1.7;
      material.uniforms.uOpacity.value +=
        (targetOpacity * layerMultiplier - material.uniforms.uOpacity.value) * 0.08;
    });
  });

  return (
    <group>
      <mesh position={[0, 1.05, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <planeGeometry args={[24, 24, 1, 1]} />
        <primitive object={hazeMaterials[0]} attach="material" />
      </mesh>
      <mesh position={[0, 2.25, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <planeGeometry args={[21, 21, 1, 1]} />
        <primitive object={hazeMaterials[1]} attach="material" />
      </mesh>
      <mesh position={[0, 3.45, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <planeGeometry args={[18, 18, 1, 1]} />
        <primitive object={hazeMaterials[2]} attach="material" />
      </mesh>
    </group>
  );
}
