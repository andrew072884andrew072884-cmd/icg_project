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
  onUseOriginalPuppet,
  onToggleCollapsed,
  onConfirm,
}) {
  const locked = isPlaying;
  const canEditSequence = readyForPlanning && sequence.length > 0;

  return (
    <section className={`dance-sequence-panel ${collapsed ? "collapsed-dance-panel" : ""}`}>
      <div className="dance-panel-header">
        <div>
          <h2 className="dance-panel-title">Dance Sequence Builder</h2>
          <p className="dance-panel-note">
            {canEditSequence
              ? `${sequence.length} modules / beat-synced phrases / ${
                  locked ? "Pause music to edit" : "Edit the order, then confirm to unlock Play"
                }`
              : "Load music first, or press Original / Original Puppet to load the legacy dance.mp3 demo"}
          </p>
        </div>
        <div className="dance-panel-controls">
          <button
            className="dance-collapse-button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand dance sequence panel" : "Collapse dance sequence panel"}
          >
            {collapsed ? "Sequence ^" : "Sequence v"}
          </button>
          <div className="dance-panel-actions">
            <button
              className="secondary-button"
              onClick={onRegenerate}
              disabled={locked || !readyForPlanning}
            >
              Recommend
            </button>
            <button className="secondary-button" onClick={onUseOriginal} disabled={locked}>
              Original
            </button>
            <button className="secondary-button" onClick={onUseOriginalPuppet} disabled={locked}>
              Original Puppet
            </button>
            <button
              className={`secondary-button ${isConfirmed ? "active-toggle" : ""}`}
              onClick={onConfirm}
              disabled={locked || isConfirmed || sequence.length === 0}
            >
              {isConfirmed ? "Confirmed" : "Confirm"}
            </button>
          </div>
        </div>
      </div>

      <div className="dance-panel-body">
        {sequence.length > 0 ? (
          <div className="dance-sequence-grid" aria-label="Dance move sequence">
            {sequence.map((slot) => (
              <label
                key={slot.id}
                className={`dance-slot ${slot.index === activeSlotIndex ? "active-dance-slot" : ""}`}
              >
                <span className="dance-slot-index">#{slot.index + 1}</span>
                <span className="dance-slot-time">
                  {formatSlotTime(slot.startTime)} · {slot.beatSpan ?? moduleBeats} beats
                </span>
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
        ) : (
          <div className="dance-sequence-empty">
            Original loads the old block dancers; Original Puppet maps the same legacy keyframes onto imported characters.
          </div>
        )}
      </div>
    </section>
  );
}
