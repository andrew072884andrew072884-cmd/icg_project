import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import BeamMatrix from "./BeamMatrix";

export default function StageLights({ started, syncState }) {
  const ambientRef = useRef(null);
  const hemiRef = useRef(null);
  const frontRef = useRef(null);
  const leftSpot = useRef(null);
  const rightSpot = useRef(null);
  const rimLight = useRef(null);

  const looks = useMemo(
    () => ({
      intro: {
        ambient: { intensity: 0.075, color: "#405c8f" },
        hemi: { intensity: 0.09, sky: "#6d96db", ground: "#080918" },
        front: { intensity: 0.12, color: "#b6c9f2" },
        left: { intensity: 7, angle: 0.24, color: "#3d8fff" },
        right: { intensity: 6, angle: 0.24, color: "#644cff" },
        rim: { intensity: 66, color: "#7ff2ff" },
      },
      verse: {
        ambient: { intensity: 0.34, color: "#92abd9" },
        hemi: { intensity: 0.36, sky: "#b8d0ff", ground: "#1d1734" },
        front: { intensity: 0.9, color: "#f6f8ff" },
        left: { intensity: 24, angle: 0.34, color: "#6fb9ff" },
        right: { intensity: 22, angle: 0.34, color: "#b67aff" },
        rim: { intensity: 26, color: "#5cf2ff" },
      },
      preChorus: {
        ambient: { intensity: 0.42, color: "#afc6f8" },
        hemi: { intensity: 0.46, sky: "#dee7ff", ground: "#321a4d" },
        front: { intensity: 1.24, color: "#ffffff" },
        left: { intensity: 45, angle: 0.41, color: "#ff74bd" },
        right: { intensity: 40, angle: 0.41, color: "#62ffd5" },
        rim: { intensity: 36, color: "#82f8ff" },
      },
      chorus: {
        ambient: { intensity: 0.5, color: "#c2d8ff" },
        hemi: { intensity: 0.54, sky: "#f1f6ff", ground: "#431b62" },
        front: { intensity: 1.62, color: "#ffffff" },
        left: { intensity: 68, angle: 0.48, color: "#ff4fb2" },
        right: { intensity: 62, angle: 0.48, color: "#57ffd6" },
        rim: { intensity: 46, color: "#b8ffff" },
      },
    }),
    [],
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const beatPulse = syncState?.beatPulse ?? 0;
    const bassEnergy = syncState?.bassEnergy ?? 0;
    const stageCue = syncState?.stageCue ?? "intro";
    const look = looks[stageCue] ?? looks.intro;
    const sectionBoost = stageCue === "chorus" ? 0.22 : stageCue === "preChorus" ? 0.09 : 0;
    const pulse = started
      ? 0.42 + beatPulse * 0.36 + bassEnergy * 0.16 + sectionBoost
      : 0.22 + Math.sin(time * 1.2) * 0.02;

    if (ambientRef.current) {
      ambientRef.current.intensity = look.ambient.intensity + beatPulse * 0.06;
      ambientRef.current.color.set(look.ambient.color);
    }

    if (hemiRef.current) {
      hemiRef.current.intensity = look.hemi.intensity + bassEnergy * 0.05;
      hemiRef.current.color.set(look.hemi.sky);
      hemiRef.current.groundColor.set(look.hemi.ground);
    }

    if (frontRef.current) {
      frontRef.current.intensity = look.front.intensity + beatPulse * 0.12;
      frontRef.current.color.set(look.front.color);
    }

    if (leftSpot.current) {
      leftSpot.current.intensity = look.left.intensity + 22 * pulse;
      leftSpot.current.angle = look.left.angle + bassEnergy * 0.08;
      leftSpot.current.color.set(look.left.color);
    }

    if (rightSpot.current) {
      rightSpot.current.intensity =
        look.right.intensity + 20 * (1.05 - pulse + bassEnergy * 0.12);
      rightSpot.current.angle = look.right.angle + beatPulse * 0.06;
      rightSpot.current.color.set(look.right.color);
    }

    if (rimLight.current) {
      rimLight.current.position.x = 0;
      rimLight.current.position.y = 5.6;
      rimLight.current.position.z = -8.8;
      rimLight.current.intensity =
        look.rim.intensity + beatPulse * 8 + bassEnergy * 7 + sectionBoost * 16;
      rimLight.current.color.set(look.rim.color);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.45} color="#8ca8d8" />
      <hemisphereLight
        ref={hemiRef}
        intensity={0.35}
        color="#b8d1ff"
        groundColor="#1b1530"
      />
      <directionalLight
        ref={frontRef}
        castShadow
        intensity={1.2}
        color="#ffffff"
        position={[8, 15, 6]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight
        ref={leftSpot}
        position={[-8, 18, 8]}
        angle={0.4}
        penumbra={0.5}
        intensity={35}
        distance={0}
        target-position={[-2, 0, 0]}
      />
      <spotLight
        ref={rightSpot}
        position={[8, 18, 8]}
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
      <BeamMatrix syncState={syncState} />
    </>
  );
}
