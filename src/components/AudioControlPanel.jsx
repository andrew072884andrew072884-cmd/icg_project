function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "00:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function AudioControlPanel({
  bpm,
  manualBpm,
  detectedBpm,
  timingMode,
  beatOffsetMs,
  isReady,
  isPlaying,
  selectedTrackName,
  audioMetrics,
  analysisState,
  analysisError,
  sectionCandidates,
  onFileSelect,
  onBpmChange,
  onTimingModeChange,
  onBeatOffsetChange,
  onSeekChange,
  onTogglePlayback,
  onRestart,
  canPlay = true,
  collapsed,
  onToggleCollapsed,
  cameraMode,
  onCameraModeChange,
}) {
  const beatInBar = ((audioMetrics.beatIndex % 4) + 4) % 4 + 1;
  const analysisLabel =
    analysisState === "analyzing"
      ? "Analyzing beats..."
      : analysisState === "ready"
        ? "Auto beat detection ready"
        : analysisState === "error"
          ? analysisError
          : "Load a track to start analysis";

  return (
    <aside className={`overlay-card audio-panel ${collapsed ? "collapsed-panel" : ""}`}>
      <button
        className="panel-toggle"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? "Expand audio panel" : "Collapse audio panel"}
      >
        {collapsed ? ">" : "<"}
      </button>
      {!collapsed && (
        <>
      <h2 className="guide-title">Music Sync Lab</h2>
      <p className="guide-text">
        Upload a track to auto-detect beat timing, then use the detected beat grid as the simulator's master clock.
      </p>

      <label className="control-label">
        <span>Load music</span>
        <input
          className="file-input"
          type="file"
          accept="audio/*"
          onChange={onFileSelect}
        />
      </label>

      <div className="analysis-banner">{analysisLabel}</div>

      <label className="seek-control">
        <span className="seek-label">Playback Progress</span>
        <input
          className="seek-input"
          type="range"
          min="0"
          max={audioMetrics.duration || 0}
          step="0.01"
          value={audioMetrics.currentTime || 0}
          onChange={onSeekChange}
          disabled={!isReady}
        />
        <span className="seek-meta">
          <span>{formatTime(audioMetrics.currentTime)}</span>
          <span>{formatTime(audioMetrics.duration)}</span>
        </span>
      </label>

      <div className="mode-row">
        <span className="mode-label">BPM</span>
        <button
          className={`secondary-button ${timingMode === "auto" ? "active-toggle" : ""}`}
          onClick={() => onTimingModeChange("auto")}
        >
          Auto
        </button>
        <button
          className={`secondary-button ${timingMode === "manual" ? "active-toggle" : ""}`}
          onClick={() => onTimingModeChange("manual")}
        >
          Manual
        </button>
      </div>

      <div className="mode-row">
        <span className="mode-label">Camera</span>
        <button
          className={`secondary-button ${cameraMode === "auto" ? "active-toggle" : ""}`}
          onClick={() => onCameraModeChange("auto")}
        >
          Auto
        </button>
        <button
          className={`secondary-button ${cameraMode === "manual" ? "active-toggle" : ""}`}
          onClick={() => onCameraModeChange("manual")}
        >
          Manual
        </button>
      </div>

      <div className="inline-controls">
        <label className="control-label compact">
          <span>{timingMode === "auto" ? "Detected BPM" : "Manual BPM"}</span>
          <input
            className="number-input"
            type="number"
            min="40"
            max="220"
            step="1"
            value={timingMode === "auto" ? detectedBpm ?? bpm : manualBpm}
            onChange={onBpmChange}
            disabled={timingMode === "auto"}
          />
        </label>

        <label className="control-label compact">
          <span>Beat Offset (ms)</span>
          <input
            className="number-input"
            type="number"
            min="-2000"
            max="2000"
            step="10"
            value={beatOffsetMs}
            onChange={onBeatOffsetChange}
          />
        </label>

        <button
          className="secondary-button"
          onClick={onTogglePlayback}
          disabled={!isReady || (!isPlaying && !canPlay)}
          title={!canPlay && isReady && !isPlaying ? "Confirm the dance sequence first" : undefined}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          className="secondary-button"
          onClick={onRestart}
          disabled={!isReady}
        >
          Restart
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Track</span>
          <strong className="stat-value truncate-text">
            {selectedTrackName || "No music selected"}
          </strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Time</span>
          <strong className="stat-value">
            {formatTime(audioMetrics.currentTime)} / {formatTime(audioMetrics.duration)}
          </strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Bar / Beat</span>
          <strong className="stat-value">
            {audioMetrics.barIndex + 1} / {beatInBar}
          </strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Mode</span>
          <strong className="stat-value">{timingMode}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Beat Length</span>
          <strong className="stat-value">
            {audioMetrics.beatDuration?.toFixed(3) ?? "0.500"}s
          </strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Bass Energy</span>
          <strong className="stat-value">
            {Math.round(audioMetrics.bassEnergy * 100)}%
          </strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Main Section</span>
          <strong className="stat-value truncate-text">
            {audioMetrics.currentSection?.label || "None"}
          </strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Lighting Cue</span>
          <strong className="stat-value">{audioMetrics.stageCue || "intro"}</strong>
        </div>
      </div>

      <div className="section-list">
        <span className="stat-label">Detected main-section candidates</span>
        {sectionCandidates.length ? (
          sectionCandidates.slice(0, 4).map((section) => (
            <div key={`${section.startTime}-${section.endTime}`} className="section-item">
              <strong>{section.label}</strong>
              <span>
                {formatTime(section.startTime)} - {formatTime(section.endTime)}
              </span>
            </div>
          ))
        ) : (
          <div className="section-item muted">No main-section candidate yet</div>
        )}
      </div>
        </>
      )}
    </aside>
  );
}
