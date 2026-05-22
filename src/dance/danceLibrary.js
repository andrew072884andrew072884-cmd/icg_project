export const DANCE_MODULE_BEATS = 8;

export const danceCategories = {
  intro: { label: "前奏", intent: "低動作量、建立角色輪廓與開場姿態。" },
  verse: { label: "主歌 / 基礎", intent: "穩定 groove，保留音樂進入 main section 前的空間。" },
  transition: { label: "過場", intent: "銜接段落、準備副歌或高能量段落。" },
  formation: { label: "變換隊形", intent: "讓兩位舞者產生左右、前後或旋轉隊形變化。" },
  main: { label: "Main section", intent: "副歌或主要段落使用，動作幅度與能量較高。" },
  accent: { label: "重拍強調", intent: "用於段落尾端、重拍、drop 或燈光 hit。" },
  ending: { label: "結尾", intent: "收束、freeze pose 或最後亮相。" },
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
    label: "Bounce Step",
    shortLabel: "Bounce",
    category: "intro",
    energy: "low",
    tags: ["intro", "verse", "basic"],
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

function withCategoryLabel(move) {
  return {
    ...move,
    categoryLabel: danceCategories[move.category]?.label ?? move.category,
  };
}

export const danceMoves = [...originalDanceMoves, ...placeholderDanceMoves].map(
  withCategoryLabel,
);
export const danceMoveMap = Object.fromEntries(danceMoves.map((move) => [move.id, move]));

const originalPhrasePattern = originalDanceMoves.map((move) => move.id);

function getMovePool(category) {
  return danceMoves.filter(
    (move) => move.category === category || move.tags?.includes(category),
  );
}

function pickFromPool(category, seed, fallbackCategory = "verse") {
  const pool = getMovePool(category);
  const fallbackPool = getMovePool(fallbackCategory);
  const availablePool = pool.length > 0 ? pool : fallbackPool;
  const move = availablePool[Math.abs(seed) % availablePool.length];

  return move?.id ?? originalPhrasePattern[0] ?? "side-groove";
}

function isInsideSection(time, sectionCandidates) {
  return sectionCandidates.some(
    (section) => time >= section.startTime && time < section.endTime,
  );
}

function isApproachingSection(time, slotDuration, sectionCandidates) {
  const lookAhead = slotDuration * 1.4;

  return sectionCandidates.some(
    (section) => time < section.startTime && section.startTime - time <= lookAhead,
  );
}

function isLeavingSection(time, slotDuration, sectionCandidates) {
  const releaseWindow = slotDuration * 0.8;

  return sectionCandidates.some(
    (section) => time >= section.endTime && time - section.endTime <= releaseWindow,
  );
}

function chooseRecommendedMove(slotIndex, slotMidTime, duration, slotDuration, sectionCandidates) {
  const songProgress = duration > 0 ? slotMidTime / duration : 0;
  const phrasePosition = slotIndex % 8;
  const seed = slotIndex + Math.floor(slotMidTime);

  if (songProgress < 0.1) {
    return pickFromPool("intro", seed);
  }

  if (songProgress > 0.88) {
    return phrasePosition >= 6
      ? pickFromPool("ending", seed)
      : pickFromPool("transition", seed, "ending");
  }

  if (isApproachingSection(slotMidTime, slotDuration, sectionCandidates)) {
    return phrasePosition % 2 === 0
      ? pickFromPool("transition", seed)
      : pickFromPool("formation", seed);
  }

  if (isInsideSection(slotMidTime, sectionCandidates)) {
    if (phrasePosition === 3 || phrasePosition === 7) {
      return pickFromPool("accent", seed, "main");
    }

    if (phrasePosition === 2 || phrasePosition === 5) {
      return pickFromPool("formation", seed, "main");
    }

    return pickFromPool("main", seed);
  }

  if (isLeavingSection(slotMidTime, slotDuration, sectionCandidates)) {
    return pickFromPool("transition", seed);
  }

  if (phrasePosition === 4) {
    return pickFromPool("formation", seed);
  }

  if (phrasePosition >= 6) {
    return pickFromPool("transition", seed);
  }

  return pickFromPool("verse", seed);
}

export function buildOriginalDanceSequence({ slotCount, slotDuration }) {
  return Array.from({ length: slotCount }, (_, index) => {
    const slotStart = index * slotDuration;
    const moveId = originalPhrasePattern[index % originalPhrasePattern.length];

    return {
      id: `dance-slot-${index}`,
      index,
      startTime: slotStart,
      moveId,
    };
  });
}

export function buildRecommendedDanceSequence({
  slotCount,
  slotDuration,
  duration,
  sectionCandidates = [],
}) {
  return Array.from({ length: slotCount }, (_, index) => {
    const slotStart = index * slotDuration;
    const slotMidTime = slotStart + slotDuration / 2;
    const moveId = chooseRecommendedMove(
      index,
      slotMidTime,
      duration,
      slotDuration,
      sectionCandidates,
    );

    return {
      id: `dance-slot-${index}`,
      index,
      startTime: slotStart,
      moveId,
    };
  });
}
