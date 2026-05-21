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
  isReady,
  isPlaying,
  selectedTrackName,
  audioMetrics,
  onFileSelect,
  onBpmChange,
  onTogglePlayback,
  onRestart,
}) {
  const beatInBar = ((audioMetrics.beatIndex % 4) + 4) % 4 + 1;

  return (
    <aside className="overlay-card audio-panel">
      <h2 className="guide-title">Music Sync Lab</h2>
      <p className="guide-text">
        這裡先把音樂播放、BPM、4-beat 計時與舞台反應接起來，讓我們在沒有正式角色前先驗證節奏同步。
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

      <div className="inline-controls">
        <label className="control-label compact">
          <span>BPM</span>
          <input
            className="number-input"
            type="number"
            min="40"
            max="220"
            step="1"
            value={bpm}
            onChange={onBpmChange}
          />
        </label>

        <button
          className="secondary-button"
          onClick={onTogglePlayback}
          disabled={!isReady}
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
          <span className="stat-label">Bass Energy</span>
          <strong className="stat-value">
            {Math.round(audioMetrics.bassEnergy * 100)}%
          </strong>
        </div>
      </div>
    </aside>
  );
}
