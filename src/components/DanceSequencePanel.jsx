function formatSlotTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function DanceSequencePanel({
  moves,
  sequence,
  moduleBeats,
  activeSlotIndex,
  isConfirmed,
  isPlaying,
  readyForPlanning,
  collapsed,
  onMoveChange,
  onRegenerate,
  onUseOriginal,
  onToggleCollapsed,
  onConfirm,
}) {
  if (!readyForPlanning || sequence.length === 0) {
    return null;
  }

  const locked = isPlaying;

  return (
    <section className={`dance-sequence-panel ${collapsed ? "collapsed-dance-panel" : ""}`}>
      <div className="dance-panel-header">
        <div>
          <h2 className="dance-panel-title">Dance Sequence Builder</h2>
          <p className="dance-panel-note">
            {sequence.length} modules / {moduleBeats}-beat phrases /{" "}
            {locked ? "Pause music to edit" : "Edit the order, then confirm to unlock Play"}
          </p>
        </div>
        <div className="dance-panel-controls">
          <button
            className="dance-collapse-button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand dance sequence panel" : "Collapse dance sequence panel"}
          >
            {collapsed ? "Sequence ↑" : "Sequence ↓"}
          </button>
          <div className="dance-panel-actions">
            <button className="secondary-button" onClick={onRegenerate} disabled={locked}>
              Recommend
            </button>
            <button className="secondary-button" onClick={onUseOriginal} disabled={locked}>
              Original
            </button>
            <button
              className={`secondary-button ${isConfirmed ? "active-toggle" : ""}`}
              onClick={onConfirm}
              disabled={locked || isConfirmed}
            >
              {isConfirmed ? "Confirmed" : "Confirm"}
            </button>
          </div>
        </div>
      </div>

      <div className="dance-panel-body">
        <div className="dance-sequence-grid" aria-label="Dance move sequence">
          {sequence.map((slot) => (
            <label
              key={slot.id}
              className={`dance-slot ${slot.index === activeSlotIndex ? "active-dance-slot" : ""}`}
            >
              <span className="dance-slot-index">#{slot.index + 1}</span>
              <span className="dance-slot-time">{formatSlotTime(slot.startTime)}</span>
              <select
                value={slot.moveId}
                onChange={(event) => onMoveChange(slot.index, event.target.value)}
                disabled={locked}
              >
                {moves.map((move) => (
                  <option key={move.id} value={move.id}>
                    {move.shortLabel} - {move.categoryLabel}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
