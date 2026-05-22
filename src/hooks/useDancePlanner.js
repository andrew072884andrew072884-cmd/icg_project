import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DANCE_MODULE_BEATS,
  buildOriginalDanceSequence,
  buildRecommendedDanceSequence,
  danceMoveMap,
  danceMoves,
} from "../dance/danceLibrary";

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
  const lastPlanKey = useRef("");

  const beatDuration = audioMetrics.beatDuration || 0.5;
  const slotDuration = beatDuration * DANCE_MODULE_BEATS;
  const readyForPlanning =
    isReady && audioMetrics.duration > 0 && analysisState !== "analyzing";
  const slotCount = readyForPlanning
    ? Math.max(1, Math.ceil(audioMetrics.duration / slotDuration))
    : 0;
  const sectionSignature = createSectionSignature(sectionCandidates);
  const planKey = `${selectedTrackName}|${Math.round(audioMetrics.duration * 10)}|${Math.round(
    slotDuration * 100,
  )}|${sectionSignature}`;

  const regenerateSequence = useCallback(() => {
    if (!readyForPlanning || isPlaying) {
      return;
    }

    setSequence(
      buildRecommendedDanceSequence({
        slotCount,
        slotDuration,
        duration: audioMetrics.duration,
        sectionCandidates,
      }),
    );
    setIsConfirmed(false);
  }, [
    audioMetrics.duration,
    isPlaying,
    readyForPlanning,
    sectionCandidates,
    slotCount,
    slotDuration,
  ]);

  const useOriginalSequence = useCallback(() => {
    if (!readyForPlanning || isPlaying) {
      return;
    }

    setSequence(
      buildOriginalDanceSequence({
        slotCount,
        slotDuration,
      }),
    );
    setIsConfirmed(false);
  }, [isPlaying, readyForPlanning, slotCount, slotDuration]);

  useEffect(() => {
    if (!readyForPlanning || isPlaying || lastPlanKey.current === planKey) {
      return;
    }

    lastPlanKey.current = planKey;
    setSequence(
      buildRecommendedDanceSequence({
        slotCount,
        slotDuration,
        duration: audioMetrics.duration,
        sectionCandidates,
      }),
    );
    setIsConfirmed(false);
  }, [
    audioMetrics.duration,
    planKey,
    isPlaying,
    readyForPlanning,
    sectionCandidates,
    slotCount,
    slotDuration,
  ]);

  const updateMoveAt = useCallback(
    (slotIndex, moveId) => {
      if (isPlaying || !danceMoveMap[moveId]) {
        return;
      }

      setSequence((currentSequence) =>
        currentSequence.map((slot) =>
          slot.index === slotIndex ? { ...slot, moveId } : slot,
        ),
      );
      setIsConfirmed(false);
    },
    [isPlaying],
  );

  const confirmSequence = useCallback(() => {
    if (!isPlaying && sequence.length > 0) {
      setIsConfirmed(true);
    }
  }, [isPlaying, sequence.length]);

  const activeSlotIndex = sequence.length
    ? Math.min(sequence.length - 1, Math.max(0, Math.floor(audioMetrics.beatIndex / DANCE_MODULE_BEATS)))
    : 0;
  const activeSlot = sequence[activeSlotIndex] ?? null;
  const activeMove = activeSlot ? danceMoveMap[activeSlot.moveId] : null;
  const modulePhase =
    sequence.length && audioMetrics.beatIndex >= 0
      ? ((audioMetrics.beatIndex % DANCE_MODULE_BEATS) + audioMetrics.beatPhase) /
        DANCE_MODULE_BEATS
      : 0;

  const danceState = useMemo(
    () => ({
      activeSlotIndex,
      activeMove,
      modulePhase,
      isConfirmed,
      sequence,
    }),
    [activeMove, activeSlotIndex, isConfirmed, modulePhase, sequence],
  );

  return {
    danceMoves,
    sequence,
    slotCount,
    slotDuration,
    moduleBeats: DANCE_MODULE_BEATS,
    activeSlotIndex,
    activeMove,
    isConfirmed,
    readyForPlanning,
    danceState,
    updateMoveAt,
    regenerateSequence,
    useOriginalSequence,
    confirmSequence,
  };
}
