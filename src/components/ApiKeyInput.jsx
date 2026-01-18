import { useState } from 'react';
import { isValidKeyFormat, validateApiKey } from '../lib/anthropic';
import './ApiKeyInput.css';

export function ApiKeyInput({ apiKey, onApiKeyChange, isValid }) {
  const [isEditing, setIsEditing] = useState(!apiKey);
  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const key = inputValue.trim();

    if (!key) {
      setError('Please enter an API key');
      return;
    }

    if (!isValidKeyFormat(key)) {
      setError('Invalid key format. Should start with sk-ant-');
      return;
    }

    setIsValidating(true);
    setError(null);

    const result = await validateApiKey(key);

    setIsValidating(false);

    if (result.valid) {
      onApiKeyChange(key);
      setInputValue('');
      setIsEditing(false);
    } else {
      setError(result.error);
    }
  };

  const handleClear = () => {
    onApiKeyChange(null);
    setIsEditing(true);
    setInputValue('');
    setError(null);
  };

  if (!isEditing && apiKey) {
    return (
      <div className="api-key-display">
        <span className={`api-key-status ${isValid ? 'api-key-status--valid' : ''}`}>
          {isValid ? '✓' : '○'} API Key
        </span>
        <button
          type="button"
          className="api-key-edit"
          onClick={() => setIsEditing(true)}
        >
          Change
        </button>
        <button
          type="button"
          className="api-key-clear"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
    );
  }

  return (
    <form className="api-key-form" onSubmit={handleSubmit}>
      <input
        type="password"
        className={`api-key-input ${error ? 'api-key-input--error' : ''}`}
        placeholder="Enter Anthropic API key (sk-ant-...)"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setError(null);
        }}
        disabled={isValidating}
        autoComplete="off"
      />
      <button
        type="submit"
        className="api-key-submit"
        disabled={isValidating || !inputValue.trim()}
      >
        {isValidating ? 'Validating...' : 'Save'}
      </button>
      {apiKey && (
        <button
          type="button"
          className="api-key-cancel"
          onClick={() => {
            setIsEditing(false);
            setInputValue('');
            setError(null);
          }}
        >
          Cancel
        </button>
      )}
      {error && <p className="api-key-error">{error}</p>}
    </form>
  );
}
