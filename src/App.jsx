import { useState, useCallback, useEffect } from 'react';
import { useWebcam } from './hooks/useWebcam';
import { useFrameCapture } from './hooks/useFrameCapture';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getFeedback } from './lib/anthropic';
import { WebcamView } from './components/WebcamView';
import { CaptureButton } from './components/CaptureButton';
import { TouchSlider } from './components/TouchSlider';
import { ContextInput } from './components/ContextInput';
import { ResponseDisplay } from './components/ResponseDisplay';
import { FrameHistory } from './components/FrameHistory';
import { ApiKeyInput } from './components/ApiKeyInput';
import './App.css';

function App() {
  // Persistent state
  const [apiKey, setApiKey] = useLocalStorage('dauber-api-key', null);
  const [touchLevel, setTouchLevel] = useLocalStorage('dauber-touch-level', 'balanced');
  const [sessionContext, setSessionContext] = useLocalStorage('dauber-context', '');

  // Webcam
  const {
    videoRef,
    devices,
    selectedDeviceId,
    switchCamera,
    error: webcamError,
    isLoading: webcamLoading
  } = useWebcam();

  // Frame capture
  const {
    frames,
    compareFrameId,
    captureFrame,
    selectCompareFrame,
    getCompareFrame
  } = useFrameCapture();

  // Conversation state
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latestFrameId, setLatestFrameId] = useState(null);

  // Handle feedback request
  const handleGetFeedback = useCallback(async () => {
    if (!apiKey) {
      setError('Please enter your API key first');
      return;
    }

    if (!videoRef.current) {
      setError('Camera not ready');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Capture current frame
    const currentFrame = captureFrame(videoRef.current);
    if (!currentFrame) {
      setError('Failed to capture frame');
      setIsLoading(false);
      return;
    }

    setLatestFrameId(currentFrame.id);

    // Get comparison frame if selected
    const compareFrame = getCompareFrame();

    // Call API
    const result = await getFeedback({
      apiKey,
      currentFrame,
      compareFrame,
      touchLevel,
      sessionContext,
      conversationHistory: history
    });

    setIsLoading(false);

    if (result.success) {
      // Add user message (for history tracking, not displayed)
      const userEntry = {
        role: 'user',
        textContent: 'Get feedback',
        timestamp: new Date()
      };

      // Add assistant response
      const assistantEntry = {
        role: 'assistant',
        content: result.content,
        frameThumb: currentFrame.dataUrl,
        timestamp: new Date()
      };

      setHistory(prev => [...prev, userEntry, assistantEntry]);
    } else {
      setError(result.error);
    }
  }, [apiKey, videoRef, captureFrame, getCompareFrame, touchLevel, sessionContext, history]);

  // Keyboard shortcut (spacebar to capture)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger if not in an input/textarea
      if (e.code === 'Space' &&
          !['INPUT', 'TEXTAREA'].includes(e.target.tagName) &&
          !isLoading &&
          apiKey) {
        e.preventDefault();
        handleGetFeedback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGetFeedback, isLoading, apiKey]);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Claude Dauber</h1>
        <ApiKeyInput
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          isValid={!!apiKey}
        />
      </header>

      <main className="app-main">
        <div className="app-left">
          <WebcamView
            videoRef={videoRef}
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            onDeviceChange={switchCamera}
            error={webcamError}
            isLoading={webcamLoading}
          />

          <CaptureButton
            onClick={handleGetFeedback}
            isLoading={isLoading}
            disabled={!apiKey || webcamError}
          />

          <FrameHistory
            frames={frames}
            compareFrameId={compareFrameId}
            onSelectCompare={selectCompareFrame}
            latestFrameId={latestFrameId}
          />
        </div>

        <div className="app-right">
          <ContextInput
            value={sessionContext}
            onChange={setSessionContext}
          />

          <TouchSlider
            value={touchLevel}
            onChange={setTouchLevel}
          />

          <ResponseDisplay
            history={history}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>

      <footer className="app-footer">
        <span className="app-hint">Press spacebar to capture</span>
      </footer>
    </div>
  );
}

export default App;
