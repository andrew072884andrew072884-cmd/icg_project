import { useCallback, useEffect, useRef, useState } from "react";

const defaultMetrics = {
  currentTime: 0,
  duration: 0,
  beatIndex: 0,
  barIndex: 0,
  beatPhase: 0,
  beatPulse: 0,
  bassEnergy: 0,
};

function createAudioElement() {
  const element = new Audio();
  element.preload = "auto";
  element.crossOrigin = "anonymous";
  return element;
}

export default function useAudioEngine() {
  const [bpm, setBpm] = useState(120);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrackName, setSelectedTrackName] = useState("");
  const [audioMetrics, setAudioMetrics] = useState(defaultMetrics);

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const rafRef = useRef(0);
  const objectUrlRef = useRef("");

  if (!audioRef.current) {
    audioRef.current = createAudioElement();
  }

  const audio = audioRef.current;

  const updateMetrics = useCallback(() => {
    const currentTime = audio.currentTime || 0;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const beatsPerSecond = bpm / 60;
    const rawBeat = currentTime * beatsPerSecond;
    const beatIndex = Math.floor(rawBeat);
    const beatPhase = rawBeat - beatIndex;
    const barIndex = Math.floor(beatIndex / 4);
    const beatPulse = Math.max(0, 1 - beatPhase * 4);

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
      currentTime,
      duration,
      beatIndex,
      barIndex,
      beatPhase,
      beatPulse,
      bassEnergy,
    });
  }, [audio, bpm]);

  const tick = useCallback(() => {
    updateMetrics();
    rafRef.current = window.requestAnimationFrame(tick);
  }, [updateMetrics]);

  const stopTick = useCallback(() => {
    window.cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
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
    (event) => {
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
    },
    [audio, stopTick],
  );

  const handleBpmChange = useCallback((event) => {
    const nextValue = Number(event.target.value);

    if (!Number.isFinite(nextValue)) {
      return;
    }

    setBpm(Math.min(220, Math.max(40, Math.round(nextValue))));
  }, []);

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
  }, [bpm, updateMetrics]);

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
    bpm,
    isReady,
    isPlaying,
    selectedTrackName,
    handleFileSelect,
    handleBpmChange,
    togglePlayback,
    restartPlayback,
  };
}
