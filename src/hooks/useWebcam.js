import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useWebcam() {
  const [stream, setStream] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useLocalStorage('dauber-camera-id', null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);

  // Enumerate available video devices
  const refreshDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);
      return videoDevices;
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
      return [];
    }
  }, []);

  // Start or switch camera stream
  const startStream = useCallback(async (deviceId = null) => {
    setIsLoading(true);
    setError(null);

    // Stop existing stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment', // Prefer back camera on mobile
          ...(deviceId && { deviceId: { exact: deviceId } })
        },
        audio: false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      // Get actual device ID from stream
      const videoTrack = newStream.getVideoTracks()[0];
      const actualDeviceId = videoTrack.getSettings().deviceId;
      setSelectedDeviceId(actualDeviceId);

      // Refresh device list (labels now available after permission)
      await refreshDevices();

      setIsLoading(false);
      return newStream;
    } catch (err) {
      setIsLoading(false);

      if (err.name === 'NotAllowedError') {
        setError({
          type: 'permission',
          message: 'Camera permission denied. Please allow camera access to use Claude Dauber.'
        });
      } else if (err.name === 'NotFoundError') {
        setError({
          type: 'not-found',
          message: 'No camera found. Please connect a camera and refresh.'
        });
      } else if (err.name === 'OverconstrainedError') {
        // Try again without device constraint
        if (deviceId) {
          return startStream(null);
        }
        setError({
          type: 'overconstrained',
          message: 'Could not start camera with requested settings.'
        });
      } else {
        setError({
          type: 'unknown',
          message: `Camera error: ${err.message}`
        });
      }
      return null;
    }
  }, [stream, refreshDevices, setSelectedDeviceId]);

  // Switch to a different camera
  const switchCamera = useCallback(async (deviceId) => {
    return startStream(deviceId);
  }, [startStream]);

  // Initialize on mount
  useEffect(() => {
    // Initial device enumeration
    refreshDevices().then(videoDevices => {
      if (videoDevices.length > 0) {
        // Use stored device if available and still exists
        const storedExists = selectedDeviceId &&
          videoDevices.some(d => d.deviceId === selectedDeviceId);
        startStream(storedExists ? selectedDeviceId : null);
      } else {
        // Try to get stream anyway (will prompt for permission)
        startStream(null);
      }
    });

    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return {
    stream,
    videoRef,
    devices,
    selectedDeviceId,
    switchCamera,
    error,
    isLoading,
    refreshDevices
  };
}
