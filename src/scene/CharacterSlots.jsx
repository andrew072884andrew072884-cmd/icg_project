import { Float, Html, useFBX, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { characterSlots } from "../config/characterSlots";
import {
  getSyncedClipTime,
  resolveDanceAnimationClip,
} from "../dance/animationRegistry";
import { getFormationPose } from "../dance/formationLibrary";
import { getProceduralDancePose } from "../dance/proceduralDance";

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

function restoreSkeletonPose(scene) {
  scene.traverse((child) => {
    if (child.isSkinnedMesh && child.skeleton) {
      child.skeleton.pose();
    }
  });
}

function FittedCharacter({ scene, animations = [], slot, syncState, danceState }) {
  const root = useRef(null);
  const mixer = useRef(null);
  const activeAction = useRef(null);
  const activeBinding = useRef(null);
  const fitted = useMemo(() => prepareCharacterScene(scene, slot), [scene, slot]);

  useEffect(() => {
    mixer.current = new THREE.AnimationMixer(fitted.clonedScene);

    return () => {
      mixer.current?.stopAllAction();
      mixer.current = null;
      activeAction.current = null;
      activeBinding.current = null;
    };
  }, [fitted.clonedScene]);

  useEffect(() => {
    if (!mixer.current || !danceState?.activeMove?.id) {
      return;
    }

    const resolved = resolveDanceAnimationClip({
      moveId: danceState.activeMove.id,
      animations,
      animationSetId: slot.animationSet,
    });

    if (!resolved.clip) {
      mixer.current.stopAllAction();
      restoreSkeletonPose(fitted.clonedScene);
      activeAction.current = null;
      activeBinding.current = null;
      return;
    }

    const nextAction = mixer.current.clipAction(resolved.clip);

    if (activeAction.current && activeAction.current !== nextAction) {
      activeAction.current.fadeOut(0.12);
    }

    nextAction
      .reset()
      .setLoop(THREE.LoopRepeat, Infinity)
      .setEffectiveWeight(1)
      .fadeIn(0.12)
      .play();

    activeAction.current = nextAction;
    activeBinding.current = resolved.binding;
  }, [animations, danceState?.activeMove?.id, fitted.clonedScene, slot.animationSet]);

  useFrame(({ clock }) => {
    const formationPose = getFormationPose({
      activeMove: danceState?.activeMove,
      slot,
      modulePhase: danceState?.modulePhase ?? 0,
      activeSlotIndex: danceState?.activeSlotIndex ?? 0,
    });

    if (mixer.current && activeAction.current) {
      if (root.current) {
        root.current.position.set(...formationPose.position);
        root.current.rotation.set(0, formationPose.rotationY, 0);
      }

      const clipTime = getSyncedClipTime(
        activeAction.current.getClip(),
        danceState?.modulePhase ?? 0,
        activeBinding.current,
      );

      mixer.current.setTime(clipTime);
      return;
    }

    if (!root.current) {
      return;
    }

    const activeMoveId = danceState?.activeMove?.id ?? "bounce-step";
    const pose = getProceduralDancePose(
      activeMoveId,
      slot.id,
      danceState?.modulePhase ?? 0,
      syncState?.beatPulse ?? 0,
      syncState?.bassEnergy ?? 0,
    );
    const idle = Math.sin(clock.getElapsedTime() * 1.6) * 0.04;

    root.current.position.x = formationPose.position[0] + pose.x * 0.45;
    root.current.position.y = formationPose.position[1] + idle + pose.y * 0.25;
    root.current.position.z = formationPose.position[2] + pose.z * 0.45;
    root.current.rotation.y = formationPose.rotationY + pose.rotationY * 0.35;
    root.current.rotation.z = pose.rotationZ * 0.2;
  });

  return (
    <group ref={root} position={slot.position} rotation={[0, slot.rotationY, 0]}>
      <primitive
        object={fitted.clonedScene}
        position={fitted.localPosition}
        scale={fitted.scaleFactor}
      />
    </group>
  );
}

function ImportedGltfCharacter({ slot, syncState, danceState }) {
  const gltf = useGLTF(slot.url);

  return (
    <FittedCharacter
      scene={gltf.scene}
      animations={gltf.animations}
      slot={slot}
      syncState={syncState}
      danceState={danceState}
    />
  );
}

function ImportedFbxCharacter({ slot, syncState, danceState }) {
  const fbx = useFBX(slot.url);

  return (
    <FittedCharacter
      scene={fbx}
      animations={fbx.animations}
      slot={slot}
      syncState={syncState}
      danceState={danceState}
    />
  );
}

function ImportedCharacter({ slot, syncState, danceState }) {
  const url = slot.url.toLowerCase();

  if (url.endsWith(".fbx")) {
    return (
      <ImportedFbxCharacter
        slot={slot}
        syncState={syncState}
        danceState={danceState}
      />
    );
  }

  return (
    <ImportedGltfCharacter
      slot={slot}
      syncState={syncState}
      danceState={danceState}
    />
  );
}

function PlaceholderCharacter({ slot, syncState, danceState }) {
  const root = useRef(null);
  const bodyMaterial = useRef(null);
  const headMaterial = useRef(null);

  useFrame(({ clock }) => {
    const beatPulse = syncState?.beatPulse ?? 0;
    const bassEnergy = syncState?.bassEnergy ?? 0;
    const stageCue = syncState?.stageCue ?? "intro";
    const idle = Math.sin(clock.getElapsedTime() * 1.6) * 0.08;
    const activeMoveId = danceState?.activeMove?.id ?? "bounce-step";
    const formationPose = getFormationPose({
      activeMove: danceState?.activeMove,
      slot,
      modulePhase: danceState?.modulePhase ?? 0,
      activeSlotIndex: danceState?.activeSlotIndex ?? 0,
    });
    const pose = getProceduralDancePose(
      activeMoveId,
      slot.id,
      danceState?.modulePhase ?? 0,
      beatPulse,
      bassEnergy,
    );

    if (!root.current) {
      return;
    }

    root.current.position.x = formationPose.position[0] + pose.x;
    root.current.position.y = formationPose.position[1] + idle + pose.y;
    root.current.position.z = formationPose.position[2] + pose.z;
    root.current.rotation.y = formationPose.rotationY + pose.rotationY;
    root.current.rotation.z = pose.rotationZ;
    const baseScale = slot.placeholderScale ?? 1;
    const scale = baseScale * (1 + beatPulse * 0.045 + bassEnergy * 0.03);
    root.current.scale.setScalar(scale);

    const silhouette = stageCue === "intro";

    if (bodyMaterial.current) {
      bodyMaterial.current.emissiveIntensity = silhouette ? 0.02 : 0.18 + beatPulse * 0.08;
      bodyMaterial.current.opacity = silhouette ? 0.56 : 0.82;
    }

    if (headMaterial.current) {
      headMaterial.current.emissiveIntensity = silhouette ? 0.015 : 0.13 + beatPulse * 0.06;
      headMaterial.current.opacity = silhouette ? 0.62 : 0.9;
    }
  });

  return (
    <group ref={root} position={slot.position} rotation={[0, slot.rotationY, 0]}>
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.35}>
        <mesh castShadow receiveShadow position={[0, 2.05, 0]}>
          <capsuleGeometry args={[0.72, 2.8, 8, 16]} />
          <meshStandardMaterial
            ref={bodyMaterial}
            color="#d7e4ff"
            emissive={slot.accent}
            emissiveIntensity={0.18}
            transparent
            opacity={0.82}
            roughness={0.3}
            metalness={0.15}
          />
        </mesh>
        <mesh position={[0, 4.3, 0]} castShadow>
          <sphereGeometry args={[0.62, 24, 24]} />
          <meshStandardMaterial
            ref={headMaterial}
            color="#edf4ff"
            emissive={slot.accent}
            emissiveIntensity={0.13}
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

export default function CharacterSlots({ syncState, danceState }) {
  return (
    <group>
      {characterSlots.map((slot) =>
        slot.url ? (
          <ImportedCharacter
            key={slot.id}
            slot={slot}
            syncState={syncState}
            danceState={danceState}
          />
        ) : (
          <PlaceholderCharacter
            key={slot.id}
            slot={slot}
            syncState={syncState}
            danceState={danceState}
          />
        ),
      )}
    </group>
  );
}
