import { DANCE_MODULE_BEATS, danceMoves } from "./danceLibrary";

const DEFAULT_ANIMATION_SET = "embeddedHumanoid";

function normalizeName(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function createDefaultBinding(move) {
  const aliases = [
    move.id,
    move.label,
    move.shortLabel,
    `${move.shortLabel} ${move.categoryLabel}`,
    ...(move.tags ?? []),
  ];

  return {
    moveId: move.id,
    preferredBeats: DANCE_MODULE_BEATS,
    loopsPerModule: 1,
    externalUrl: "",
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

  if (animationSet.fallbackToFirstClip && animations.length === 1) {
    return {
      clip: animations[0],
      binding,
      reason: "single-clip-fallback",
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

  return normalizedPhase * clip.duration;
}
