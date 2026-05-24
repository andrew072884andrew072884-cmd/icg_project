import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import BeamMatrix from "./BeamMatrix";

function assignRef(ref, value) {
  if (!ref) {
    return;
  }

  ref.current = value;
}

function TargetedSpotLight({ forwardedRef, target = [0, 0, 0], ...props }) {
  const lightRef = useRef(null);
  const targetObject = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    targetObject.position.set(...target);
    targetObject.updateMatrixWorld();

    if (lightRef.current) {
      lightRef.current.target = targetObject;
    }
  });

  return (
    <>
      <primitive object={targetObject} visible={false} />
      <spotLight
        ref={(node) => {
          lightRef.current = node;
          assignRef(forwardedRef, node);
        }}
        target={targetObject}
        {...props}
      />
    </>
  );
}

export default function StageLights({ started, syncState, danceState }) {
  const ambientRef = useRef(null);
  const hemiRef = useRef(null);
  const frontRef = useRef(null);
  const leftSpot = useRef(null);
  const rightSpot = useRef(null);
  const leftSideSpot = useRef(null);
  const rightSideSpot = useRef(null);
  const leftRimSpot = useRef(null);
  const rightRimSpot = useRef(null);
  const rimLight = useRef(null);
  const backSpot = useRef(null);
  const chorusReleaseRef = useRef(0);

  const looks = useMemo(
    () => ({
      intro: {
        ambient: { intensity: 0.075, color: "#405c8f" },
        hemi: { intensity: 0.09, sky: "#6d96db", ground: "#080918" },
        front: { intensity: 0.12, color: "#b6c9f2" },
        left: { intensity: 10, angle: 0.24, color: "#3d8fff" },
        right: { intensity: 9, angle: 0.24, color: "#644cff" },
        side: { intensity: 42, angle: 0.34, color: "#78eaff" },
        rimSide: { intensity: 260, angle: 0.33, color: "#9dffff" },
        rim: { intensity: 280, color: "#9dffff" },
        back: { intensity: 520, angle: 0.32, color: "#c8ffff" },
      },
      verse: {
        ambient: { intensity: 0.46, color: "#9db7ea" },
        hemi: { intensity: 0.52, sky: "#cfddff", ground: "#251842" },
        front: { intensity: 1.18, color: "#f4f8ff" },
        left: { intensity: 38, angle: 0.37, color: "#74c7ff" },
        right: { intensity: 36, angle: 0.37, color: "#c18bff" },
        side: { intensity: 29, angle: 0.41, color: "#8cefff" },
        rimSide: { intensity: 42, angle: 0.39, color: "#6ef2ff" },
        rim: { intensity: 38, color: "#70f4ff" },
        back: { intensity: 72, angle: 0.45, color: "#7ee8ff" },
      },
      preChorus: {
        ambient: { intensity: 0.64, color: "#c4d6ff" },
        hemi: { intensity: 0.72, sky: "#f0f5ff", ground: "#3b2060" },
        front: { intensity: 1.95, color: "#ffffff" },
        left: { intensity: 72, angle: 0.44, color: "#ff7fc5" },
        right: { intensity: 68, angle: 0.44, color: "#66ffe2" },
        side: { intensity: 58, angle: 0.46, color: "#ff9ddb" },
        rimSide: { intensity: 72, angle: 0.43, color: "#94fff6" },
        rim: { intensity: 62, color: "#9dffff" },
        back: { intensity: 120, angle: 0.5, color: "#bafffb" },
      },
      chorus: {
        ambient: { intensity: 0.78, color: "#d8e6ff" },
        hemi: { intensity: 0.86, sky: "#ffffff", ground: "#512879" },
        front: { intensity: 2.55, color: "#ffffff" },
        left: { intensity: 108, angle: 0.52, color: "#ff55b8" },
        right: { intensity: 102, angle: 0.52, color: "#58ffe0" },
        side: { intensity: 86, angle: 0.5, color: "#9dfcff" },
        rimSide: { intensity: 96, angle: 0.48, color: "#d8ffff" },
        rim: { intensity: 86, color: "#ddffff" },
        back: { intensity: 155, angle: 0.55, color: "#e5ffff" },
      },
    }),
    [],
  );

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();
    const beatIndex = syncState?.beatIndex ?? 0;
    const beatPhase = syncState?.beatPhase ?? 0;
    const beatPulse = syncState?.beatPulse ?? 0;
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
    const sectionBoost = stageCue === "chorus" ? 0.22 : stageCue === "preChorus" ? 0.09 : 0;
    const phraseProgress = ((beatIndex % 16) + beatPhase) / 16;
    const verseBreath = stageCue === "verse"
      ? 0.5 + Math.sin(phraseProgress * Math.PI * 2) * 0.5
      : 0;
    const preBuild = stageCue === "preChorus" ? phraseProgress : 0;
    const preChase = stageCue === "preChorus" ? (beatIndex % 2 === 0 ? 1 : -1) : 0;
    const preHit = stageCue === "preChorus" && beatIndex % 4 === 3 ? beatPulse : 0;
    const dropBlackout =
      stageCue === "preChorus" && beatIndex % 16 === 15 && beatPhase > 0.18 && beatPhase < 0.92
        ? 1
        : 0;
    const blackoutMainScale = 1 - dropBlackout * 0.88;
    const blackoutAmbientScale = 1 - dropBlackout * 0.94;
    const blackoutRimScale = 1 + dropBlackout * 0.65;
    const backRimHit =
      (beatIndex % 4 === 0 ? beatPulse : 0) *
      (stageCue === "chorus" ? 2.25 : stageCue === "preChorus" ? 1.85 : stageCue === "verse" ? 1.25 : 1.55);
    const pulse = started
      ? 0.42 + beatPulse * 0.36 + bassEnergy * 0.16 + sectionBoost
      : 0.22 + Math.sin(time * 1.2) * 0.02;
    const leftColor =
      stageCue === "preChorus"
        ? preChase >= 0
          ? "#ff4fbd"
          : "#63ffe9"
        : look.left.color;
    const rightColor =
      stageCue === "preChorus"
        ? preChase >= 0
          ? "#63ffe9"
          : "#ff4fbd"
        : look.right.color;

    if (ambientRef.current) {
      ambientRef.current.intensity =
        (look.ambient.intensity + beatPulse * 0.09 + preBuild * 0.12 + chorusRelease * 0.13) *
        blackoutAmbientScale;
      ambientRef.current.color.set(look.ambient.color);
    }

    if (hemiRef.current) {
      hemiRef.current.intensity =
        (look.hemi.intensity + bassEnergy * 0.08 + preBuild * 0.1 + chorusRelease * 0.14) *
        blackoutAmbientScale;
      hemiRef.current.color.set(look.hemi.sky);
      hemiRef.current.groundColor.set(look.hemi.ground);
    }

    if (frontRef.current) {
      const verseLift = stageCue === "verse" ? verseBreath * 0.16 : 0;

      frontRef.current.intensity =
        (look.front.intensity +
          beatPulse * 0.22 +
          bassEnergy * 0.1 +
          verseLift +
          preBuild * 0.5 +
          preHit * 0.35 +
          chorusRelease * 0.48) *
        blackoutMainScale;
      frontRef.current.color.set(look.front.color);
    }

    if (leftSpot.current) {
      const verseLift = stageCue === "verse" ? verseBreath * 7 : 0;
      const preLift = stageCue === "preChorus" ? (preChase > 0 ? 34 : -8) + preBuild * 18 + preHit * 30 : 0;

      leftSpot.current.intensity =
        Math.max(0, look.left.intensity + 30 * pulse + verseLift + preLift + chorusRelease * 30) *
        blackoutMainScale;
      leftSpot.current.angle = look.left.angle + bassEnergy * 0.08 + preBuild * 0.035;
      leftSpot.current.color.set(leftColor);
    }

    if (rightSpot.current) {
      const verseLift = stageCue === "verse" ? (1 - verseBreath) * 7 : 0;
      const preLift = stageCue === "preChorus" ? (preChase < 0 ? 34 : -8) + preBuild * 18 + preHit * 30 : 0;

      rightSpot.current.intensity =
        Math.max(
          0,
          look.right.intensity +
            28 * (1.05 - pulse + bassEnergy * 0.12) +
            verseLift +
            preLift +
            chorusRelease * 28,
        ) *
        blackoutMainScale;
      rightSpot.current.angle = look.right.angle + beatPulse * 0.06 + preBuild * 0.035;
      rightSpot.current.color.set(rightColor);
    }

    [leftSideSpot.current, rightSideSpot.current].forEach((sideSpot, index) => {
      if (!sideSpot) {
        return;
      }

      const verseSweep = stageCue === "verse"
        ? (index === 0 ? verseBreath : 1 - verseBreath) * 10
        : 0;
      const preSweep = stageCue === "preChorus"
        ? ((index === 0 && preChase > 0) || (index === 1 && preChase < 0) ? 32 : -10) +
          preBuild * 20 +
          preHit * 34
        : 0;

      sideSpot.intensity = Math.max(
        0,
        look.side.intensity +
          20 * pulse +
          bassEnergy * 12 +
          verseSweep +
          preSweep +
          chorusRelease * 26,
      ) * blackoutMainScale;
      sideSpot.angle = look.side.angle + beatPulse * 0.035 + preBuild * 0.05;
      sideSpot.color.set(index === 0 ? leftColor : rightColor);
    });

    [leftRimSpot.current, rightRimSpot.current].forEach((rimSpot) => {
      if (!rimSpot) {
        return;
      }

      rimSpot.intensity =
        (look.rimSide.intensity +
          beatPulse * 22 +
          bassEnergy * 18 +
          preBuild * 36 +
          preHit * 28 +
          chorusRelease * 24 +
          backRimHit * 185) *
        blackoutRimScale;
      rimSpot.angle = look.rimSide.angle + bassEnergy * 0.03 + preBuild * 0.04;
      rimSpot.color.set(look.rimSide.color);
    });

    if (rimLight.current) {
      rimLight.current.position.x = 0;
      rimLight.current.position.y = 5.6;
      rimLight.current.position.z = -8.8;
      rimLight.current.intensity =
        (look.rim.intensity +
          beatPulse * 18 +
          bassEnergy * 14 +
          sectionBoost * 20 +
          preBuild * 42 +
          preHit * 34 +
          chorusRelease * 22 +
          backRimHit * 160) *
        blackoutRimScale;
      rimLight.current.color.set(look.rim.color);
    }

    if (backSpot.current) {
      backSpot.current.intensity =
        (look.back.intensity +
          beatPulse * 36 +
          bassEnergy * 30 +
          sectionBoost * 24 +
          preBuild * 55 +
          preHit * 46 +
          chorusRelease * 42 +
          backRimHit * 220) *
        blackoutRimScale;
      backSpot.current.angle =
        look.back.angle + bassEnergy * 0.04 + preBuild * 0.04 - dropBlackout * 0.08;
      backSpot.current.color.set(look.back.color);
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
      <TargetedSpotLight
        forwardedRef={leftSpot}
        position={[-8, 18, 8]}
        angle={0.4}
        penumbra={0.5}
        intensity={35}
        distance={0}
        target={[-2, 1.7, 0]}
      />
      <TargetedSpotLight
        forwardedRef={rightSpot}
        position={[8, 18, 8]}
        angle={0.4}
        penumbra={0.5}
        intensity={32}
        distance={0}
        target={[2, 1.7, 0]}
      />
      <TargetedSpotLight
        forwardedRef={leftSideSpot}
        position={[-12.5, 8.4, 2.5]}
        angle={0.42}
        penumbra={0.72}
        intensity={36}
        distance={0}
        target={[0, 2.2, 0]}
      />
      <TargetedSpotLight
        forwardedRef={rightSideSpot}
        position={[12.5, 8.4, 2.5]}
        angle={0.42}
        penumbra={0.72}
        intensity={36}
        distance={0}
        target={[0, 2.2, 0]}
      />
      <TargetedSpotLight
        forwardedRef={leftRimSpot}
        position={[-7.5, 9.5, -10.5]}
        angle={0.34}
        penumbra={0.62}
        intensity={120}
        distance={0}
        target={[-1.8, 2.4, 0]}
      />
      <TargetedSpotLight
        forwardedRef={rightRimSpot}
        position={[7.5, 9.5, -10.5]}
        angle={0.34}
        penumbra={0.62}
        intensity={120}
        distance={0}
        target={[1.8, 2.4, 0]}
      />
      <pointLight
        ref={rimLight}
        position={[0, 5, -8]}
        intensity={16}
        distance={0}
        color={new THREE.Color("#5cf2ff")}
      />
      <TargetedSpotLight
        forwardedRef={backSpot}
        position={[0, 11.5, -15.5]}
        angle={0.38}
        penumbra={0.58}
        intensity={120}
        distance={0}
        color="#9dfcff"
        target={[0, 2.6, 0]}
      />
      <BeamMatrix syncState={syncState} danceState={danceState} />
    </>
  );
}
