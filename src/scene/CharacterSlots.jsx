import { Float, Html, useFBX, useGLTF } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { FBXLoader } from "three-stdlib";
import { characterSlots } from "../config/characterSlots";
import {
  applyOriginalPuppetPose,
  createOriginalPuppetRig,
  getOriginalRootMotionPose,
  loadOriginalMovieData,
} from "../dance/originalMovie";
import { danceMoveMap } from "../dance/danceLibrary";
import {
  createExternalDanceAnimationClips,
  getExternalDanceAnimationSourcesForMoveIds,
  getSyncedClipTime,
  retargetExternalAnimationClipsToScene,
  resolveDanceAnimationClip,
} from "../dance/animationRegistry";
import { getFormationPose } from "../dance/formationLibrary";
import { getProceduralDancePose } from "../dance/proceduralDance";
import OriginalBlockDancers from "./OriginalBlockDancers";

const STAGE_CONTACT_Y = 0.42;
const FOOT_CONTACT_BONE_NAMES = [
  "leftToeBase",
  "rightToeBase",
  "leftToeEnd",
  "rightToeEnd",
  "leftFoot",
  "rightFoot",
];
const ACTION_TRANSITION_BEATS = 2;
const FLOORWORK_CONTACT_TAGS = new Set(["floorwork"]);

function smoothstep(value) {
  const x = Math.min(1, Math.max(0, value));

  return x * x * (3 - 2 * x);
}

function getPoseModuleBlend(moveId, modulePhase) {
  if (!danceMoveMap[moveId]?.tags?.includes("poseHold")) {
    return null;
  }

  if (modulePhase < 0.25) {
    return smoothstep(modulePhase / 0.25);
  }

  return 1;
}

function getActionTransitionState(modulePhase, activeBeatSpan = 8) {
  const beatSpan = Math.max(1, activeBeatSpan || 8);
  const windowPhase = Math.min(0.22, ACTION_TRANSITION_BEATS / beatSpan);

  if (modulePhase >= windowPhase) {
    return {
      blend: 1,
      previousPhase: 1,
      windowPhase,
    };
  }

  const blend = smoothstep(modulePhase / windowPhase);

  return {
    blend,
    previousPhase: 0.999,
    windowPhase,
  };
}

function normalizeRigNodeName(value) {
  const nodeName = String(value ?? "");
  const namespaceIndex = nodeName.lastIndexOf(":");
  const withoutNamespace =
    namespaceIndex >= 0 ? nodeName.slice(namespaceIndex + 1) : nodeName;
  const withoutMixamoPrefix = withoutNamespace.replace(/^mixamorig\d*/i, "");

  return withoutMixamoPrefix.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function createFootContactRig(scene) {
  const targetNames = new Set(FOOT_CONTACT_BONE_NAMES.map(normalizeRigNodeName));
  const bones = [];

  scene.traverse((child) => {
    if (!child.isBone) {
      return;
    }

    if (targetNames.has(normalizeRigNodeName(child.name))) {
      bones.push(child);
    }
  });

  return {
    bones,
    scratchPosition: new THREE.Vector3(),
  };
}

function createVisibleContactRig(scene) {
  const meshes = [];

  scene.traverse((child) => {
    if (!child.isMesh || !child.geometry) {
      return;
    }

    meshes.push(child);
  });

  return {
    meshes,
    bounds: new THREE.Box3(),
    meshBounds: new THREE.Box3(),
  };
}

function groundCharacterToLowestFoot(root, contactRig, stageY = STAGE_CONTACT_Y) {
  if (!root || !contactRig?.bones?.length) {
    return;
  }

  root.updateMatrixWorld(true);

  let lowestFootY = Infinity;

  contactRig.bones.forEach((bone) => {
    bone.getWorldPosition(contactRig.scratchPosition);
    lowestFootY = Math.min(lowestFootY, contactRig.scratchPosition.y);
  });

  if (!Number.isFinite(lowestFootY)) {
    return;
  }

  root.position.y += stageY - lowestFootY;
  root.updateMatrixWorld(true);
}

function groundCharacterToVisibleBounds(root, contactRig, stageY = STAGE_CONTACT_Y) {
  if (!root || !contactRig?.meshes?.length) {
    return;
  }

  root.updateMatrixWorld(true);
  contactRig.bounds.makeEmpty();

  contactRig.meshes.forEach((mesh) => {
    if (mesh.isSkinnedMesh && typeof mesh.computeBoundingBox === "function") {
      mesh.computeBoundingBox();

      if (mesh.boundingBox) {
        contactRig.meshBounds.copy(mesh.boundingBox).applyMatrix4(mesh.matrixWorld);
        contactRig.bounds.union(contactRig.meshBounds);
      }

      return;
    }

    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox();
    }

    if (mesh.geometry.boundingBox) {
      contactRig.meshBounds.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
      contactRig.bounds.union(contactRig.meshBounds);
    }
  });

  if (contactRig.bounds.isEmpty() || !Number.isFinite(contactRig.bounds.min.y)) {
    return;
  }

  root.position.y += stageY - contactRig.bounds.min.y;
  root.updateMatrixWorld(true);
}

