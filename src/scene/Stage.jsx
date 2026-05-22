import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import BackgroundFanLights from "./BackgroundFanLights";

function NeonFrame({ position, rotation = [0, 0, 0], scale = [1, 1, 1] }) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <torusGeometry args={[1.55, 0.05, 16, 64]} />
      <meshStandardMaterial
        color="#88c8ff"
        emissive="#6a54ff"
        emissiveIntensity={2.5}
        fog={false}
      />
    </mesh>
  );
}

export default function Stage({ syncState }) {
  const danceFloor = useRef(null);
  const backdrop = useRef(null);
  const backdropGlow = useRef(null);

  const looks = useMemo(
    () => ({
      intro: {
        floorColor: "#061021",
        floorBoost: 0.12,
        backdropColor: "#0d1024",
        backdropBoost: 0.18,
      },
      verse: {
        floorColor: "#12304d",
        floorBoost: 0.32,
        backdropColor: "#25235b",
        backdropBoost: 0.42,
      },
      preChorus: {
        floorColor: "#3c2e73",
        floorBoost: 0.58,
        backdropColor: "#542c6f",
        backdropBoost: 0.78,
      },
      chorus: {
        floorColor: "#3556a9",
        floorBoost: 0.95,
        backdropColor: "#8e3f92",
        backdropBoost: 1.22,
      },
    }),
    [],
  );
  const ledPalettes = useMemo(
    () => ({
      intro: ["#10264a", "#251657", "#12364d"],
      verse: ["#2254b8", "#522cbb", "#0f879c", "#2742a0"],
      preChorus: ["#ff4fad", "#7b5cff", "#21e0d1", "#ffc857"],
      chorus: ["#ff2d95", "#35f3ff", "#9f6bff", "#fff06a", "#4dffb8", "#ff6b4a"],
    }),
    [],
  );
  const colorScratch = useMemo(
    () => ({
      current: new THREE.Color(),
      next: new THREE.Color(),
    }),
    [],
  );

  useFrame(() => {
    const beatPulse = syncState?.beatPulse ?? 0;
    const beatIndex = syncState?.beatIndex ?? 0;
    const beatPhase = syncState?.beatPhase ?? 0;
    const bassEnergy = syncState?.bassEnergy ?? 0;
    const stageCue = syncState?.stageCue ?? "intro";
    const look = looks[stageCue] ?? looks.intro;
    const sectionBoost = stageCue === "chorus" ? 0.3 : stageCue === "preChorus" ? 0.12 : 0;
    const palette = ledPalettes[stageCue] ?? ledPalettes.intro;
    const paletteStep = stageCue === "chorus" ? 1 : 2;
    const paletteIndex = Math.floor(beatIndex / paletteStep) % palette.length;
    const nextPaletteIndex = (paletteIndex + 1) % palette.length;
    const colorBlend = stageCue === "chorus" ? beatPhase * 0.55 : beatPhase * 0.28;

    colorScratch.current.set(palette[paletteIndex]);
    colorScratch.next.set(palette[nextPaletteIndex]);
    colorScratch.current.lerp(colorScratch.next, colorBlend);

    if (danceFloor.current) {
      danceFloor.current.material.emissive.set(look.floorColor);
      danceFloor.current.material.emissiveIntensity =
        look.floorBoost + beatPulse * 1.15 + bassEnergy * 0.55 + sectionBoost;
      const scale = 1 + beatPulse * 0.025 + sectionBoost * 0.01;
      danceFloor.current.scale.set(scale, 1, scale);
    }

    if (backdrop.current) {
      backdrop.current.material.color.lerp(colorScratch.current, 0.08);
      backdrop.current.material.emissive.lerp(colorScratch.current, 0.14);
      backdrop.current.material.emissiveIntensity =
        look.backdropBoost + beatPulse * 0.82 + bassEnergy * 0.64 + sectionBoost * 0.62;
      backdrop.current.material.opacity =
        stageCue === "intro" ? 0.58 : stageCue === "verse" ? 0.78 : 0.88;
    }

    if (backdropGlow.current) {
      backdropGlow.current.material.color.lerp(colorScratch.current, 0.16);
      backdropGlow.current.material.opacity = Math.min(
        0.48,
        look.backdropBoost * 0.16 + beatPulse * 0.18 + bassEnergy * 0.14 + sectionBoost * 0.08,
      );
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#050a14" roughness={0.92} />
      </mesh>

      <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[9.8, 11, 0.4, 64]} />
        <meshStandardMaterial
          color="#101726"
          metalness={0.35}
          roughness={0.5}
          emissive="#0f1e49"
          emissiveIntensity={0.4}
        />
      </mesh>

      <mesh ref={danceFloor} position={[0, 0.22, 0]}>
        <cylinderGeometry args={[8.8, 8.8, 0.06, 64]} />
        <meshStandardMaterial
          color="#122745"
          emissive="#4e9dff"
          emissiveIntensity={1.2}
          metalness={0.15}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 8.8, -23]} receiveShadow>
        <boxGeometry args={[38, 19, 0.6]} />
        <meshStandardMaterial
          color="#121a2e"
          emissive="#2d1b60"
          emissiveIntensity={0.18}
          transparent
          opacity={0.3}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      <mesh ref={backdrop} position={[0, 5.8, -22.6]}>
        <planeGeometry args={[22, 6.8]} />
        <meshStandardMaterial
          color="#080b16"
          emissive="#4f2ca4"
          emissiveIntensity={0.62}
          transparent
          opacity={0.82}
          depthWrite={false}
          fog={false}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={backdropGlow} position={[0, 5.8, -22.2]} renderOrder={2}>
        <planeGeometry args={[28, 9.2]} />
        <meshBasicMaterial
          color="#4f2ca4"
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
          toneMapped={false}
        />
      </mesh>

      <BackgroundFanLights syncState={syncState} />

      <NeonFrame position={[-8, 6, -22.1]} scale={[1.35, 1.35, 1]} />
      <NeonFrame position={[8, 6, -22.1]} scale={[1.35, 1.35, 1]} />

      <mesh position={[-3.1, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.15, 1.1, 32]} />
        <meshStandardMaterial color="#17243a" metalness={0.2} roughness={0.7} />
      </mesh>

      <mesh position={[3.1, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.15, 1.1, 32]} />
        <meshStandardMaterial color="#2a1832" metalness={0.2} roughness={0.7} />
      </mesh>
    </group>
  );
}
