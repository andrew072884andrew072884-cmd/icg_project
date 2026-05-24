import { DANCE_MODULE_BEATS, danceMoves } from "./danceLibrary";

const DEFAULT_ANIMATION_SET = "embeddedHumanoid";

export const externalDanceAnimationSources = [
  {
    moveId: "neutral-ready",
    url: "/assets/animations/idle.fbx",
    aliases: ["Idle", "Neutral Idle", "neutral-ready", "Neutral"],
    loopsPerModule: 1,
    safeStart: 0.05,
    safeEnd: 0.29,
  },
  {
    moveId: "female-standing-pose",
    url: "/assets/animations/female-standing-pose.fbx",
    aliases: ["Female Standing Pose", "female-standing-pose", "Pose"],
    loopsPerModule: 1,
    safeStart: 0.04,
    safeEnd: 0.96,
  },
  {
    moveId: "breakdance-ready",
    url: "/assets/animations/breakdance-ready.fbx",
    aliases: ["Breakdance Ready", "breakdance-ready", "B-Boy Ready"],
    loopsPerModule: 1,
    safeStart: 0.08,
    safeEnd: 0.92,
  },
  {
    moveId: "breakdance-ready-alt",
    url: "/assets/animations/breakdance-ready-alt.fbx",
    aliases: ["Breakdance Ready 1", "breakdance-ready-alt", "B-Boy Ready Alt"],
    loopsPerModule: 1,
    safeStart: 0.08,
    safeEnd: 0.92,
    rootPositionScale: [0.035, 1, 0.06],
  },
  {
    moveId: "bboy-hip-hop-move-alt",
    url: "/assets/animations/bboy-hip-hop-move-alt.fbx",
    aliases: ["Bboy Hip Hop Move 1", "bboy-hip-hop-move-alt", "B-Boy HipHop Alt"],
    loopsPerModule: 1,
    safeStart: 0.06,
    safeEnd: 0.94,
    rootPositionScale: [0.08, 1, 0.08],
  },
  {
    moveId: "female-dance-pose",
    url: "/assets/animations/female-dance-pose.fbx",
    aliases: ["Female Dance Pose", "female-dance-pose", "Pose Female"],
    loopsPerModule: 1,
    safeStart: 0,
    safeEnd: 1,
  },
  {
    moveId: "female-dance-pose-1",
    url: "/assets/animations/female-dance-pose-1.fbx",
    aliases: ["Female Dance Pose 1", "female-dance-pose-1", "Pose Female 1"],
    loopsPerModule: 1,
    safeStart: 0,
    safeEnd: 1,
  },
  {
    moveId: "male-dance-pose",
    url: "/assets/animations/male-dance-pose.fbx",
    aliases: ["Male Dance Pose", "male-dance-pose", "Pose Male"],
    loopsPerModule: 1,
    safeStart: 0,
    safeEnd: 1,
  },
  {
    moveId: "actorcore-catwalk-travel",
    url: "/assets/animations/actorcore-catwalk-loop.fbx",
    aliases: ["ActorCore Catwalk Travel", "catwalk-loop-378982", "Catwalk"],
    sourceRig: "actorcore",
    loopsPerModule: 3,
    safeStart: 0.02,
    safeEnd: 0.98,
  },
  {
    moveId: "actorcore-walk-travel",
    url: "/assets/animations/actorcore-walk-loop.fbx",
    aliases: ["ActorCore Walk Travel", "walk-2loop-379004", "Walk"],
    sourceRig: "actorcore",
    loopsPerModule: 2,
    safeStart: 0.02,
    safeEnd: 0.98,
  },
  {
    moveId: "wave-hip-hop-dance",
    url: "/assets/animations/wave-hip-hop-dance.fbx",
    aliases: ["Wave Hip Hop Dance", "wave-hip-hop-dance", "Wave HipHop"],
    loopsPerModule: 1,
    safeStart: 0.05,
    safeEnd: 0.9,
  },
  {
    moveId: "hip-hop-dancing-5",
    url: "/assets/animations/hip-hop-dancing-5.fbx",
    aliases: ["Hip Hop Dancing 5", "hip-hop-dancing-5", "HipHop 5"],
    loopsPerModule: 1,
    safeStart: 0.06,
    safeEnd: 0.9,
  },
  {
    moveId: "salsa-dancing",
    url: "/assets/animations/salsa-dancing.fbx",
    aliases: ["Salsa Dancing", "salsa-dancing", "Salsa"],
    loopsPerModule: 1,
    safeStart: 0.06,
    safeEnd: 0.94,
    rootPositionScale: [0.1, 1, 0.08],
  },
  {
    moveId: "hip-hop-dancing-4",
    url: "/assets/animations/hip-hop-dancing-4.fbx",
    aliases: ["Hip Hop Dancing 4", "hip-hop-dancing-4", "HipHop 4"],
    loopsPerModule: 1,
    safeStart: 0.04,
    safeEnd: 0.9,
    rootPositionScale: [0.045, 1, 0.045],
  },
  {
    moveId: "booty-hip-hop-dance",
    url: "/assets/animations/booty-hip-hop-dance.fbx",
    aliases: ["Booty Hip Hop Dance", "booty-hip-hop-dance", "Booty HipHop"],
    loopsPerModule: 1,
    safeStart: 0.05,
    safeEnd: 0.92,
    rootPositionScale: [0.06, 1, 0.025],
  },
  {
    moveId: "rumba-dancing",
    url: "/assets/animations/rumba-dancing.fbx",
    aliases: ["Rumba Dancing", "rumba-dancing", "Rumba"],
    loopsPerModule: 1,
    safeStart: 0.06,
    safeEnd: 0.94,
    rootPositionScale: [0.18, 1, 0.45],
  },
  {
    moveId: "tut-hip-hop-dance",
    url: "/assets/animations/tut-hip-hop-dance.fbx",
    aliases: ["Tut Hip Hop Dance", "tut-hip-hop-dance", "Tut"],
    loopsPerModule: 1,
    safeStart: 0.06,
    safeEnd: 0.9,
  },
  {
    moveId: "silly-dancing",
    url: "/assets/animations/silly-dancing.fbx",
    aliases: ["Silly Dancing", "silly-dancing", "Silly"],
    loopsPerModule: 1,
    safeStart: 0.06,
    safeEnd: 0.94,
  },
  {
    moveId: "locking-hip-hop-dance",
    url: "/assets/animations/locking-hip-hop-dance.fbx",
    aliases: ["Locking Hip Hop Dance", "locking-hip-hop-dance", "Locking"],
    loopsPerModule: 1,
    safeStart: 0.04,
    safeEnd: 0.9,
  },
  {
    moveId: "dancing-twerk",
    url: "/assets/animations/dancing-twerk.fbx",
    aliases: ["Dancing Twerk", "dancing-twerk", "Twerk"],
    loopsPerModule: 1,
    safeStart: 0.04,
    safeEnd: 0.9,
  },
  {
    moveId: "hip-hop-dancing-2",
    url: "/assets/animations/hip-hop-dancing-2.fbx",
    aliases: ["Hip Hop Dancing 2", "hip-hop-dancing-2", "HipHop 2"],
    loopsPerModule: 1,
    safeStart: 0.05,
    safeEnd: 0.9,
  },
  {
    moveId: "hip-hop-dancing",
    url: "/assets/animations/hip-hop-dancing.fbx",
    aliases: ["Hip Hop Dancing", "hip-hop-dancing", "HipHop"],
    loopsPerModule: 1,
    safeStart: 0.05,
    safeEnd: 0.88,
  },
  {
    moveId: "hip-hop-dancing-1",
    url: "/assets/animations/hip-hop-dancing-1.fbx",
    aliases: ["Hip Hop Dancing 1", "hip-hop-dancing-1", "HipHop 1"],
    loopsPerModule: 1,
    safeStart: 0.05,
    safeEnd: 0.88,
  },
  {
    moveId: "breakdance-ending-1",
    url: "/assets/animations/breakdance-ending-1.fbx",
    aliases: ["Breakdance Ending 1", "breakdance-ending-1", "B-Boy End"],
    loopsPerModule: 1,
    safeStart: 0.06,
    safeEnd: 0.94,
    rootPositionScale: [0.09, 1, 0.09],
  },
  {
    moveId: "breakdance-footwork-to-idle",
    url: "/assets/animations/breakdance-footwork-to-idle.fbx",
    aliases: ["Breakdance Footwork To Idle", "breakdance-footwork-to-idle", "Footwork End"],
    loopsPerModule: 1,
    safeStart: 0.06,
    safeEnd: 0.94,
    rootPositionScale: [0.14, 1, 0.14],
  },
  {
    moveId: "breakdance-footwork-to-idle-alt",
    url: "/assets/animations/breakdance-footwork-to-idle-alt.fbx",
    aliases: ["Breakdance Footwork To Idle 1", "breakdance-footwork-to-idle-alt", "Footwork End Alt"],
    loopsPerModule: 1,
    safeStart: 0.06,
    safeEnd: 0.94,
    rootPositionScale: [0.08, 1, 0.06],
  },
  {
    moveId: "swing-dancing",
    url: "/assets/animations/swing-dancing.fbx",
    aliases: ["Swing Dancing", "swing-dancing", "Swing"],
    loopsPerModule: 1,
    safeStart: 0.04,
    safeEnd: 0.92,
    rootPositionScale: [0.025, 1, 0.025],
  },
];

