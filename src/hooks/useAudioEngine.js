import { useCallback, useEffect, useRef, useState } from "react";
import {
  analyzeAudioBuffer,
  computeBeatMetricsFromGrid,
} from "../audio/analysis";

const METRICS_UPDATE_INTERVAL_MS = 1000 / 30;

const defaultMetrics = {
  currentTime: 0,
  duration: 0,
  beatIndex: 0,
  barIndex: 0,
  beatPhase: 0,
  beatPulse: 0,
  beatDuration: 0.5,
  bassEnergy: 0,
  currentSection: null,
  isMainSection: false,
  stageCue: "intro",
};

function createAudioElement() {
  const element = new Audio();
  element.preload = "auto";
  element.crossOrigin = "anonymous";
  return element;
}

export default function useAudioEngine() {
  const [manualBpm, setManualBpm] = useState(120);
  const [detectedBpm, setDetectedBpm] = useState(null);
  const [timingMode, setTimingMode] = useState("auto");
  const [beatOffsetMs, setBeatOffsetMs] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrackName, setSelectedTrackName] = useState("");
  const [audioMetrics, setAudioMetrics] = useState(defaultMetrics);
  const [analysisState, setAnalysisState] = useState("idle");
  const [analysisError, setAnalysisError] = useState("");
  const [sectionCandidates, setSectionCandidates] = useState([]);

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const metricsTimerRef = useRef(0);
  const objectUrlRef = useRef("");
  const beatTimesRef = useRef([]);
  const sectionsRef = useRef([]);

  if (!audioRef.current) {
    audioRef.current = createAudioElement();
  }

  const audio = audioRef.current;
  const effectiveBpm = timingMode === "auto" ? detectedBpm ?? manualBpm : manualBpm;

  const findCurrentSection = useCallback((currentTime) => {
    return (
      sectionsRef.current.find(
        (section) => currentTime >= section.startTime && currentTime < section.endTime,
      ) ?? null
    );
  }, []);

  const resolveStageCue = useCallback(
    (currentTime, beatDuration, currentSection) => {
      if (currentSection) {
        return "chorus";
      }

      if (currentTime < 12) {
        return "intro";
      }

      const nextSection = sectionsRef.current.find((section) => section.startTime > currentTime);

      if (nextSection && nextSection.startTime - currentTime <= beatDuration * 8) {
        return "preChorus";
      }

      return "verse";
    },
    [],
  );

  const updateMetrics = useCallback(() => {
    const currentTime = audio.currentTime || 0;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const offsetSeconds = beatOffsetMs / 1000;
    const currentSection = findCurrentSection(currentTime);

    let beatMetrics;

    if (timingMode === "auto" && beatTimesRef.current.length) {
      beatMetrics = computeBeatMetricsFromGrid(
        currentTime - offsetSeconds,
        duration,
        beatTimesRef.current,
        effectiveBpm,
        [],
      );
    } else {
      const adjustedTime = Math.max(0, currentTime - offsetSeconds);
      const beatsPerSecond = effectiveBpm / 60;
      const rawBeat = adjustedTime * beatsPerSecond;
      const beatIndex = Math.floor(rawBeat);
      const beatPhase = rawBeat - beatIndex;

      beatMetrics = {
        currentTime,
        duration,
        beatIndex,
        barIndex: Math.floor(beatIndex / 4),
        beatPhase,
        beatPulse: Math.max(0, 1 - beatPhase * 4),
        beatDuration: 60 / effectiveBpm,
      };
    }

    let bassEnergy = 0;

    if (analyserRef.current) {
      const analyser = analyserRef.current;
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencyData);

      const bassBins = Math.max(8, Math.floor(frequencyData.length * 0.04));
      let sum = 0;

      for (let index = 0; index < bassBins; index += 1) {
        sum += frequencyData[index];
      }

      bassEnergy = sum / (bassBins * 255);
    }

    setAudioMetrics({
      ...beatMetrics,
      currentTime,
      duration,
      bassEnergy,
      currentSection,
      isMainSection: Boolean(currentSection),
      stageCue: resolveStageCue(
        currentTime,
        beatMetrics.beatDuration ?? 60 / effectiveBpm,
        currentSection,
      ),
    });
  }, [audio, beatOffsetMs, effectiveBpm, findCurrentSection, resolveStageCue, timingMode]);

  const tick = useCallback(() => {
    updateMetrics();
    metricsTimerRef.current = window.setTimeout(tick, METRICS_UPDATE_INTERVAL_MS);
  }, [updateMetrics]);

  const stopTick = useCallback(() => {
    window.clearTimeout(metricsTimerRef.current);
    metricsTimerRef.current = 0;
  }, []);

  const ensureAudioGraph = useCallback(async () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }

    if (!sourceNodeRef.current) {
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audio);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 1024;
      analyserRef.current.smoothingTimeConstant = 0.82;

      sourceNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
  }, [audio]);

  const handleFileSelect = useCallback(
    async (event) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      stopTick();
      audio.pause();
      setIsPlaying(false);

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      objectUrlRef.current = URL.createObjectURL(file);
      audio.src = objectUrlRef.current;
      audio.load();

      setSelectedTrackName(file.name);
      setIsReady(false);
      setAudioMetrics(defaultMetrics);
      setAnalysisState("analyzing");
      setAnalysisError("");
      setDetectedBpm(null);
      beatTimesRef.current = [];
      sectionsRef.current = [];
      setSectionCandidates([]);

      try {
        const fileBuffer = await file.arrayBuffer();
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const decodeContext = new AudioContextClass();
        try {
          const decodedBuffer = await decodeContext.decodeAudioData(fileBuffer.slice(0));
          const analysis = await analyzeAudioBuffer(decodedBuffer);

          setDetectedBpm(analysis.detectedBpm);
          beatTimesRef.current = analysis.beatTimes;
          sectionsRef.current = analysis.sections;
          setSectionCandidates(analysis.sections);
          setAnalysisState("ready");
        } finally {
          await decodeContext.close();
        }
      } catch (error) {
        console.error("Audio analysis failed", error);
        setAnalysisState("error");
        setAnalysisError("Automatic beat detection failed. You can still set BPM manually.");
      }
    },
    [audio, stopTick],
  );

  const handleBpmChange = useCallback((event) => {
    const nextValue = Number(event.target.value);

    if (!Number.isFinite(nextValue)) {
      return;
    }

    const nextBpm = Math.min(220, Math.max(40, Math.round(nextValue)));
    setManualBpm(nextBpm);
  }, []);

  const handleTimingModeChange = useCallback((nextMode) => {
    setTimingMode(nextMode);
  }, []);

  const handleBeatOffsetChange = useCallback((event) => {
    const nextValue = Number(event.target.value);

    if (!Number.isFinite(nextValue)) {
      return;
    }

    setBeatOffsetMs(Math.min(2000, Math.max(-2000, Math.round(nextValue))));
  }, []);

  const handleSeekChange = useCallback(
    (event) => {
      const nextValue = Number(event.target.value);

      if (!Number.isFinite(nextValue) || !audio.src) {
        return;
      }

      const duration = Number.isFinite(audio.duration) ? audio.duration : nextValue;
      audio.currentTime = Math.min(duration, Math.max(0, nextValue));
      updateMetrics();
    },
    [audio, updateMetrics],
  );

  const togglePlayback = useCallback(async () => {
    if (!audio.src) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      stopTick();
      updateMetrics();
      return;
    }

    await ensureAudioGraph();
    await audio.play();
    setIsPlaying(true);
    stopTick();
    tick();
  }, [audio, ensureAudioGraph, isPlaying, stopTick, tick, updateMetrics]);

  const restartPlayback = useCallback(async () => {
    if (!audio.src) {
      return;
    }

    audio.currentTime = 0;
    updateMetrics();

    if (!isPlaying) {
      return;
    }

    await ensureAudioGraph();
    await audio.play();
    stopTick();
    tick();
  }, [audio, ensureAudioGraph, isPlaying, stopTick, tick, updateMetrics]);

  useEffect(() => {
    const handleLoadedMetadata = () => {
      setIsReady(true);
      updateMetrics();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      stopTick();
      updateMetrics();
    };

    const handlePause = () => {
      setIsPlaying(false);
      stopTick();
      updateMetrics();
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, [audio, stopTick, updateMetrics]);

  useEffect(() => {
    updateMetrics();
  }, [beatOffsetMs, effectiveBpm, timingMode, updateMetrics]);

  useEffect(
    () => () => {
      stopTick();
      audio.pause();

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    },
    [audio, stopTick],
  );

  return {
    audioMetrics,
    bpm: effectiveBpm,
    manualBpm,
    detectedBpm,
    timingMode,
    beatOffsetMs,
    isReady,
    isPlaying,
    selectedTrackName,
    analysisState,
    analysisError,
    sectionCandidates,
    handleFileSelect,
    handleBpmChange,
    handleTimingModeChange,
    handleBeatOffsetChange,
    handleSeekChange,
    togglePlayback,
    restartPlayback,
  };
}
