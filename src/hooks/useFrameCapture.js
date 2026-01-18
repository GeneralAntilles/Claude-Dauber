import { useState, useCallback, useRef } from 'react';

const MAX_FRAMES = 20;
const JPEG_QUALITY = 0.85;
const MAX_DIMENSION = 1280;

export function useFrameCapture() {
  const [frames, setFrames] = useState([]);
  const [compareFrameId, setCompareFrameId] = useState(null);
  const canvasRef = useRef(null);

  // Capture a frame from video element
  const captureFrame = useCallback((videoElement) => {
    if (!videoElement || !videoElement.videoWidth) {
      console.warn('Video element not ready for capture');
      return null;
    }

    // Create canvas if needed
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Calculate dimensions (scale down if needed)
    let width = videoElement.videoWidth;
    let height = videoElement.videoHeight;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    canvas.width = width;
    canvas.height = height;

    // Draw video frame to canvas
    ctx.drawImage(videoElement, 0, 0, width, height);

    // Convert to base64 JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

    const frame = {
      id: `frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dataUrl,
      timestamp: new Date(),
      width,
      height
    };

    // Add to frames array (newest first, cap at MAX_FRAMES)
    setFrames(prev => {
      const updated = [frame, ...prev].slice(0, MAX_FRAMES);
      return updated;
    });

    return frame;
  }, []);

  // Select a frame for comparison
  const selectCompareFrame = useCallback((frameId) => {
    setCompareFrameId(prev => prev === frameId ? null : frameId);
  }, []);

  // Get the comparison frame object
  const getCompareFrame = useCallback(() => {
    if (!compareFrameId) return null;
    return frames.find(f => f.id === compareFrameId) || null;
  }, [compareFrameId, frames]);

  // Clear comparison selection
  const clearCompare = useCallback(() => {
    setCompareFrameId(null);
  }, []);

  // Clear all frames
  const clearAllFrames = useCallback(() => {
    setFrames([]);
    setCompareFrameId(null);
  }, []);

  // Get base64 data without the data URL prefix (for API)
  const getBase64Data = useCallback((dataUrl) => {
    return dataUrl.replace(/^data:image\/\w+;base64,/, '');
  }, []);

  return {
    frames,
    compareFrameId,
    captureFrame,
    selectCompareFrame,
    getCompareFrame,
    clearCompare,
    clearAllFrames,
    getBase64Data
  };
}
