import { Float, Html, useFBX, useGLTF } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { characterSlots } from "../config/characterSlots";

function prepareCharacterScene(source, slot) {
  const clonedScene = SkeletonUtils.clone(source);

  clonedScene.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;
    child.frustumCulled = false;

    if (Array.isArray(child.material)) {
      child.material.forEach((material) => {
        if (material) {
          material.needsUpdate = true;
        }
      });
    } else if (child.material) {
      child.material.needsUpdate = true;
    }
  });

  clonedScene.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(clonedScene);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);

  const targetHeight = slot.targetHeight ?? 5.8;
  const scaleFactor =
    ((slot.scaleMultiplier ?? 1) * targetHeight) / Math.max(size.y, 0.001);

  const localPosition = [
    (slot.offsetX ?? 0) - center.x * scaleFactor,
    (slot.offsetY ?? 0) - bounds.min.y * scaleFactor,
    (slot.offsetZ ?? 0) - center.z * scaleFactor,
  ];

  return {
    clonedScene,
    localPosition,
    scaleFactor,
  };
}

function FittedCharacter({ scene, slot }) {
  const fitted = useMemo(() => prepareCharacterScene(scene, slot), [scene, slot]);

  return (
    <group position={slot.position} rotation={[0, slot.rotationY, 0]}>
      <primitive
        object={fitted.clonedScene}
        position={fitted.localPosition}
        scale={fitted.scaleFactor}
      />
    </group>
  );
}

function ImportedGltfCharacter({ slot }) {
  const gltf = useGLTF(slot.url);

  return <FittedCharacter scene={gltf.scene} slot={slot} />;
}

function ImportedFbxCharacter({ slot }) {
  const fbx = useFBX(slot.url);

  return <FittedCharacter scene={fbx} slot={slot} />;
}

function ImportedCharacter({ slot }) {
  const url = slot.url.toLowerCase();

  if (url.endsWith(".fbx")) {
    return <ImportedFbxCharacter slot={slot} />;
  }

  return <ImportedGltfCharacter slot={slot} />;
}

function PlaceholderCharacter({ slot, syncState }) {
  const root = useRef(null);

  useFrame(({ clock }) => {
    const beatPulse = syncState?.beatPulse ?? 0;
    const bassEnergy = syncState?.bassEnergy ?? 0;
    const idle = Math.sin(clock.getElapsedTime() * 1.6) * 0.08;

    if (!root.current) {
      return;
    }

    root.current.position.y = slot.position[1] + idle + beatPulse * 0.22 + bassEnergy * 0.08;
    const scale = 1 + beatPulse * 0.045 + bassEnergy * 0.03;
    root.current.scale.setScalar(scale);
  });

  return (
    <group ref={root} position={slot.position} rotation={[0, slot.rotationY, 0]}>
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.35}>
        <mesh castShadow receiveShadow position={[0, 2.05, 0]}>
          <capsuleGeometry args={[0.72, 2.8, 8, 16]} />
          <meshStandardMaterial
            color="#d7e4ff"
            emissive={slot.accent}
            emissiveIntensity={0.32}
            transparent
            opacity={0.82}
            roughness={0.3}
            metalness={0.15}
          />
        </mesh>
        <mesh position={[0, 4.3, 0]} castShadow>
          <sphereGeometry args={[0.62, 24, 24]} />
          <meshStandardMaterial
            color="#edf4ff"
            emissive={slot.accent}
            emissiveIntensity={0.24}
            transparent
            opacity={0.9}
          />
        </mesh>
      </Float>

      <Html position={[0, 5.45, 0]} center distanceFactor={11}>
        <div
          style={{
            padding: "6px 10px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(8,12,20,0.72)",
            color: "#f4f7ff",
            fontSize: "12px",
            whiteSpace: "nowrap",
          }}
        >
          {slot.label} - waiting for CC avatar
        </div>
      </Html>
    </group>
  );
}

export default function CharacterSlots({ syncState }) {
  return (
    <group>
      {characterSlots.map((slot) =>
        slot.url ? (
          <ImportedCharacter key={slot.id} slot={slot} />
        ) : (
          <PlaceholderCharacter key={slot.id} slot={slot} syncState={syncState} />
        ),
      )}
    </group>
  );
}