function usesVisibleFloorContact(moveId) {
  const tags = danceMoveMap[moveId]?.tags ?? [];

  return tags.some((tag) => FLOORWORK_CONTACT_TAGS.has(tag));
}

function groundCharacterToStage(root, footContactRig, visibleContactRig, moveId) {
  if (usesVisibleFloorContact(moveId)) {
    groundCharacterToVisibleBounds(root, visibleContactRig);
    return;
  }

  groundCharacterToLowestFoot(root, footContactRig);
}

function prepareCharacterScene(source, slot) {
  // Ensure the source hierarchy has updated world matrices before cloning,
  // otherwise SkeletonUtils might bind the cloned skeleton with wrong bone scales/positions
  // (which causes detached meshes or giant shoes in FBX).
  source.updateMatrixWorld(true);

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

  /* Compute bounds from raw geometry positions instead of the scene object.
     For SkinnedMesh the vertex buffer is already in bind-pose space, so this
     gives us the correct T-pose / A-pose dimensions without touching the
     skeleton (which can break Mixamo FBX meshes). */
  const bounds = new THREE.Box3();
  const tempBox = new THREE.Box3();
  let hasGeometry = false;

  clonedScene.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) {
      return;
    }

    tempBox.setFromBufferAttribute(child.geometry.attributes.position);

    if (!child.isSkinnedMesh) {
      tempBox.applyMatrix4(child.matrixWorld);
    }

    bounds.union(tempBox);
    hasGeometry = true;
  });

  if (!hasGeometry) {
    bounds.setFromObject(clonedScene);
  }
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
  // Disabling skeleton.pose() because FBX skeletons from Mixamo often have 
  // complex node hierarchies where calling pose() breaks the bind matrices,
  // causing parts of the mesh to fly away or scale infinitely.
  /*
  scene.traverse((child) => {
    if (child.isSkinnedMesh && child.skeleton) {
      child.skeleton.pose();
    }
  });
  */
}

function useExternalDanceAnimationClips(danceState) {
  const moveIdKey = useMemo(() => {
    const moveIds = new Set(["neutral-ready"]);

    danceState?.sequence?.forEach((slot) => {
      if (slot.moveId) {
        moveIds.add(slot.moveId);
      }
    });

    if (danceState?.activeMove?.id) {
      moveIds.add(danceState.activeMove.id);
    }

    return Array.from(moveIds).sort().join("|");
  }, [danceState?.activeMove?.id, danceState?.sequence]);
  const externalSources = useMemo(
    () => getExternalDanceAnimationSourcesForMoveIds(moveIdKey.split("|")),
    [moveIdKey],
  );
  const loadedFbxFiles = useLoader(
    FBXLoader,
    externalSources.map((source) => source.url),
  );

  return useMemo(
    () => createExternalDanceAnimationClips(loadedFbxFiles, externalSources),
    [externalSources, loadedFbxFiles],
  );
}

