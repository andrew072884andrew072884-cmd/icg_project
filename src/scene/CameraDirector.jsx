import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

export default function CameraDirector({ cameraMode, controlsRef, syncState, started }) {
  const { camera } = useThree();

  const presets = useMemo(
    () => ({
      intro: {
        position: new THREE.Vector3(0, 11, 42),
        target: new THREE.Vector3(0, 4.3, 0),
        fov: 42,
      },
      verse: {
        position: new THREE.Vector3(0, 12, 34),
        target: new THREE.Vector3(0, 4.1, 0),
        fov: 43,
      },
      preChorus: {
        position: new THREE.Vector3(-7, 12, 31),
        target: new THREE.Vector3(0, 4.2, 0),
        fov: 42,
      },
      chorus: {
        position: new THREE.Vector3(7, 10.5, 28),
        target: new THREE.Vector3(0, 4, 0),
        fov: 40,
      },
      leadFancam: {
        position: new THREE.Vector3(-4.9, 5.1, 10.8),
        target: new THREE.Vector3(-3.1, 3.15, 0),
        fov: 29,
      },
      partnerFancam: {
        position: new THREE.Vector3(4.9, 5.1, 10.8),
        target: new THREE.Vector3(3.1, 3.1, 0),
        fov: 29,
      },
      duoClose: {
        position: new THREE.Vector3(0, 5.8, 15.6),
        target: new THREE.Vector3(0, 3.25, 0),
        fov: 32,
      },
    }),
    [],
  );

  useFrame(() => {
    if (cameraMode !== "auto") {
      return;
    }

    const stageCue = started ? syncState?.stageCue ?? "intro" : "intro";
    const beatIndex = syncState?.beatIndex ?? 0;
    const phraseShot = Math.floor(beatIndex / 4) % 4;
    const preset =
      stageCue === "chorus" && phraseShot === 1
        ? presets.leadFancam
        : stageCue === "chorus" && phraseShot === 3
          ? presets.partnerFancam
          : stageCue === "preChorus" && phraseShot % 2 === 1
            ? presets.duoClose
            : presets[stageCue] ?? presets.intro;
    const beatPulse = syncState?.beatPulse ?? 0;
    const isFancam = preset === presets.leadFancam || preset === presets.partnerFancam;
    const push = stageCue === "chorus" ? beatPulse * (isFancam ? 0.34 : 1.2) : 0;
    const targetPosition = preset.position.clone();
    targetPosition.z -= push;

    camera.position.lerp(targetPosition, isFancam ? 0.055 : 0.035);
    camera.fov += (preset.fov - camera.fov) * (isFancam ? 0.065 : 0.04);
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.lerp(preset.target, isFancam ? 0.075 : 0.05);
      controlsRef.current.update();
    } else {
      camera.lookAt(preset.target);
    }
  });

  return null;
}
