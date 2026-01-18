import './FrameHistory.css';

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function FrameHistory({
  frames,
  compareFrameId,
  onSelectCompare,
  latestFrameId
}) {
  if (frames.length === 0) {
    return (
      <div className="frame-history frame-history--empty">
        <p>Captured frames will appear here</p>
      </div>
    );
  }

  return (
    <div className="frame-history">
      <div className="frame-history-header">
        <span className="frame-history-title">Captures</span>
        {compareFrameId && (
          <button
            type="button"
            className="frame-history-clear-compare"
            onClick={() => onSelectCompare(null)}
          >
            Clear compare
          </button>
        )}
      </div>
      <div className="frame-history-strip">
        {frames.map((frame) => {
          const isCompare = frame.id === compareFrameId;
          const isLatest = frame.id === latestFrameId;

          return (
            <button
              key={frame.id}
              type="button"
              className={`frame-history-thumb ${isCompare ? 'frame-history-thumb--compare' : ''} ${isLatest ? 'frame-history-thumb--latest' : ''}`}
              onClick={() => onSelectCompare(frame.id)}
              title={isCompare ? 'Selected for comparison' : 'Click to compare'}
            >
              <img src={frame.dataUrl} alt={`Capture at ${formatTime(frame.timestamp)}`} />
              <span className="frame-history-time">{formatTime(frame.timestamp)}</span>
              {isCompare && <span className="frame-history-badge">Compare</span>}
              {isLatest && !isCompare && <span className="frame-history-badge frame-history-badge--latest">Latest</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
