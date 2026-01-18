import './CaptureButton.css';

export function CaptureButton({ onClick, isLoading, disabled }) {
  return (
    <button
      className={`capture-button ${isLoading ? 'capture-button--loading' : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      type="button"
    >
      {isLoading ? (
        <>
          <span className="capture-button-spinner" />
          <span>Thinking...</span>
        </>
      ) : (
        <>
          <span className="capture-button-icon">📸</span>
          <span>Get Feedback</span>
        </>
      )}
    </button>
  );
}
