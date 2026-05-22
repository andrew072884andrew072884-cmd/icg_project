import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import SceneRoot from "./scene/SceneRoot";
import AudioControlPanel from "./components/AudioControlPanel";
import DanceSequencePanel from "./components/DanceSequencePanel";
import useAudioEngine from "./hooks/useAudioEngine";
import useDancePlanner from "./hooks/useDancePlanner";

export default function App() {
  const [audioPanelCollapsed, setAudioPanelCollapsed] = useState(false);
  const [dancePanelCollapsed, setDancePanelCollapsed] = useState(false);
  const [cameraMode, setCameraMode] = useState("auto");
  const {
    audioMetrics,
    bpm,
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
  } = useAudioEngine();
  const dancePlanner = useDancePlanner({
    audioMetrics,
    isReady,
    isPlaying,
    selectedTrackName,
    analysisState,
    sectionCandidates,
  });

  return (
    <div className="app-shell">
      <Canvas
        camera={{ position: [0, 13, 26], fov: 45 }}
        dpr={[1, 1.25]}
        shadows
      >
        <SceneRoot
          started
          syncState={audioMetrics}
          cameraMode={cameraMode}
          danceState={dancePlanner.danceState}
        />
      </Canvas>

      <AudioControlPanel
        bpm={bpm}
        manualBpm={manualBpm}
        detectedBpm={detectedBpm}
        timingMode={timingMode}
        beatOffsetMs={beatOffsetMs}
        isReady={isReady}
        isPlaying={isPlaying}
        selectedTrackName={selectedTrackName}
        audioMetrics={audioMetrics}
        analysisState={analysisState}
        analysisError={analysisError}
        sectionCandidates={sectionCandidates}
        onFileSelect={handleFileSelect}
        onBpmChange={handleBpmChange}
        onTimingModeChange={handleTimingModeChange}
        onBeatOffsetChange={handleBeatOffsetChange}
        onSeekChange={handleSeekChange}
        onTogglePlayback={togglePlayback}
        onRestart={restartPlayback}
        canPlay={dancePlanner.isConfirmed}
        collapsed={audioPanelCollapsed}
        onToggleCollapsed={() => setAudioPanelCollapsed((collapsed) => !collapsed)}
        cameraMode={cameraMode}
        onCameraModeChange={setCameraMode}
      />

      <DanceSequencePanel
        moves={dancePlanner.danceMoves}
        sequence={dancePlanner.sequence}
        moduleBeats={dancePlanner.moduleBeats}
        activeSlotIndex={dancePlanner.activeSlotIndex}
        isConfirmed={dancePlanner.isConfirmed}
        isPlaying={isPlaying}
        readyForPlanning={dancePlanner.readyForPlanning}
        collapsed={dancePanelCollapsed}
        onMoveChange={dancePlanner.updateMoveAt}
        onRegenerate={dancePlanner.regenerateSequence}
        onUseOriginal={dancePlanner.useOriginalSequence}
        onToggleCollapsed={() => setDancePanelCollapsed((collapsed) => !collapsed)}
        onConfirm={dancePlanner.confirmSequence}
      />

      <div className="bottom-title">VR dance term project</div>

      <Loader />
    </div>
  );
}
