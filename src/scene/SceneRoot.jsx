import { Suspense, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import Stage from "./Stage";
import StageLights from "./StageLights";
import CharacterSlots from "./CharacterSlots";
import CameraDirector from "./CameraDirector";
import BeatHaze from "./BeatHaze";

export default function SceneRoot({ started, syncState, cameraMode, danceState }) {
  const controlsRef = useRef(null);

  return (
    <>
      <color attach="background" args={["#040712"]} />
      <BeatHaze syncState={syncState} />

      <StageLights started={started} syncState={syncState} danceState={danceState} />

      <Suspense fallback={null}>
        <Stage syncState={syncState} />
        <CharacterSlots syncState={syncState} danceState={danceState} />
      </Suspense>

      <CameraDirector
        controlsRef={controlsRef}
        cameraMode={cameraMode}
        syncState={syncState}
        started={started}
        danceState={danceState}
      />

      <OrbitControls
        ref={controlsRef}
        enabled={cameraMode === "manual"}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.9}
        zoomSpeed={0.85}
        target={[0, 4, 0]}
        minDistance={8.5}
        maxDistance={56}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.08}
      />
    </>
  );
}