export const externalDanceAnimationUrls = externalDanceAnimationSources.map(
  (source) => source.url,
);

export function getExternalDanceAnimationSourcesForMoveIds(moveIds = []) {
  const moveIdSet = new Set(["neutral-ready", ...moveIds.filter(Boolean)]);
  const sources = externalDanceAnimationSources.filter((source) =>
    moveIdSet.has(source.moveId),
  );

  return sources.length > 0 ? sources : [externalDanceAnimationSources[0]].filter(Boolean);
}

const externalDanceAnimationMap = Object.fromEntries(
  externalDanceAnimationSources.map((source) => [source.moveId, source]),
);

function normalizeName(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const actorCoreBoneAliases = {
  ccbasehip: "hips",
  ccbasewaist: "spine",
  ccbasespine01: "spine1",
  ccbasespine02: "spine2",
  ccbasenecktwist01: "neck",
  ccbasenecktwist02: "neck",
  ccbasehead: "head",
  ccbaselclavicle: "leftshoulder",
  ccbaselupperarm: "leftarm",
  ccbaselforearm: "leftforearm",
  ccbaselhand: "lefthand",
  ccbaserclavicle: "rightshoulder",
  ccbaserupperarm: "rightarm",
  ccbaserforearm: "rightforearm",
  ccbaserhand: "righthand",
  ccbaselthigh: "leftupleg",
  ccbaselcalf: "leftleg",
  ccbaselfoot: "leftfoot",
  ccbaseltoebase: "lefttoebase",
  ccbaserthigh: "rightupleg",
  ccbasercalf: "rightleg",
  ccbaserfoot: "rightfoot",
  ccbasertoebase: "righttoebase",
  ccbaselthumb1: "lefthandthumb1",
  ccbaselthumb2: "lefthandthumb2",
  ccbaselthumb3: "lefthandthumb3",
  ccbaselindex1: "lefthandindex1",
  ccbaselindex2: "lefthandindex2",
  ccbaselindex3: "lefthandindex3",
  ccbaselmid1: "lefthandmiddle1",
  ccbaselmid2: "lefthandmiddle2",
  ccbaselmid3: "lefthandmiddle3",
  ccbaselring1: "lefthandring1",
  ccbaselring2: "lefthandring2",
  ccbaselring3: "lefthandring3",
  ccbaselpinky1: "lefthandpinky1",
  ccbaselpinky2: "lefthandpinky2",
  ccbaselpinky3: "lefthandpinky3",
  ccbaserthumb1: "righthandthumb1",
  ccbaserthumb2: "righthandthumb2",
  ccbaserthumb3: "righthandthumb3",
  ccbaserindex1: "righthandindex1",
  ccbaserindex2: "righthandindex2",
  ccbaserindex3: "righthandindex3",
  ccbasermid1: "righthandmiddle1",
  ccbasermid2: "righthandmiddle2",
  ccbasermid3: "righthandmiddle3",
  ccbaserring1: "righthandring1",
  ccbaserring2: "righthandring2",
  ccbaserring3: "righthandring3",
  ccbaserpinky1: "righthandpinky1",
  ccbaserpinky2: "righthandpinky2",
  ccbaserpinky3: "righthandpinky3",
};

const actorCoreStabilizedTargets = new Set([
  "hips",
  "spine",
  "spine1",
  "spine2",
  "neck",
  "head",
]);

function normalizeRigNodeName(value) {
  const nodeName = String(value ?? "");
  const namespaceIndex = nodeName.lastIndexOf(":");
  const withoutNamespace =
    namespaceIndex >= 0 ? nodeName.slice(namespaceIndex + 1) : nodeName;
  const withoutMixamoPrefix = withoutNamespace.replace(/^mixamorig\d*/i, "");
  const normalizedName = normalizeName(withoutMixamoPrefix);

  return actorCoreBoneAliases[normalizedName] ?? normalizedName;
}

function splitTrackName(trackName) {
  const propertyIndex = trackName.indexOf(".");

  if (propertyIndex < 0) {
    return {
      nodeName: trackName,
      propertyPath: "",
    };
  }

  return {
    nodeName: trackName.slice(0, propertyIndex),
    propertyPath: trackName.slice(propertyIndex),
  };
}

function createTargetNodeMap(scene) {
  const targetNodeMap = new Map();

  scene.traverse((child) => {
    if (!child.name) {
      return;
    }

    const normalizedName = normalizeRigNodeName(child.name);

    if (!targetNodeMap.has(normalizedName)) {
      targetNodeMap.set(normalizedName, child.name);
    }
  });

  return targetNodeMap;
}

function createDefaultBinding(move) {
  const externalSource = externalDanceAnimationMap[move.id];
  const aliases = [
    move.id,
    move.label,
    move.shortLabel,
    `${move.shortLabel} ${move.categoryLabel}`,
    ...(move.tags ?? []),
    ...(externalSource?.aliases ?? []),
  ];

  return {
    moveId: move.id,
    preferredBeats: move.beatSpan ?? DANCE_MODULE_BEATS,
    loopsPerModule: externalSource?.loopsPerModule ?? 1,
    safeStart: externalSource?.safeStart ?? 0.04,
    safeEnd: externalSource?.safeEnd ?? 0.96,
    externalUrl: externalSource?.url ?? "",
    aliases,
  };
}

export const danceAnimationSets = {
  [DEFAULT_ANIMATION_SET]: {
    id: DEFAULT_ANIMATION_SET,
    label: "Embedded humanoid animation clips",
    fallbackToFirstClip: true,
    bindings: Object.fromEntries(
      danceMoves.map((move) => [move.id, createDefaultBinding(move)]),
    ),
  },
};

export function getDanceAnimationBinding(
  moveId,
  animationSetId = DEFAULT_ANIMATION_SET,
) {
  const animationSet = danceAnimationSets[animationSetId] ?? danceAnimationSets[DEFAULT_ANIMATION_SET];
  const binding = animationSet.bindings[moveId];

  return {
    animationSet,
    binding,
  };
}

export function resolveDanceAnimationClip({
  moveId,
  animations = [],
  animationSetId = DEFAULT_ANIMATION_SET,
}) {
  const { animationSet, binding } = getDanceAnimationBinding(moveId, animationSetId);

  if (!binding || animations.length === 0) {
    return {
      clip: null,
      binding,
      reason: "missing-binding-or-clips",
    };
  }

  const aliases = binding.aliases.map(normalizeName);
  const clip =
    animations.find((animationClip) =>
      aliases.includes(normalizeName(animationClip.name)),
    ) ?? null;

  if (clip) {
    return {
      clip,
      binding,
      reason: "alias-match",
    };
  }

  if (String(moveId ?? "").startsWith("original-latin-")) {
    return {
      clip: null,
      binding,
      reason: "original-puppet-no-animation-clip",
    };
  }

  const embeddedAnimations = animations.filter(
    (animationClip) => !animationClip.userData?.externalMoveId,
  );

  if (animationSet.fallbackToFirstClip && embeddedAnimations.length === 1) {
    return {
      clip: embeddedAnimations[0],
      binding,
      reason: "single-embedded-clip-fallback",
    };
  }

  return {
    clip: null,
    binding,
    reason: "no-matching-clip",
  };
}

export function getSyncedClipTime(clip, modulePhase, binding) {
  if (!clip?.duration) {
    return 0;
  }

  const loopsPerModule = Math.max(1, binding?.loopsPerModule ?? 1);
  const normalizedPhase = ((modulePhase * loopsPerModule) % 1 + 1) % 1;
  const safeStart = Math.min(0.45, Math.max(0, binding?.safeStart ?? 0.04));
  const safeEnd = Math.min(0.99, Math.max(safeStart + 0.01, binding?.safeEnd ?? 0.96));
  const safePhase = safeStart + normalizedPhase * (safeEnd - safeStart);

  return safePhase * clip.duration;
}

export function createExternalDanceAnimationClips(
  loadedFbxFiles = [],
  sources = externalDanceAnimationSources,
) {
  return sources.flatMap((source, sourceIndex) => {
    const fbx = loadedFbxFiles[sourceIndex];
    const usableClips = (fbx?.animations ?? [])
      .filter((clip) => clip.duration > 0.01)
      .sort((a, b) => b.duration - a.duration);
    const selectedClips = usableClips.length > 0 ? usableClips : fbx?.animations ?? [];

    return selectedClips.map((clip, clipIndex) => {
      const clonedClip = clip.clone();
      clonedClip.name = clipIndex === 0 ? source.moveId : `${source.moveId}-${clipIndex + 1}`;
      clonedClip.userData = {
        ...(clip.userData ?? {}),
        externalMoveId: source.moveId,
        sourceRig: source.sourceRig ?? "mixamo",
        sourceUrl: source.url,
        rootPositionScale: source.rootPositionScale ?? null,
      };

      return clonedClip;
    });
  });
}

export function retargetExternalAnimationClipsToScene(clips = [], scene) {
  if (!scene) {
    return clips;
  }

  const targetNodeMap = createTargetNodeMap(scene);

  return clips.map((clip) => {
    if (!clip.userData?.externalMoveId) {
      return clip;
    }

    const retargetedClip = clip.clone();

    retargetedClip.tracks = clip.tracks.map((track) => {
      const { nodeName, propertyPath } = splitTrackName(track.name);
      const normalizedNodeName = normalizeRigNodeName(nodeName);
      const targetNodeName = targetNodeMap.get(normalizedNodeName);

      if (!targetNodeName) {
        return null;
      }

      if (
        clip.userData?.sourceRig === "actorcore" &&
        propertyPath !== ".quaternion"
      ) {
        return null;
      }

      if (
        clip.userData?.sourceRig === "actorcore" &&
        actorCoreStabilizedTargets.has(normalizedNodeName)
      ) {
        return null;
      }

      const retargetedTrack = track.clone();

      retargetedTrack.name = `${targetNodeName}${propertyPath}`;

      if (
        propertyPath === ".position" &&
        normalizedNodeName === "hips" &&
        Array.isArray(clip.userData?.rootPositionScale)
      ) {
        const [scaleX = 1, scaleY = 1, scaleZ = 1] = clip.userData.rootPositionScale;

        for (let valueIndex = 0; valueIndex < retargetedTrack.values.length; valueIndex += 3) {
          retargetedTrack.values[valueIndex] *= scaleX;
          retargetedTrack.values[valueIndex + 1] *= scaleY;
          retargetedTrack.values[valueIndex + 2] *= scaleZ;
        }
      }

      return retargetedTrack;
    }).filter(Boolean);
    retargetedClip.userData = {
      ...(clip.userData ?? {}),
      retargeted: true,
      retargetedTrackCount: retargetedClip.tracks.length,
    };

    return retargetedClip;
  });
}
