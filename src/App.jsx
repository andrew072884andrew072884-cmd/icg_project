import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import SceneRoot from "./scene/SceneRoot";
import StartOverlay from "./components/StartOverlay";
import CharacterImportGuide from "./components/CharacterImportGuide";
import AudioControlPanel from "./components/AudioControlPanel";
import { characterSlots } from "./config/characterSlots";
import useAudioEngine from "./hooks/useAudioEngine";

export default function App() {
  const [started, setStarted] = useState(false);
  const {
    audioMetrics,
    bpm,
    isReady,
    isPlaying,
    selectedTrackName,
    handleFileSelect,
    handleBpmChange,
    togglePlayback,
    restartPlayback,
  } = useAudioEngine();

  const importReadyCount = useMemo(
    () => characterSlots.filter((slot) => Boolean(slot.url)).length,
    [],
  );

  return (
    <div className="app-shell">
      <Canvas
        camera={{ position: [0, 13, 26], fov: 45 }}
        dpr={[1, 1.5]}
        shadows
      >
        <SceneRoot started={started} syncState={audioMetrics} />
      </Canvas>

      {!started && <StartOverlay onStart={() => setStarted(true)} />}

      <AudioControlPanel
        bpm={bpm}
        isReady={isReady}
        isPlaying={isPlaying}
        selectedTrackName={selectedTrackName}
        audioMetrics={audioMetrics}
        onFileSelect={handleFileSelect}
        onBpmChange={handleBpmChange}
        onTogglePlayback={togglePlayback}
        onRestart={restartPlayback}
      />

      <CharacterImportGuide
        importReadyCount={importReadyCount}
        totalSlots={characterSlots.length}
      />

      <Loader />
    </div>
  );
}