function FittedCharacter({
  scene,
  animations = [],
  externalAnimations = [],
  originalMovieData,
  slot,
  syncState,
  danceState,
}) {
  const root = useRef(null);
  const mixer = useRef(null);
  const activeAction = useRef(null);
  const activeBinding = useRef(null);
  const activeSupportAction = useRef(null);
  const activeSupportBinding = useRef(null);
  const transitionAction = useRef(null);
  const transitionBinding = useRef(null);
  const fitted = useMemo(() => prepareCharacterScene(scene, slot), [scene, slot]);
  const retargetedExternalAnimations = useMemo(
    () => retargetExternalAnimationClipsToScene(externalAnimations, fitted.clonedScene),
    [externalAnimations, fitted.clonedScene],
  );
  const availableAnimations = useMemo(
    () => [...retargetedExternalAnimations, ...animations],
    [animations, retargetedExternalAnimations],
  );
  const originalPuppetRig = useMemo(
    () => createOriginalPuppetRig(fitted.clonedScene),
    [fitted.clonedScene],
  );
  const footContactRig = useMemo(
    () => createFootContactRig(fitted.clonedScene),
    [fitted.clonedScene],
  );
  const visibleContactRig = useMemo(
    () => createVisibleContactRig(fitted.clonedScene),
    [fitted.clonedScene],
  );
  const slotBasePositions = useMemo(
    () => Object.fromEntries(characterSlots.map((characterSlot) => [characterSlot.id, characterSlot.position])),
    [],
  );

  useEffect(() => {
    mixer.current = new THREE.AnimationMixer(fitted.clonedScene);

    return () => {
      mixer.current?.stopAllAction();
      mixer.current = null;
      activeAction.current = null;
      activeBinding.current = null;
      activeSupportAction.current = null;
      activeSupportBinding.current = null;
      transitionAction.current = null;
      transitionBinding.current = null;
    };
  }, [fitted.clonedScene]);

  useLayoutEffect(() => {
    if (!mixer.current) {
      return;
    }

    const requestedMoveId = danceState?.activeMove?.id ?? "neutral-ready";
    const isOriginalPuppetMove =
      danceState?.sequenceMode === "originalPuppet" &&
      requestedMoveId.startsWith("original-latin-");

    if (isOriginalPuppetMove) {
      mixer.current.stopAllAction();
      activeAction.current = null;
      activeBinding.current = null;
      activeSupportAction.current = null;
      activeSupportBinding.current = null;
      transitionAction.current = null;
      transitionBinding.current = null;
      restoreSkeletonPose(fitted.clonedScene);
      return;
    }

    const resolvedMove = resolveDanceAnimationClip({
      moveId: requestedMoveId,
      animations: availableAnimations,
      animationSetId: slot.animationSet,
    });
    const neutralMove = resolveDanceAnimationClip({
      moveId: "neutral-ready",
      animations: availableAnimations,
      animationSetId: slot.animationSet,
    });
    const resolvedNeutral =
      resolvedMove.clip || requestedMoveId === "neutral-ready"
        ? resolvedMove
        : neutralMove;
    const resolved = resolvedMove.clip ? resolvedMove : resolvedNeutral;

    if (!resolved.clip) {
      mixer.current.stopAllAction();
      restoreSkeletonPose(fitted.clonedScene);
      activeAction.current = null;
      activeBinding.current = null;
      activeSupportAction.current = null;
      activeSupportBinding.current = null;
      transitionAction.current = null;
      transitionBinding.current = null;
      return;
    }

    const nextAction = mixer.current.clipAction(resolved.clip);
    const supportAction =
      danceMoveMap[requestedMoveId]?.tags?.includes("poseHold") &&
      neutralMove.clip &&
      neutralMove.clip !== resolved.clip
        ? mixer.current.clipAction(neutralMove.clip)
        : null;
    const previousAction = activeAction.current;
    const previousBinding = activeBinding.current;
    const isSameAction = previousAction === nextAction;

    if (
      transitionAction.current &&
      transitionAction.current !== previousAction &&
      transitionAction.current !== nextAction
    ) {
      transitionAction.current.stop();
    }

    if (activeSupportAction.current && activeSupportAction.current !== supportAction) {
      activeSupportAction.current.stop();
    }

    if (!isSameAction) {
      nextAction.reset();
    }

    if (previousAction && previousBinding && !isSameAction) {
      transitionAction.current = previousAction;
      transitionBinding.current = previousBinding;
      transitionAction.current
        .setLoop(THREE.LoopRepeat, Infinity)
        .setEffectiveWeight(1)
        .play();
    } else if (transitionAction.current && transitionAction.current !== nextAction) {
      transitionAction.current.stop();
      transitionAction.current = null;
      transitionBinding.current = null;
    }

    nextAction
      .setLoop(THREE.LoopRepeat, Infinity)
      .setEffectiveWeight(1)
      .play();

    if (supportAction) {
      supportAction
        .reset()
        .setLoop(THREE.LoopRepeat, Infinity)
        .setEffectiveWeight(0)
        .play();
    }

    const clipPhase = danceState?.activeMove ? danceState?.modulePhase ?? 0 : 0;
    const poseBlend = getPoseModuleBlend(requestedMoveId, clipPhase);

    if (supportAction && poseBlend !== null) {
      nextAction.time = getSyncedClipTime(nextAction.getClip(), clipPhase, resolved.binding);
      supportAction.time = getSyncedClipTime(
        supportAction.getClip(),
        clipPhase,
        neutralMove.binding,
      );
      nextAction.setEffectiveWeight(poseBlend);
      supportAction.setEffectiveWeight(1 - poseBlend);
      mixer.current.update(0);
    } else {
      nextAction.time = getSyncedClipTime(nextAction.getClip(), clipPhase, resolved.binding);
      mixer.current.update(0);
    }

    activeAction.current = nextAction;
    activeBinding.current = resolved.binding;
    activeSupportAction.current = supportAction;
    activeSupportBinding.current = supportAction ? neutralMove.binding : null;
  }, [
    availableAnimations,
    danceState?.activeMove?.id,
    danceState?.activeSlotIndex,
    danceState?.sequenceMode,
    fitted.clonedScene,
    slot.animationSet,
  ]);

  useFrame(({ clock }) => {
    const formationPose = getFormationPose({
      activeMove: danceState?.activeMove,
      slot,
      modulePhase: danceState?.modulePhase ?? 0,
      activeSlotIndex: danceState?.activeSlotIndex ?? 0,
      sequence: danceState?.sequence ?? [],
    });

    const activeMoveId = danceState?.activeMove?.id ?? "neutral-ready";
    const pose = getProceduralDancePose(
      activeMoveId,
      slot.id,
      danceState?.modulePhase ?? 0,
      syncState?.beatPulse ?? 0,
      syncState?.bassEnergy ?? 0,
    );
    const originalRootMotionPose = getOriginalRootMotionPose({
      movieData: originalMovieData,
      slotId: slot.id,
      activeMove: danceState?.activeMove,
      modulePhase: danceState?.modulePhase ?? 0,
      basePosition: slot.position,
      baseRotationY: danceState?.sequenceMode === "originalPuppet" ? 0 : slot.rotationY,
      slotBasePositions,
    });

    if (mixer.current && activeAction.current) {
      if (root.current) {
        const isOriginalMove = activeMoveId.startsWith("original-latin-");
        const positionScale = 0.3;
        const verticalScale = 0.12;
        const rotationScale = 0.16;

        if (originalRootMotionPose) {
          root.current.position.set(...originalRootMotionPose.position);
          root.current.rotation.x = originalRootMotionPose.rotationX;
          root.current.rotation.y = originalRootMotionPose.rotationY;
          root.current.rotation.z = originalRootMotionPose.rotationZ;
        } else {
          root.current.position.x = formationPose.position[0] + pose.x * positionScale;
          root.current.position.y = formationPose.position[1] + pose.y * verticalScale;
          root.current.position.z = formationPose.position[2] + pose.z * positionScale;
          root.current.rotation.x = 0;
          root.current.rotation.y = formationPose.rotationY + pose.rotationY * rotationScale;
          root.current.rotation.z = pose.rotationZ * (isOriginalMove ? 0.18 : 0.08);
        }
      }

      const clipPhase = danceState?.activeMove ? danceState?.modulePhase ?? 0 : 0;
      const clipTime = getSyncedClipTime(
        activeAction.current.getClip(),
        clipPhase,
        activeBinding.current,
      );
      const transitionState = getActionTransitionState(
        clipPhase,
        danceState?.activeBeatSpan ?? danceState?.activeMove?.beatSpan ?? 8,
      );
      const hasTransition =
        transitionAction.current &&
        transitionBinding.current &&
        transitionAction.current !== activeAction.current &&
        transitionState.blend < 1;
      const activeWeight = hasTransition ? transitionState.blend : 1;
      const transitionWeight = hasTransition ? 1 - transitionState.blend : 0;
      const poseBlend = getPoseModuleBlend(activeMoveId, clipPhase) ?? 1;

      activeAction.current.time = clipTime;
      activeAction.current.setEffectiveWeight(activeWeight * poseBlend);

      if (activeSupportAction.current) {
        const supportClipTime = getSyncedClipTime(
          activeSupportAction.current.getClip(),
          clipPhase,
          activeSupportBinding.current,
        );

        activeSupportAction.current.time = supportClipTime;
        activeSupportAction.current.setEffectiveWeight(activeWeight * (1 - poseBlend));
      }

      if (hasTransition) {
        transitionAction.current.time = getSyncedClipTime(
          transitionAction.current.getClip(),
          transitionState.previousPhase,
          transitionBinding.current,
        );
        transitionAction.current.setEffectiveWeight(transitionWeight);
      } else {
        if (transitionAction.current && transitionAction.current !== activeAction.current) {
          transitionAction.current.stop();
        }
        transitionAction.current = null;
        transitionBinding.current = null;
      }

      mixer.current.update(0);

      if (originalRootMotionPose) {
        applyOriginalPuppetPose(originalPuppetRig, originalRootMotionPose, root.current);
      }

      if (!originalRootMotionPose?.isLiftedPose) {
        groundCharacterToStage(root.current, footContactRig, visibleContactRig, activeMoveId);
      }

      return;
    }

    if (!root.current) {
      return;
    }

    const idle =
      activeMoveId === "neutral-ready" || activeMoveId === "female-standing-pose"
        ? 0
        : Math.sin(clock.getElapsedTime() * 1.6) * 0.04;

    if (originalRootMotionPose) {
      root.current.position.set(...originalRootMotionPose.position);
      root.current.rotation.x = originalRootMotionPose.rotationX;
      root.current.rotation.y = originalRootMotionPose.rotationY;
      root.current.rotation.z = originalRootMotionPose.rotationZ;
      applyOriginalPuppetPose(originalPuppetRig, originalRootMotionPose, root.current);
      if (!originalRootMotionPose.isLiftedPose) {
        groundCharacterToStage(root.current, footContactRig, visibleContactRig, activeMoveId);
      }
      return;
    }

    root.current.position.x = formationPose.position[0] + pose.x * 0.45;
    root.current.position.y = formationPose.position[1] + idle + pose.y * 0.25;
    root.current.position.z = formationPose.position[2] + pose.z * 0.45;
    root.current.rotation.x = 0;
    root.current.rotation.y = formationPose.rotationY + pose.rotationY * 0.35;
    root.current.rotation.z = pose.rotationZ * 0.2;
    groundCharacterToStage(root.current, footContactRig, visibleContactRig, activeMoveId);
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

function ImportedGltfCharacter({
  slot,
  syncState,
  danceState,
  externalAnimations,
  originalMovieData,
}) {
  const gltf = useGLTF(slot.url);

  return (
    <FittedCharacter
      scene={gltf.scene}
      animations={gltf.animations}
      slot={slot}
      syncState={syncState}
      danceState={danceState}
      externalAnimations={externalAnimations}
      originalMovieData={originalMovieData}
    />
  );
}

function ImportedFbxCharacter({
  slot,
  syncState,
  danceState,
  externalAnimations,
  originalMovieData,
}) {
  const fbx = useFBX(slot.url);

  return (
    <FittedCharacter
      scene={fbx}
      animations={fbx.animations}
      slot={slot}
      syncState={syncState}
      danceState={danceState}
      externalAnimations={externalAnimations}
      originalMovieData={originalMovieData}
    />
  );
}

function ImportedCharacter({
  slot,
  syncState,
  danceState,
  externalAnimations,
  originalMovieData,
}) {
  const url = slot.url.toLowerCase();

  if (url.endsWith(".fbx")) {
    return (
      <ImportedFbxCharacter
        slot={slot}
        syncState={syncState}
        danceState={danceState}
        externalAnimations={externalAnimations}
        originalMovieData={originalMovieData}
      />
    );
  }

  return (
    <ImportedGltfCharacter
      slot={slot}
      syncState={syncState}
      danceState={danceState}
      externalAnimations={externalAnimations}
      originalMovieData={originalMovieData}
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
      sequence: danceState?.sequence ?? [],
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

function CharacterSlotGroup({ syncState, danceState }) {
  const externalAnimations = useExternalDanceAnimationClips(danceState);
  const [originalMovieData, setOriginalMovieData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    loadOriginalMovieData()
      .then((loadedMovieData) => {
        if (!cancelled) {
          setOriginalMovieData(loadedMovieData);
        }
      })
      .catch((error) => {
        console.error("Original movie data failed to load", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <group>
      {characterSlots.map((slot) =>
        slot.url ? (
          <ImportedCharacter
            key={slot.id}
            slot={slot}
            syncState={syncState}
            danceState={danceState}
            externalAnimations={externalAnimations}
            originalMovieData={originalMovieData}
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

export default function CharacterSlots({ syncState, danceState }) {
  if (danceState?.sequenceMode === "original") {
    return <OriginalBlockDancers danceState={danceState} />;
  }

  return <CharacterSlotGroup syncState={syncState} danceState={danceState} />;
}
