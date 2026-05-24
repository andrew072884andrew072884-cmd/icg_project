import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { getDancerFocusPoints, getDuoFocusPoint } from "../dance/danceFocus";
import { loadOriginalMovieData } from "../dance/originalMovie";

export default function CameraDirector({
  cameraMode,
  controlsRef,
  syncState,
  started,
  danceState,
}) {
  const { camera } = useThree();
  const [originalMovieData, setOriginalMovieData] = useState(null);

  const presets = useMemo(
    () => ({
      intro: {
        position: new THREE.Vector3(0, 11, 42),
        target: new THREE.Vector3(0, 4.3, 0),
        fov: 42,
        follow: "duo",
        followAmount: 0.65,
      },
      verse: {
        position: new THREE.Vector3(0, 12, 34),
        target: new THREE.Vector3(0, 4.1, 0),
        fov: 43,
        follow: "duo",
        followAmount: 0.72,
        orbit: {
          angle: THREE.MathUtils.degToRad(12),
          height: 1.1,
          periodBeats: 32,
          phaseOffset: 0,
        },
      },
      preChorus: {
        position: new THREE.Vector3(-7, 12, 31),
        target: new THREE.Vector3(0, 4.2, 0),
        fov: 42,
        follow: "duo",
        followAmount: 0.78,
        orbit: {
          angle: THREE.MathUtils.degToRad(8),
          height: 0.75,
          periodBeats: 16,
          phaseOffset: 0.15,
        },
      },
      chorus: {
        position: new THREE.Vector3(7, 10.5, 28),
        target: new THREE.Vector3(0, 4, 0),
        fov: 40,
        follow: "duo",
        followAmount: 0.82,
        orbit: {
          angle: THREE.MathUtils.degToRad(6),
          height: 0.5,
          periodBeats: 16,
          phaseOffset: 0.3,
        },
      },
      leadFancam: {
        position: new THREE.Vector3(-4.9, 5.1, 10.8),
        target: new THREE.Vector3(-3.1, 3.15, 0),
        fov: 29,
        follow: "lead",
        followAmount: 1,
      },
      partnerFancam: {
        position: new THREE.Vector3(4.9, 5.1, 10.8),
        target: new THREE.Vector3(3.1, 3.1, 0),
        fov: 29,
        follow: "partner",
        followAmount: 1,
      },
      duoClose: {
        position: new THREE.Vector3(0, 5.8, 15.6),
        target: new THREE.Vector3(0, 3.25, 0),
        fov: 32,
        follow: "duo",
        followAmount: 1,
      },
    }),
    [],
  );
  const scratch = useMemo(
    () => ({
      dynamicTarget: new THREE.Vector3(),
      targetPosition: new THREE.Vector3(),
      offset: new THREE.Vector3(),
      upAxis: new THREE.Vector3(0, 1, 0),
    }),
    [],
  );

  useEffect(() => {
    const usesOriginalFocus =
      danceState?.sequenceMode === "original" ||
      danceState?.sequenceMode === "originalPuppet";

    if (!usesOriginalFocus || originalMovieData) {
      return;
    }

    let cancelled = false;

    loadOriginalMovieData()
      .then((loadedMovieData) => {
        if (!cancelled) {
          setOriginalMovieData(loadedMovieData);
        }
      })
      .catch((error) => {
        console.error("Original movie data failed to load for camera focus", error);
      });

    return () => {
      cancelled = true;
    };
  }, [danceState?.sequenceMode, originalMovieData]);

  useFrame(() => {
    if (cameraMode !== "auto") {
      return;
    }

    const stageCue = started ? syncState?.stageCue ?? "intro" : "intro";
    const beatIndex = syncState?.beatIndex ?? 0;
    const beatPhase = syncState?.beatPhase ?? 0;
    const phraseShot = Math.floor(beatIndex / 4) % 4;
    const presetKey =
      stageCue === "chorus" && phraseShot === 1
        ? "leadFancam"
        : stageCue === "chorus" && phraseShot === 3
          ? "partnerFancam"
          : stageCue === "preChorus" && phraseShot % 2 === 1
            ? "duoClose"
            : stageCue;
    const preset = presets[presetKey] ?? presets.intro;
    const dancerFocus = getDancerFocusPoints({
      danceState,
      syncState,
      originalMovieData,
    });
    const duoFocus = getDuoFocusPoint(dancerFocus);
    const followTarget =
      preset.follow === "lead"
        ? dancerFocus.lead ?? duoFocus
        : preset.follow === "partner"
          ? dancerFocus.partner ?? duoFocus
          : duoFocus;
    const beatPulse = syncState?.beatPulse ?? 0;
    const isFancam = presetKey === "leadFancam" || presetKey === "partnerFancam";
    const orbitProfile = preset.orbit;
    const orbitStrength = started && orbitProfile && !isFancam ? 1 : 0;
    const push = stageCue === "chorus" ? beatPulse * (isFancam ? 0.34 : 1.2) : 0;
    const followAmount = preset.followAmount ?? 1;
    scratch.dynamicTarget.copy(preset.target).lerp(followTarget, followAmount);
    scratch.offset.subVectors(preset.position, preset.target);
    if (orbitStrength) {
      const orbitProgress =
        (beatIndex + beatPhase) / orbitProfile.periodBeats + (orbitProfile.phaseOffset ?? 0);
      const orbitWave = orbitProgress * Math.PI * 2;
      const orbitAngle = Math.sin(orbitWave) * orbitProfile.angle * orbitStrength;
      scratch.offset.applyAxisAngle(scratch.upAxis, orbitAngle);
      scratch.offset.y += Math.sin(orbitWave + Math.PI / 2) * orbitProfile.height * orbitStrength;
    }
    scratch.targetPosition.copy(scratch.dynamicTarget).add(scratch.offset);
    scratch.targetPosition.z -= push;

    camera.position.lerp(scratch.targetPosition, orbitStrength ? 0.026 : isFancam ? 0.055 : 0.035);
    camera.fov += (preset.fov - camera.fov) * (isFancam ? 0.065 : 0.04);
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.lerp(scratch.dynamicTarget, isFancam ? 0.075 : 0.05);
      controlsRef.current.update();
    } else {
      camera.lookAt(scratch.dynamicTarget);
    }
  });

  return null;
}
