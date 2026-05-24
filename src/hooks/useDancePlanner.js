import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DANCE_MODULE_BEATS,
  buildOriginalDanceSequence,
  buildRecommendedDanceSequence,
  danceMoveMap,
  danceMoves,
  normalizeDanceSequenceTiming,
  recommendedDanceMoves,
} from "../dance/danceLibrary";
import { ORIGINAL_AUDIO_NAME } from "../dance/originalMovie";

function createSectionSignature(sectionCandidates) {
  return sectionCandidates
    .map((section) => `${Math.round(section.startTime)}-${Math.round(section.endTime)}`)
    .join("|");
}

export default function useDancePlanner({
  audioMetrics,
  isReady,
  isPlaying,
  selectedTrackName,
  analysisState,
  sectionCandidates,
}) {
  const [sequence, setSequence] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [sequenceMode, setSequenceMode] = useState("recommended");
  const [recommendationVariant, setRecommendationVariant] = useState(0);
  const lastPlanKey = useRef("");

  const beatDuration =
    audioMetrics.sequenceBeatDuration || audioMetrics.beatDuration || 0.5;
  const slotDuration = beatDuration * DANCE_MODULE_BEATS;
  const readyForPlanning =
    isReady && audioMetrics.duration > 0 && analysisState !== "analyzing";
  const activeMusicDuration = audioMetrics.activeMusicDuration || audioMetrics.duration;
  const totalBeats = readyForPlanning
    ? Math.max(
        1,
        Math.min(
          audioMetrics.sequenceTotalBeats || Infinity,
          Math.floor(activeMusicDuration / beatDuration),
        ),
      )
    : 0;
  const slotCount = readyForPlanning
    ? Math.max(1, Math.ceil(totalBeats / DANCE_MODULE_BEATS))
    : 0;
  const sectionSignature = createSectionSignature(sectionCandidates);
  const planKey = `${sequenceMode}|${recommendationVariant}|${selectedTrackName}|${Math.round(audioMetrics.duration * 10)}|${Math.round(
    slotDuration * 100,
  )}|${totalBeats}|${Math.round((audioMetrics.musicStartTime ?? 0) * 10)}|${Math.round(
    (audioMetrics.musicEndTime ?? audioMetrics.duration) * 10,
  )}|${sectionSignature}`;

  const buildSequence = useCallback(
    (mode, variantOverride = recommendationVariant) => {
      if (mode === "original" || mode === "originalPuppet") {
        return buildOriginalDanceSequence({
          totalBeats,
          beatDuration,
        });
      }

      return buildRecommendedDanceSequence({
        totalBeats,
        beatDuration,
        duration: activeMusicDuration,
        musicStartTime: audioMetrics.musicStartTime ?? 0,
        sectionCandidates,
        variantSeed: variantOverride,
      });
    },
    [
      activeMusicDuration,
      audioMetrics.musicStartTime,
      beatDuration,
      recommendationVariant,
      sectionCandidates,
      totalBeats,
    ],
  );

  const regenerateSequence = useCallback(() => {
    setSequenceMode("recommended");

    if (!readyForPlanning || isPlaying) {
      return;
    }

    const nextVariant = recommendationVariant + 1;

    setRecommendationVariant(nextVariant);
    setSequence(buildSequence("recommended", nextVariant));
    setIsConfirmed(false);
  }, [buildSequence, isPlaying, readyForPlanning, recommendationVariant]);

  const useOriginalSequence = useCallback(() => {
    setSequenceMode("original");

    if (!readyForPlanning || isPlaying) {
      return;
    }

    setSequence(buildSequence("original"));
    setIsConfirmed(true);
  }, [buildSequence, isPlaying, readyForPlanning]);

  const useOriginalPuppetSequence = useCallback(() => {
    setSequenceMode("originalPuppet");

    if (!readyForPlanning || isPlaying) {
      return;
    }

    setSequence(buildSequence("originalPuppet"));
    setIsConfirmed(true);
  }, [buildSequence, isPlaying, readyForPlanning]);

  useEffect(() => {
    if (
      selectedTrackName &&
      selectedTrackName !== ORIGINAL_AUDIO_NAME &&
      (sequenceMode === "original" || sequenceMode === "originalPuppet") &&
      !isPlaying
    ) {
      setSequenceMode("recommended");
    }
  }, [isPlaying, selectedTrackName, sequenceMode]);

  useEffect(() => {
    if (
      !readyForPlanning ||
      isPlaying ||
      sequenceMode === "custom" ||
      lastPlanKey.current === planKey
    ) {
      return;
    }

    lastPlanKey.current = planKey;
    setSequence(buildSequence(sequenceMode));
    setIsConfirmed(sequenceMode === "original" || sequenceMode === "originalPuppet");
  }, [
    buildSequence,
    planKey,
    isPlaying,
    readyForPlanning,
    sequenceMode,
  ]);

  const updateMoveAt = useCallback(
    (slotIndex, moveId) => {
      if (isPlaying || !danceMoveMap[moveId]) {
        return;
      }

      setSequence((currentSequence) =>
        normalizeDanceSequenceTiming(
          currentSequence.map((slot) =>
            slot.index === slotIndex ? { ...slot, moveId } : slot,
          ),
          beatDuration,
          totalBeats,
        ),
      );
      setIsConfirmed(false);
    },
    [beatDuration, isPlaying, totalBeats],
  );

  const confirmSequence = useCallback(() => {
    if (!isPlaying && sequence.length > 0) {
      setIsConfirmed(true);
    }
  }, [isPlaying, sequence.length]);

  const beatPosition = Math.min(
    totalBeats,
    Math.max(
      0,
      audioMetrics.sequenceBeatPosition ??
        (audioMetrics.beatIndex ?? 0) + (audioMetrics.beatPhase ?? 0),
    ),
  );
  const foundActiveSlotIndex = sequence.findIndex((slot, index) => {
    const nextSlot = sequence[index + 1];
    const slotEndBeat = nextSlot?.startBeat ?? slot.startBeat + slot.beatSpan;

    return beatPosition >= slot.startBeat && beatPosition < slotEndBeat;
  });
  const activeSlotIndex = sequence.length
    ? foundActiveSlotIndex >= 0
      ? foundActiveSlotIndex
      : sequence.length - 1
    : 0;
  const activeSlot = sequence[activeSlotIndex] ?? null;
  const activeMove = activeSlot ? danceMoveMap[activeSlot.moveId] : null;
  const activeSlotEndBeat = activeSlot
    ? sequence[activeSlotIndex + 1]?.startBeat ?? activeSlot.startBeat + activeSlot.beatSpan
    : DANCE_MODULE_BEATS;
  const activeBeatSpan = activeSlot
    ? Math.max(1, activeSlotEndBeat - activeSlot.startBeat)
    : DANCE_MODULE_BEATS;
  const modulePhase =
    sequence.length && audioMetrics.beatIndex >= 0 && activeSlot
      ? Math.min(0.999, Math.max(0, (beatPosition - activeSlot.startBeat) / activeBeatSpan))
      : 0;

  const danceState = useMemo(
    () => ({
      activeSlotIndex,
      activeBeatSpan,
      activeMove,
      modulePhase,
      isConfirmed,
      sequenceMode,
      sequence,
    }),
    [
      activeBeatSpan,
      activeMove,
      activeSlotIndex,
      isConfirmed,
      modulePhase,
      sequence,
      sequenceMode,
    ],
  );
  const selectableDanceMoves = useMemo(
    () =>
      sequenceMode === "original" || sequenceMode === "originalPuppet"
        ? danceMoves
        : recommendedDanceMoves,
    [sequenceMode],
  );

  return {
    danceMoves: selectableDanceMoves,
    sequence,
    slotCount,
    totalBeats,
    slotDuration,
    moduleBeats: DANCE_MODULE_BEATS,
    activeSlotIndex,
    activeMove,
    isConfirmed,
    sequenceMode,
    readyForPlanning,
    danceState,
    updateMoveAt,
    regenerateSequence,
    useOriginalSequence,
    useOriginalPuppetSequence,
    confirmSequence,
  };
}
