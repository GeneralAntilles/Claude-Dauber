import { useEffect } from 'react';
import './WebcamView.css';

export function WebcamView({
  videoRef,
  devices,
  selectedDeviceId,
  onDeviceChange,
  error,
  isLoading
}) {
  // Handle device selection
  const handleDeviceSelect = (e) => {
    const deviceId = e.target.value;
    if (deviceId && onDeviceChange) {
      onDeviceChange(deviceId);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="webcam-view webcam-view--error">
        <div className="webcam-error">
          <div className="webcam-error-icon">
            {error.type === 'permission' ? '🔒' : '📷'}
          </div>
          <p className="webcam-error-message">{error.message}</p>
          {error.type === 'permission' && (
            <p className="webcam-error-hint">
              Check your browser's camera permissions and refresh the page.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="webcam-view">
      {/* Device selector (only show if multiple cameras) */}
      {devices.length > 1 && (
        <div className="webcam-device-selector">
          <select
            value={selectedDeviceId || ''}
            onChange={handleDeviceSelect}
            className="webcam-device-select"
          >
            {devices.map((device, index) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Video feed */}
      <div className="webcam-video-container">
        {isLoading && (
          <div className="webcam-loading">
            <div className="webcam-loading-spinner" />
            <span>Starting camera...</span>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="webcam-video"
        />
      </div>
    </div>
  );
}
