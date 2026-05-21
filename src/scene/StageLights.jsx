import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function StageLights({ started, syncState }) {
  const leftSpot = useRef(null);
  const rightSpot = useRef(null);
  const rimLight = useRef(null);

  const palette = useMemo(
    () => ["#7bc6ff", "#c987ff", "#ff8cc7", "#7dffe2"],
    [],
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const beatPulse = syncState?.beatPulse ?? 0;
    const bassEnergy = syncState?.bassEnergy ?? 0;
    const pulse = started
      ? 0.58 + beatPulse * 0.45 + bassEnergy * 0.25
      : 0.48 + Math.sin(time * 1.2) * 0.04;
    const colorIndex = syncState?.barIndex ?? Math.floor(time * 0.35);

    if (leftSpot.current) {
      leftSpot.current.intensity = 26 + 24 * pulse;
      leftSpot.current.angle = 0.35 + bassEnergy * 0.08;
      leftSpot.current.color.set(palette[colorIndex % palette.length]);
    }

    if (rightSpot.current) {
      rightSpot.current.intensity = 20 + 22 * (1.15 - pulse + bassEnergy * 0.15);
      rightSpot.current.angle = 0.35 + beatPulse * 0.06;
      rightSpot.current.color.set(
        palette[(colorIndex + 2) % palette.length],
      );
    }

    if (rimLight.current) {
      rimLight.current.position.x = Math.sin(time * 0.4) * 8;
      rimLight.current.position.z = Math.cos(time * 0.4) * 8;
      rimLight.current.intensity = 10 + beatPulse * 8 + bassEnergy * 7;
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} color="#8ca8d8" />
      <hemisphereLight intensity={0.35} color="#b8d1ff" groundColor="#1b1530" />
      <directionalLight
        castShadow
        intensity={1.2}
        color="#ffffff"
        position={[8, 15, 6]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight
        ref={leftSpot}
        castShadow
        position={[-8, 14, 8]}
        angle={0.4}
        penumbra={0.5}
        intensity={35}
        distance={0}
        target-position={[-2, 0, 0]}
      />
      <spotLight
        ref={rightSpot}
        castShadow
        position={[8, 14, 8]}
        angle={0.4}
        penumbra={0.5}
        intensity={32}
        distance={0}
        target-position={[2, 0, 0]}
      />
      <pointLight
        ref={rimLight}
        position={[0, 5, -8]}
        intensity={16}
        distance={0}
        color={new THREE.Color("#5cf2ff")}
      />
    </>
  );
}
