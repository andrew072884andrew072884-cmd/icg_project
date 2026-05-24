export const DANCE_MODULE_BEATS = 8;

export const danceCategories = {
  intro: { label: "前奏 / Pose", intent: "低能量站姿、idle、準備姿勢，避免一開始就過度激烈。" },
  verse: { label: "Verse / Groove", intent: "中低能量 groove，用來銜接主歌或鋪陳段落。" },
  transition: { label: "過場", intent: "段落轉換、方向變化、手部線條或較短的 accent 動作。" },
  formation: { label: "隊形 / Travel", intent: "較長的位移、步伐或隊形變換動作。" },
  main: { label: "Main section", intent: "高能量主段落，適合副歌或主要舞蹈段。" },
  accent: { label: "重拍 / Hit", intent: "短促、姿勢明確的 hit、pose、drop 或節拍強調。" },
  ending: { label: "結尾", intent: "收尾、回到 idle、ending pose 或最後 freeze。" },
};

export const danceCategoryLabels = Object.fromEntries(
  Object.entries(danceCategories).map(([key, value]) => [key, value.label]),
);

export const originalDanceMoves = [
  {
    id: "original-latin-01",
    label: "Original Latin 01 - Opening Arms & Kicks",
    shortLabel: "Orig 01",
    category: "intro",
    energy: "high",
    tags: ["original", "latin", "opening", "arms", "legs"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [1, 32],
    sourcePhrase: 1,
  },
  {
    id: "original-latin-02",
    label: "Original Latin 02 - Traveling Footwork",
    shortLabel: "Orig 02",
    category: "main",
    energy: "high",
    tags: ["original", "latin", "footwork", "travel"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [33, 64],
    sourcePhrase: 2,
  },
  {
    id: "original-latin-03",
    label: "Original Latin 03 - Side Travel",
    shortLabel: "Orig 03",
    category: "transition",
    energy: "medium",
    tags: ["original", "latin", "side", "travel"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [65, 96],
    sourcePhrase: 3,
  },
  {
    id: "original-latin-04",
    label: "Original Latin 04 - Body Turn",
    shortLabel: "Orig 04",
    category: "formation",
    energy: "medium",
    tags: ["original", "latin", "turn", "body"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [97, 128],
    sourcePhrase: 4,
  },
  {
    id: "original-latin-05",
    label: "Original Latin 05 - Rotation Accent",
    shortLabel: "Orig 05",
    category: "transition",
    energy: "medium",
    tags: ["original", "latin", "turn", "accent"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [129, 160],
    sourcePhrase: 5,
  },
  {
    id: "original-latin-06",
    label: "Original Latin 06 - Lifted Travel",
    shortLabel: "Orig 06",
    category: "formation",
    energy: "medium",
    tags: ["original", "latin", "lift", "travel"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [161, 192],
    sourcePhrase: 6,
  },
  {
    id: "original-latin-07",
    label: "Original Latin 07 - Side Accent",
    shortLabel: "Orig 07",
    category: "transition",
    energy: "medium",
    tags: ["original", "latin", "side", "accent"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [193, 224],
    sourcePhrase: 7,
  },
  {
    id: "original-latin-08",
    label: "Original Latin 08 - Big Arms & Footwork",
    shortLabel: "Orig 08",
    category: "main",
    energy: "high",
    tags: ["original", "latin", "arms", "footwork", "chorus"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [225, 256],
    sourcePhrase: 8,
  },
  {
    id: "original-latin-09",
    label: "Original Latin 09 - Traveling Footwork Repeat",
    shortLabel: "Orig 09",
    category: "main",
    energy: "high",
    tags: ["original", "latin", "footwork", "travel"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [257, 288],
    sourcePhrase: 9,
  },
  {
    id: "original-latin-10",
    label: "Original Latin 10 - Side Travel Repeat",
    shortLabel: "Orig 10",
    category: "transition",
    energy: "medium",
    tags: ["original", "latin", "side", "travel"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [289, 320],
    sourcePhrase: 10,
  },
  {
    id: "original-latin-11",
    label: "Original Latin 11 - Body Turn Repeat",
    shortLabel: "Orig 11",
    category: "formation",
    energy: "medium",
    tags: ["original", "latin", "turn", "body"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [321, 352],
    sourcePhrase: 11,
  },
  {
    id: "original-latin-12",
    label: "Original Latin 12 - Rotation Accent Repeat",
    shortLabel: "Orig 12",
    category: "transition",
    energy: "medium",
    tags: ["original", "latin", "turn", "accent"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [353, 384],
    sourcePhrase: 12,
  },
  {
    id: "original-latin-13",
    label: "Original Latin 13 - Lifted Travel Repeat",
    shortLabel: "Orig 13",
    category: "formation",
    energy: "medium",
    tags: ["original", "latin", "lift", "travel"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [385, 416],
    sourcePhrase: 13,
  },
  {
    id: "original-latin-14",
    label: "Original Latin 14 - Side Accent Repeat",
    shortLabel: "Orig 14",
    category: "transition",
    energy: "medium",
    tags: ["original", "latin", "side", "accent"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [417, 448],
    sourcePhrase: 14,
  },
  {
    id: "original-latin-15",
    label: "Original Latin 15 - Closing Pose A",
    shortLabel: "Orig 15",
    category: "ending",
    energy: "low",
    tags: ["original", "latin", "closing", "pose"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [449, 480],
    sourcePhrase: 15,
  },
  {
    id: "original-latin-16",
    label: "Original Latin 16 - Closing Pose B",
    shortLabel: "Orig 16",
    category: "ending",
    energy: "low",
    tags: ["original", "latin", "ending", "pose"],
    source: "Dance.c MMOVIE/FMOVIE",
    sourceFrames: [481, 512],
    sourcePhrase: 16,
  },
];

export const placeholderDanceMoves = [
  {
    id: "side-groove",
    label: "Side Groove",
    shortLabel: "Groove",
    category: "verse",
    energy: "medium",
    tags: ["verse", "basic"],
  },
  {
    id: "bounce-step",
    label: "Bounce Step (Neutral Placeholder)",
    shortLabel: "Bounce",
    category: "intro",
    energy: "low",
    tags: ["intro", "verse", "basic", "neutral"],
    source: "Placeholder / maps to neutral FBX when humanoid avatars are loaded",
  },
  {
    id: "arm-wave",
    label: "Arm Wave",
    shortLabel: "Wave",
    category: "transition",
    energy: "medium",
    tags: ["verse", "preChorus", "transition"],
  },
  {
    id: "cross-step",
    label: "Cross Step",
    shortLabel: "Cross",
    category: "formation",
    energy: "medium",
    tags: ["preChorus", "transition", "formation"],
  },
  {
    id: "turn-accent",
    label: "Turn Accent",
    shortLabel: "Turn",
    category: "transition",
    energy: "high",
    tags: ["preChorus", "chorus", "accent", "transition"],
  },
  {
    id: "power-hit",
    label: "Power Hit",
    shortLabel: "Hit",
    category: "main",
    energy: "high",
    tags: ["chorus", "accent", "main"],
  },
  {
    id: "jump-kick",
    label: "Jump Kick",
    shortLabel: "Kick",
    category: "main",
    energy: "high",
    tags: ["chorus", "main"],
  },
  {
    id: "freeze-pose",
    label: "Freeze Pose",
    shortLabel: "Freeze",
    category: "ending",
    energy: "accent",
    tags: ["accent", "ending"],
  },
];

export const mixamoDanceMoves = [
  {
    id: "neutral-ready",
    label: "Neutral Idle",
    shortLabel: "Idle",
    category: "intro",
    energy: "low",
    tags: ["mixamo", "idle", "neutral", "intro"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/idle.fbx",
    clipDurationSeconds: 16.63,
    beatSpan: 8,
  },
  {
    id: "female-standing-pose",
    label: "Female Standing Pose",
    shortLabel: "Pose",
    category: "intro",
    energy: "low",
    tags: ["mixamo", "pose", "poseHold", "intro", "accent", "ending"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/female-standing-pose.fbx",
    clipDurationSeconds: 2.5,
    beatSpan: 4,
  },
  {
    id: "female-dance-pose",
    label: "Female Dance Pose",
    shortLabel: "F Pose",
    category: "intro",
    energy: "low",
    tags: ["mixamo", "pose", "poseHold", "intro", "accent", "ending"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/female-dance-pose.fbx",
    clipDurationSeconds: 0.03,
    beatSpan: 4,
  },
  {
    id: "female-dance-pose-1",
    label: "Female Dance Pose 1",
    shortLabel: "F Pose 1",
    category: "accent",
    energy: "low",
    tags: ["mixamo", "pose", "poseHold", "intro", "accent", "ending"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/female-dance-pose-1.fbx",
    clipDurationSeconds: 0.03,
    beatSpan: 4,
  },
  {
    id: "male-dance-pose",
    label: "Male Dance Pose",
    shortLabel: "M Pose",
    category: "ending",
    energy: "low",
    tags: ["mixamo", "pose", "poseHold", "intro", "accent", "ending"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/male-dance-pose.fbx",
    clipDurationSeconds: 0.03,
    beatSpan: 4,
  },
  {
    id: "breakdance-ready",
    label: "Breakdance Ready",
    shortLabel: "B-Boy Ready",
    category: "intro",
    energy: "medium",
    tags: ["mixamo", "breakdance", "bboy", "intro", "transition"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/breakdance-ready.fbx",
    clipDurationSeconds: 2.1,
    beatSpan: 4,
  },
  {
    id: "breakdance-ready-alt",
    label: "Breakdance Ready Alt",
    shortLabel: "B-Boy Ready 2",
    category: "intro",
    energy: "medium",
    tags: ["mixamo", "breakdance", "bboy", "intro", "transition"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/breakdance-ready-alt.fbx",
    clipDurationSeconds: 1.43,
    beatSpan: 4,
    formationEndOffset: [0.16, 0, 0.06],
  },
  {
    id: "bboy-hip-hop-move-alt",
    label: "Bboy Hip Hop Move Alt",
    shortLabel: "B-Boy HipHop",
    category: "main",
    energy: "high",
    tags: ["mixamo", "breakdance", "bboy", "hiphop", "main", "chorus", "accent", "floorwork"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/bboy-hip-hop-move-alt.fbx",
    clipDurationSeconds: 2.27,
    beatSpan: 8,
  },
  {
    id: "actorcore-catwalk-travel",
    label: "ActorCore Catwalk Travel",
    shortLabel: "Catwalk",
    category: "transition",
    energy: "medium",
    tags: ["actorcore", "walk", "catwalk", "travel", "transition", "formation"],
    source: "ActorCore FBX",
    assetUrl: "/assets/animations/actorcore-catwalk-loop.fbx",
    clipDurationSeconds: 1.27,
    beatSpan: 8,
  },
  {
    id: "actorcore-walk-travel",
    label: "ActorCore Walk Travel",
    shortLabel: "Walk",
    category: "formation",
    energy: "medium",
    tags: ["actorcore", "walk", "travel", "transition", "formation"],
    source: "ActorCore FBX",
    assetUrl: "/assets/animations/actorcore-walk-loop.fbx",
    clipDurationSeconds: 1.6,
    beatSpan: 8,
  },
  {
    id: "wave-hip-hop-dance",
    label: "Wave Hip Hop Dance",
    shortLabel: "Wave HipHop",
    category: "verse",
    energy: "medium",
    tags: ["mixamo", "hiphop", "wave", "groove", "verse", "transition"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/wave-hip-hop-dance.fbx",
    clipDurationSeconds: 15.97,
    beatSpan: 32,
  },
  {
    id: "hip-hop-dancing-5",
    label: "Hip Hop Dancing 5",
    shortLabel: "HipHop 5",
    category: "main",
    energy: "high",
    tags: ["mixamo", "hiphop", "main", "chorus", "accent"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/hip-hop-dancing-5.fbx",
    clipDurationSeconds: 4.1,
    beatSpan: 8,
  },
  {
    id: "salsa-dancing",
    label: "Salsa Dancing",
    shortLabel: "Salsa",
    category: "verse",
    energy: "medium",
    tags: ["mixamo", "salsa", "latin", "groove", "verse", "formation"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/salsa-dancing.fbx",
    clipDurationSeconds: 2.27,
    beatSpan: 8,
  },
  {
    id: "hip-hop-dancing-4",
    label: "Hip Hop Dancing 4",
    shortLabel: "HipHop 4",
    category: "main",
    energy: "high",
    tags: ["mixamo", "hiphop", "main", "chorus", "long"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/hip-hop-dancing-4.fbx",
    clipDurationSeconds: 11.97,
    beatSpan: 24,
  },
  {
    id: "booty-hip-hop-dance",
    label: "Booty Hip Hop Dance",
    shortLabel: "Booty",
    category: "main",
    energy: "high",
    tags: ["mixamo", "hiphop", "main", "chorus", "accent"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/booty-hip-hop-dance.fbx",
    clipDurationSeconds: 4.9,
    beatSpan: 8,
    formationEndOffset: [0, 0, 0.28],
  },
  {
    id: "rumba-dancing",
    label: "Rumba Dancing",
    shortLabel: "Rumba",
    category: "formation",
    energy: "medium",
    tags: ["mixamo", "rumba", "latin", "travel", "formation", "verse"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/rumba-dancing.fbx",
    clipDurationSeconds: 2.37,
    beatSpan: 8,
  },
  {
    id: "tut-hip-hop-dance",
    label: "Tut Hip Hop Dance",
    shortLabel: "Tut",
    category: "transition",
    energy: "medium",
    tags: ["mixamo", "hiphop", "tutting", "pose", "transition", "accent"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/tut-hip-hop-dance.fbx",
    clipDurationSeconds: 16.93,
    beatSpan: 32,
  },
  {
    id: "silly-dancing",
    label: "Silly Dancing",
    shortLabel: "Silly",
    category: "accent",
    energy: "medium",
    tags: ["mixamo", "accent", "playful", "transition", "hit"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/silly-dancing.fbx",
    clipDurationSeconds: 3.83,
    beatSpan: 8,
  },
  {
    id: "locking-hip-hop-dance",
    label: "Locking Hip Hop Dance",
    shortLabel: "Locking",
    category: "main",
    energy: "high",
    tags: ["mixamo", "hiphop", "locking", "main", "chorus", "accent"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/locking-hip-hop-dance.fbx",
    clipDurationSeconds: 17,
    beatSpan: 32,
  },
  {
    id: "dancing-twerk",
    label: "Dancing Twerk",
    shortLabel: "Twerk",
    category: "main",
    energy: "high",
    tags: ["mixamo", "hiphop", "main", "chorus", "accent"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/dancing-twerk.fbx",
    clipDurationSeconds: 15.2,
    beatSpan: 32,
  },
  {
    id: "hip-hop-dancing-2",
    label: "Hip Hop Dancing 2",
    shortLabel: "HipHop 2",
    category: "accent",
    energy: "high",
    tags: ["mixamo", "hiphop", "accent", "main", "hit"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/hip-hop-dancing-2.fbx",
    clipDurationSeconds: 4.47,
    beatSpan: 8,
  },
  {
    id: "hip-hop-dancing",
    label: "Hip Hop Dancing",
    shortLabel: "HipHop",
    category: "main",
    energy: "high",
    tags: ["mixamo", "hiphop", "main", "chorus"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/hip-hop-dancing.fbx",
    clipDurationSeconds: 7.07,
    beatSpan: 16,
  },
  {
    id: "hip-hop-dancing-1",
    label: "Hip Hop Dancing 1",
    shortLabel: "HipHop 1",
    category: "main",
    energy: "high",
    tags: ["mixamo", "hiphop", "main", "chorus", "groove"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/hip-hop-dancing-1.fbx",
    clipDurationSeconds: 6.33,
    beatSpan: 16,
  },
  {
    id: "breakdance-ending-1",
    label: "Breakdance Ending 1",
    shortLabel: "B-Boy End",
    category: "ending",
    energy: "high",
    tags: ["mixamo", "breakdance", "bboy", "ending", "accent", "floorwork"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/breakdance-ending-1.fbx",
    clipDurationSeconds: 6.5,
    beatSpan: 16,
    formationEndOffset: [0, 0, -0.42],
  },
  {
    id: "breakdance-footwork-to-idle",
    label: "Breakdance Footwork To Idle",
    shortLabel: "Footwork End",
    category: "ending",
    energy: "high",
    tags: ["mixamo", "breakdance", "footwork", "ending", "transition", "floorwork"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/breakdance-footwork-to-idle.fbx",
    clipDurationSeconds: 3.63,
    beatSpan: 8,
    formationEndOffset: [0, 0, -0.18],
  },
  {
    id: "breakdance-footwork-to-idle-alt",
    label: "Breakdance Footwork To Idle Alt",
    shortLabel: "Footwork Alt",
    category: "ending",
    energy: "high",
    tags: ["mixamo", "breakdance", "footwork", "ending", "transition", "floorwork"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/breakdance-footwork-to-idle-alt.fbx",
    clipDurationSeconds: 9.6,
    beatSpan: 16,
    formationEndOffset: [0, 0, -0.34],
  },
  {
    id: "swing-dancing",
    label: "Swing Dancing",
    shortLabel: "Swing",
    category: "verse",
    energy: "medium",
    tags: ["mixamo", "swing", "groove", "verse", "formation", "long"],
    source: "Mixamo FBX",
    assetUrl: "/assets/animations/swing-dancing.fbx",
    clipDurationSeconds: 20.9,
    beatSpan: 40,
  },
];

function withCategoryLabel(move) {
  return {
    ...move,
    categoryLabel: danceCategories[move.category]?.label ?? move.category,
  };
}

export const danceMoves = [
  ...originalDanceMoves,
  ...mixamoDanceMoves,
  ...placeholderDanceMoves,
].map(
  withCategoryLabel,
);
export const recommendedDanceMoves = mixamoDanceMoves
  .filter((move) => move.id !== "neutral-ready")
  .map(withCategoryLabel);
export const danceMoveMap = Object.fromEntries(danceMoves.map((move) => [move.id, move]));

const originalPhrasePattern = originalDanceMoves.map((move) => move.id);

export function getDanceMoveBeatSpan(moveId) {
  return danceMoveMap[moveId]?.beatSpan ?? DANCE_MODULE_BEATS;
}

function createSequenceSlot({ index, startBeat, beatDuration, moveId, beatSpan }) {
  const resolvedBeatSpan = beatSpan ?? getDanceMoveBeatSpan(moveId);

  return {
    id: `dance-slot-${index}`,
    index,
    startBeat,
    startTime: startBeat * beatDuration,
    beatSpan: resolvedBeatSpan,
    moveId,
  };
}

export function normalizeDanceSequenceTiming(sequence, beatDuration, totalBeats = Infinity) {
  let startBeat = 0;
  const normalizedSequence = [];

  sequence.forEach((slot, index) => {
    if (startBeat >= totalBeats) {
      return;
    }

    const remainingBeats = totalBeats - startBeat;
    const beatSpan = Math.min(getDanceMoveBeatSpan(slot.moveId), remainingBeats);
    const normalizedSlot = createSequenceSlot({
      index,
      startBeat,
      beatDuration,
      moveId: slot.moveId,
      beatSpan,
    });

    startBeat += normalizedSlot.beatSpan;

    normalizedSequence.push({
      ...slot,
      ...normalizedSlot,
      id: slot.id ?? normalizedSlot.id,
    });
  });

  return normalizedSequence;
}

function getMovePool(category) {
  return recommendedDanceMoves.filter(
    (move) => move.category === category || move.tags?.includes(category),
  );
}

const recommendationBlocks = {
  intro: [
    "breakdance-ready",
    "female-dance-pose",
    "wave-hip-hop-dance",
  ],
  verse: [
    "wave-hip-hop-dance",
    "rumba-dancing",
    "tut-hip-hop-dance",
    "hip-hop-dancing-1",
  ],
  transition: [
    "actorcore-walk-travel",
    "silly-dancing",
    "actorcore-catwalk-travel",
    "tut-hip-hop-dance",
  ],
  formation: [
    "actorcore-catwalk-travel",
    "rumba-dancing",
    "tut-hip-hop-dance",
    "actorcore-walk-travel",
  ],
  main: [
    "hip-hop-dancing",
    "locking-hip-hop-dance",
    "hip-hop-dancing-1",
    "dancing-twerk",
    "hip-hop-dancing-2",
    "silly-dancing",
  ],
  accent: [
    "hip-hop-dancing-2",
    "silly-dancing",
    "locking-hip-hop-dance",
    "female-dance-pose-1",
  ],
  ending: [
    "breakdance-footwork-to-idle",
    "breakdance-ending-1",
    "male-dance-pose",
    "female-standing-pose",
  ],
};

const stageRecommendationPools = {
  intro: [
    "breakdance-ready",
    "breakdance-ready-alt",
    "wave-hip-hop-dance",
    "tut-hip-hop-dance",
    "silly-dancing",
    "female-dance-pose",
  ],
  verse: [
    "wave-hip-hop-dance",
    "salsa-dancing",
    "actorcore-walk-travel",
    "tut-hip-hop-dance",
    "hip-hop-dancing-1",
    "swing-dancing",
    "rumba-dancing",
    "actorcore-catwalk-travel",
    "breakdance-ready-alt",
    "silly-dancing",
  ],
  preChorus: [
    "tut-hip-hop-dance",
    "hip-hop-dancing-2",
    "hip-hop-dancing-5",
    "hip-hop-dancing-1",
    "salsa-dancing",
    "silly-dancing",
  ],
  chorus: [
    "hip-hop-dancing",
    "locking-hip-hop-dance",
    "hip-hop-dancing-4",
    "hip-hop-dancing-5",
    "bboy-hip-hop-move-alt",
    "booty-hip-hop-dance",
    "dancing-twerk",
    "hip-hop-dancing-1",
    "hip-hop-dancing-2",
    "silly-dancing",
  ],
  ending: [
    "breakdance-footwork-to-idle",
    "breakdance-footwork-to-idle-alt",
    "breakdance-ending-1",
    "hip-hop-dancing-2",
    "silly-dancing",
    "male-dance-pose",
    "female-standing-pose",
  ],
};

const poseMoveIds = new Set([
  "female-standing-pose",
  "female-dance-pose",
  "female-dance-pose-1",
  "male-dance-pose",
]);

const transitionOnlyMoveIds = new Set([
  "actorcore-walk-travel",
  "actorcore-catwalk-travel",
  "breakdance-ready",
  "breakdance-ready-alt",
  "neutral-ready",
]);

const stageFallbackMoves = {
  intro: "breakdance-ready",
  verse: "wave-hip-hop-dance",
  preChorus: "hip-hop-dancing-2",
  chorus: "hip-hop-dancing",
  ending: "female-standing-pose",
};

function isMoveAllowedInStage(moveId, stage) {
  const move = danceMoveMap[moveId];

  if (!move) {
    return false;
  }

  if (stage === "chorus") {
    return (
      !transitionOnlyMoveIds.has(moveId) &&
      !poseMoveIds.has(moveId) &&
      !move.tags?.includes("walk") &&
      !move.tags?.includes("intro") &&
      !move.tags?.includes("poseHold")
    );
  }

  if (stage === "preChorus") {
    return (
      !transitionOnlyMoveIds.has(moveId) &&
      !poseMoveIds.has(moveId) &&
      !move.tags?.includes("walk") &&
      !move.tags?.includes("poseHold")
    );
  }

  return true;
}

const endingPoseMoves = [
  "male-dance-pose",
  "female-standing-pose",
  "female-dance-pose-1",
  "female-dance-pose",
];

const openingPoseMoves = [
  "female-dance-pose",
  "female-standing-pose",
  "female-dance-pose-1",
];

const forbiddenFollowers = {
  "actorcore-catwalk-travel": new Set([
    "actorcore-catwalk-travel",
    "actorcore-walk-travel",
    "rumba-dancing",
  ]),
  "actorcore-walk-travel": new Set([
    "actorcore-walk-travel",
    "actorcore-catwalk-travel",
  ]),
  "rumba-dancing": new Set(["rumba-dancing", "actorcore-catwalk-travel"]),
};

const blockSeedSalts = {
  intro: 11,
  verse: 23,
  transition: 37,
  formation: 43,
  main: 59,
  accent: 71,
  ending: 83,
};

function positiveModulo(value, modulo) {
  return ((value % modulo) + modulo) % modulo;
}

function seededRandom01(seed) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;

  return value - Math.floor(value);
}

function createSongSeed({ totalBeats, beatDuration, duration, sectionCandidates, variantSeed = 0 }) {
  const signature = [
    variantSeed,
    Math.round(totalBeats ?? 0),
    Math.round((duration ?? 0) * 10),
    Math.round((beatDuration ?? 0) * 1000),
    ...sectionCandidates.map((section) =>
      [
        Math.round(section.startTime * 10),
        Math.round(section.endTime * 10),
        Math.round((section.confidence ?? 0) * 100),
      ].join(":"),
    ),
  ].join("|");
  let hash = 0;

  for (let index = 0; index < signature.length; index += 1) {
    hash = (hash * 31 + signature.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

function getUpcomingSection(time, sectionCandidates) {
  return sectionCandidates.find((section) => section.startTime > time) ?? null;
}

function resolveRecommendationStage({
  absoluteSlotMidTime,
  relativeSlotMidTime,
  duration,
  slotDuration,
  sectionCandidates,
}) {
  const songProgress = duration > 0 ? relativeSlotMidTime / duration : 0;
  const activeSection = findActiveSection(absoluteSlotMidTime, sectionCandidates);

  if (songProgress < 0.1) {
    return "intro";
  }

  if (songProgress > 0.9) {
    return "ending";
  }

  if (activeSection || isInsideSection(absoluteSlotMidTime, sectionCandidates)) {
    return "chorus";
  }

  const upcomingSection = getUpcomingSection(absoluteSlotMidTime, sectionCandidates);

  if (
    upcomingSection &&
    upcomingSection.startTime - absoluteSlotMidTime <= slotDuration * 2.2
  ) {
    return "preChorus";
  }

  return "verse";
}

function pickEndingPose(seed, excludedIds = []) {
  const excludedMoveIds = new Set(excludedIds);
  const candidates = endingPoseMoves.filter((moveId) => !excludedMoveIds.has(moveId));
  const availableMoves = candidates.length ? candidates : endingPoseMoves;

  return availableMoves[Math.floor(seededRandom01(seed) * availableMoves.length)] ?? "female-standing-pose";
}

function pickOpeningPose(seed, excludedIds = []) {
  const excludedMoveIds = new Set(excludedIds);
  const candidates = openingPoseMoves.filter((moveId) => !excludedMoveIds.has(moveId));
  const availableMoves = candidates.length ? candidates : openingPoseMoves;

  return availableMoves[Math.floor(seededRandom01(seed) * availableMoves.length)] ?? "female-dance-pose";
}

function pickFromStagePool({
  stage,
  seed,
  recentMoveIds = [],
  remainingBeats = Infinity,
}) {
  const pool = stageRecommendationPools[stage] ?? stageRecommendationPools.verse;
  const previousMoveId = recentMoveIds[0] ?? null;
  const recentMoveSet = new Set(recentMoveIds);
  const forbiddenSet = previousMoveId ? forbiddenFollowers[previousMoveId] : null;
  const hasRecentPose = recentMoveIds.some((moveId) => poseMoveIds.has(moveId));
  const canFitMove = (moveId) => getDanceMoveBeatSpan(moveId) <= remainingBeats;
  const baseCandidates = pool
    .filter((moveId) => danceMoveMap[moveId])
    .filter((moveId) => isMoveAllowedInStage(moveId, stage))
    .filter((moveId) => remainingBeats < DANCE_MODULE_BEATS || canFitMove(moveId));
  const fitCandidates = baseCandidates.length
    ? baseCandidates
    : pool
        .filter((moveId) => danceMoveMap[moveId])
        .filter((moveId) => isMoveAllowedInStage(moveId, stage));
  const stageBalancedCandidates = hasRecentPose
    ? fitCandidates.filter((moveId) => !poseMoveIds.has(moveId))
    : fitCandidates;
  const balancedCandidates = stageBalancedCandidates.length
    ? stageBalancedCandidates
    : fitCandidates;
  const freshCandidates = fitCandidates.filter(
    (moveId) => !recentMoveSet.has(moveId) && !forbiddenSet?.has(moveId),
  );
  const balancedFreshCandidates = freshCandidates.filter((moveId) =>
    balancedCandidates.includes(moveId),
  );
  const nonForbiddenCandidates = balancedCandidates.filter((moveId) => !forbiddenSet?.has(moveId));
  const availableMoves = balancedFreshCandidates.length
    ? balancedFreshCandidates
    : nonForbiddenCandidates.length
      ? nonForbiddenCandidates
      : balancedCandidates;

  return (
    availableMoves[Math.floor(seededRandom01(seed) * availableMoves.length)] ??
    stageFallbackMoves[stage] ??
    "breakdance-ready"
  );
}

function getSongBlockOffset(blockName, songSeed, phraseCycle = 0) {
  const block = recommendationBlocks[blockName] ?? recommendationBlocks.verse;
  const salt = blockSeedSalts[blockName] ?? 0;

  if (!block.length) {
    return 0;
  }

  return positiveModulo(songSeed + salt + phraseCycle * 3, block.length);
}

function getSongBlockPosition(blockName, blockPosition, songSeed, phraseCycle = 0) {
  return blockPosition + getSongBlockOffset(blockName, songSeed, phraseCycle);
}

function pickFromPool(category, seed, fallbackCategory = "verse", excludedIds = []) {
  const excludedMoveIds = new Set(excludedIds);
  const pool = getMovePool(category).filter((move) => !excludedMoveIds.has(move.id));
  const fallbackPool = getMovePool(fallbackCategory).filter(
    (move) => !excludedMoveIds.has(move.id),
  );
  const availablePool = pool.length > 0 ? pool : fallbackPool;
  const move = availablePool[Math.abs(seed) % availablePool.length];

  return move?.id ?? recommendedDanceMoves[0]?.id ?? "neutral-ready";
}

function pickFromBlock(blockName, blockPosition, seed, excludedIds = []) {
  const excludedMoveIds = new Set(excludedIds);
  const block = recommendationBlocks[blockName] ?? recommendationBlocks.verse;
  const validBlock = block.filter((moveId) => {
    const move = danceMoveMap[moveId];

    if (!move) {
      return false;
    }

    if (
      (blockName === "verse" || blockName === "main") &&
      (move.tags?.includes("walk") || move.tags?.includes("poseHold"))
    ) {
      return false;
    }

    return true;
  });

  for (let offset = 0; offset < validBlock.length; offset += 1) {
    const moveId = validBlock[(blockPosition + offset) % validBlock.length];

    if (!excludedMoveIds.has(moveId)) {
      return moveId;
    }
  }

  return pickFromPool(blockName, seed, "verse", excludedIds);
}

function findActiveSection(time, sectionCandidates) {
  return sectionCandidates.find(
    (section) => time >= section.startTime && time < section.endTime,
  );
}

function isInsideSection(time, sectionCandidates) {
  return sectionCandidates.some(
    (section) => time >= section.startTime && time < section.endTime,
  );
}

function isApproachingSection(time, slotDuration, sectionCandidates) {
  const lookAhead = slotDuration * 0.65;

  return sectionCandidates.some(
    (section) => time < section.startTime && section.startTime - time <= lookAhead,
  );
}

function isLeavingSection(time, slotDuration, sectionCandidates) {
  const releaseWindow = slotDuration * 0.35;

  return sectionCandidates.some(
    (section) => time >= section.endTime && time - section.endTime <= releaseWindow,
  );
}

function chooseRecommendedMove({
  slotIndex,
  slotMidTime,
  musicStartTime = 0,
  duration,
  slotDuration,
  sectionCandidates,
  recentMoveIds = [],
  remainingBeats = Infinity,
  songSeed,
}) {
  const globalPhrasePosition = Math.floor(slotMidTime / Math.max(slotDuration, 0.001));
  const phraseCycle = Math.floor(globalPhrasePosition / 8);
  const absoluteSlotMidTime = musicStartTime + slotMidTime;
  const stage = resolveRecommendationStage({
    absoluteSlotMidTime,
    relativeSlotMidTime: slotMidTime,
    duration,
    slotDuration,
    sectionCandidates,
  });
  const seed =
    songSeed +
    slotIndex * 101 +
    Math.floor(slotMidTime * 29) +
    (blockSeedSalts[stage] ?? 0) +
    phraseCycle * 13;

  if (remainingBeats < DANCE_MODULE_BEATS) {
    return pickEndingPose(seed, recentMoveIds);
  }

  return pickFromStagePool({
    stage,
    seed,
    recentMoveIds,
    remainingBeats,
  });
}

export function buildOriginalDanceSequence({ totalBeats, beatDuration }) {
  const sequence = [];
  let startBeat = 0;
  let index = 0;

  while (startBeat < totalBeats) {
    const moveId = originalPhrasePattern[index % originalPhrasePattern.length];
    const remainingBeats = totalBeats - startBeat;
    const beatSpan = Math.min(DANCE_MODULE_BEATS, remainingBeats);

    sequence.push({
      id: `dance-slot-${index}`,
      index,
      startBeat,
      startTime: startBeat * beatDuration,
      beatSpan,
      moveId,
    });

    startBeat += beatSpan;
    index += 1;
  }

  return sequence;
}

export function buildRecommendedDanceSequence({
  totalBeats,
  beatDuration,
  duration,
  musicStartTime = 0,
  sectionCandidates = [],
  variantSeed = 0,
}) {
  const sequence = [];
  const baseSlotDuration = beatDuration * DANCE_MODULE_BEATS;
  const songSeed = createSongSeed({
    totalBeats,
    beatDuration,
    duration,
    sectionCandidates,
    variantSeed,
  });
  let startBeat = 0;
  let moduleIndex = 0;
  const openingPoseCount = totalBeats >= 64 ? 2 : totalBeats >= 24 ? 1 : 0;
  const closingPoseCount = totalBeats >= 64 ? 2 : totalBeats >= 32 ? 1 : 0;
  const closingPoseBeats = Math.min(totalBeats, closingPoseCount * 4);
  const appendSequenceSlot = (moveId, beatSpan) => {
    const resolvedBeatSpan = Math.min(beatSpan, totalBeats - startBeat);

    if (resolvedBeatSpan <= 0) {
      return false;
    }

    sequence.push({
      id: `dance-slot-${moduleIndex}`,
      index: moduleIndex,
      startBeat,
      startTime: startBeat * beatDuration,
      beatSpan: resolvedBeatSpan,
      moveId,
    });

    startBeat += resolvedBeatSpan;
    moduleIndex += 1;
    return true;
  };

  for (let poseIndex = 0; poseIndex < openingPoseCount; poseIndex += 1) {
    if (startBeat + 4 + closingPoseBeats > totalBeats) {
      break;
    }

    const recentMoveIds = sequence.slice(-3).map((slot) => slot.moveId).reverse();
    const moveId = pickOpeningPose(songSeed + poseIndex * 97, recentMoveIds);
    appendSequenceSlot(moveId, 4);
  }

  const danceEndBeat = Math.max(startBeat, totalBeats - closingPoseBeats);

  while (startBeat < danceEndBeat) {
    const slotStart = startBeat * beatDuration;
    const slotMidTime = slotStart + baseSlotDuration / 2;
    const remainingBeats = danceEndBeat - startBeat;
    const recentMoveIds = sequence.slice(-4).map((slot) => slot.moveId).reverse();

    if (remainingBeats < DANCE_MODULE_BEATS) {
      if (sequence.length > 0) {
        sequence[sequence.length - 1].beatSpan += remainingBeats;
        startBeat = danceEndBeat;
      }
      break;
    }

    const moveId = chooseRecommendedMove({
      slotIndex: moduleIndex,
      slotMidTime,
      musicStartTime,
      duration,
      slotDuration: baseSlotDuration,
      sectionCandidates,
      recentMoveIds,
      remainingBeats,
      songSeed,
    });
    const moveBeatSpan = Math.min(getDanceMoveBeatSpan(moveId), remainingBeats);

    appendSequenceSlot(moveId, moveBeatSpan);
  }

  while (startBeat < totalBeats) {
    const remainingBeats = totalBeats - startBeat;
    const recentMoveIds = sequence.slice(-4).map((slot) => slot.moveId).reverse();

    if (remainingBeats < 2 && sequence.length > 0) {
      sequence[sequence.length - 1].beatSpan += remainingBeats;
      break;
    }

    const moveId = pickEndingPose(songSeed + moduleIndex * 109, recentMoveIds);
    appendSequenceSlot(moveId, Math.min(4, remainingBeats));
  }

  return sequence;
}
