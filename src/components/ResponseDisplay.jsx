import { useEffect, useRef } from 'react';
import './ResponseDisplay.css';

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function ResponseDisplay({ history, isLoading, error }) {
  const containerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  if (history.length === 0 && !isLoading && !error) {
    return (
      <div className="response-display response-display--empty">
        <div className="response-empty">
          <p className="response-empty-text">
            Point your camera at your canvas and click "Get Feedback" when you want a fresh perspective.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="response-display" ref={containerRef}>
      {history.map((entry, index) => (
        <div key={index} className="response-entry">
          {entry.role === 'assistant' && (
            <>
              <div className="response-header">
                <img
                  src={entry.frameThumb}
                  alt="Captured frame"
                  className="response-thumb"
                />
                <span className="response-time">{formatTime(entry.timestamp)}</span>
              </div>
              <div className="response-content">{entry.content}</div>
            </>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="response-entry response-entry--loading">
          <div className="response-thinking">
            <span className="response-thinking-dot" />
            <span className="response-thinking-dot" />
            <span className="response-thinking-dot" />
          </div>
        </div>
      )}

      {error && (
        <div className="response-entry response-entry--error">
          <div className="response-error">
            <span className="response-error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
