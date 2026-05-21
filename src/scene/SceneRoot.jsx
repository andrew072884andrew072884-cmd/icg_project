import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import Stage from "./Stage";
import StageLights from "./StageLights";
import CharacterSlots from "./CharacterSlots";

export default function SceneRoot({ started, syncState }) {
  return (
    <>
      <color attach="background" args={["#040712"]} />
      <fog attach="fog" args={["#040712", 70, 140]} />

      <StageLights started={started} syncState={syncState} />

      <Suspense fallback={null}>
        <Stage syncState={syncState} />
        <CharacterSlots syncState={syncState} />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.9}
        zoomSpeed={0.85}
        target={[0, 4, 0]}
        minDistance={29}
        maxDistance={52}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.08}
      />
    </>
  );
}
