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
  const chorusReleaseRef = useRef(0);

  const looks = useMemo(
    () => ({
      intro: {
        floorColor: "#061021",
        floorBoost: 0.12,
        backdropColor: "#0d1024",
        backdropBoost: 0.18,
      },
      verse: {
        floorColor: "#0e3859",
        floorBoost: 0.38,
        backdropColor: "#14346b",
        backdropBoost: 0.5,
      },
      preChorus: {
        floorColor: "#5a236d",
        floorBoost: 0.72,
        backdropColor: "#7a246b",
        backdropBoost: 1.05,
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
      verse: ["#1767d1", "#0d9fc0", "#1c47a7"],
      preChorus: ["#ff37b8", "#19ffe0", "#8a5cff", "#ffb22e"],
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

  useFrame((_, delta) => {
    const beatPulse = syncState?.beatPulse ?? 0;
    const beatIndex = syncState?.beatIndex ?? 0;
    const beatPhase = syncState?.beatPhase ?? 0;
    const bassEnergy = syncState?.bassEnergy ?? 0;
    const stageCue = syncState?.stageCue ?? "intro";
    const look = looks[stageCue] ?? looks.intro;
    chorusReleaseRef.current = THREE.MathUtils.damp(
      chorusReleaseRef.current,
      stageCue === "chorus" ? 1 : 0,
      stageCue === "chorus" ? 10 : 1.25,
      delta,
    );
    const chorusRelease =
      stageCue === "chorus" || stageCue === "intro" ? 0 : chorusReleaseRef.current;
    const sectionBoost = stageCue === "chorus" ? 0.3 : stageCue === "preChorus" ? 0.2 : 0;
    const palette = ledPalettes[stageCue] ?? ledPalettes.intro;
    const paletteStep = stageCue === "verse" ? 4 : stageCue === "preChorus" || stageCue === "chorus" ? 1 : 2;
    const paletteIndex = Math.floor(beatIndex / paletteStep) % palette.length;
    const nextPaletteIndex = (paletteIndex + 1) % palette.length;
    const dropBlackout =
      stageCue === "preChorus" && beatIndex % 16 === 15 && beatPhase > 0.18 && beatPhase < 0.92
        ? 1
        : 0;
    const blackoutScale = 1 - dropBlackout * 0.86;
    const colorBlend =
      stageCue === "verse"
        ? beatPhase * 0.12
        : stageCue === "preChorus"
          ? beatPhase * 0.78
          : stageCue === "chorus"
            ? beatPhase * 0.55
            : beatPhase * 0.28;

    colorScratch.current.set(palette[paletteIndex]);
    colorScratch.next.set(palette[nextPaletteIndex]);
    colorScratch.current.lerp(colorScratch.next, colorBlend);

    if (danceFloor.current) {
      danceFloor.current.material.emissive.set(look.floorColor);
      danceFloor.current.material.emissiveIntensity =
        (look.floorBoost +
          beatPulse * 1.15 +
          bassEnergy * 0.55 +
          sectionBoost +
          chorusRelease * 0.28) *
        blackoutScale;
      const scale = 1 + beatPulse * 0.025 + sectionBoost * 0.01;
      danceFloor.current.scale.set(scale, 1, scale);
    }

    if (backdrop.current) {
      backdrop.current.material.color.lerp(colorScratch.current, 0.08);
      backdrop.current.material.emissive.lerp(colorScratch.current, 0.14);
      backdrop.current.material.emissiveIntensity =
        (look.backdropBoost +
          beatPulse * 0.82 +
          bassEnergy * 0.64 +
          sectionBoost * 0.62 +
          chorusRelease * 0.34) *
        blackoutScale;
      backdrop.current.material.opacity =
        Math.min(
          0.94,
          (stageCue === "intro" ? 0.58 : stageCue === "verse" ? 0.72 : stageCue === "preChorus" ? 0.94 : 0.88) +
            chorusRelease * 0.1,
        ) *
        (1 - dropBlackout * 0.55);
    }

    if (backdropGlow.current) {
      backdropGlow.current.material.color.lerp(colorScratch.current, 0.16);
      backdropGlow.current.material.opacity = Math.min(
        0.48,
        look.backdropBoost * 0.16 +
          beatPulse * 0.18 +
          bassEnergy * 0.14 +
          sectionBoost * 0.08 +
          chorusRelease * 0.08,
      ) * blackoutScale;
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
    </group>
  );
}
