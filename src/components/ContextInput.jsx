import { useState } from 'react';
import { CONTEXT_PLACEHOLDER } from '../lib/prompts';
import './ContextInput.css';

export function ContextInput({ value, onChange }) {
  const [isCollapsed, setIsCollapsed] = useState(value && value.trim().length > 0);

  const hasContent = value && value.trim().length > 0;

  return (
    <div className={`context-input ${isCollapsed ? 'context-input--collapsed' : ''}`}>
      <button
        type="button"
        className="context-input-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className="context-input-title">
          Session Context
          {hasContent && isCollapsed && (
            <span className="context-input-indicator">Set</span>
          )}
        </span>
        <span className={`context-input-chevron ${isCollapsed ? '' : 'context-input-chevron--open'}`}>
          ▼
        </span>
      </button>

      {!isCollapsed && (
        <div className="context-input-body">
          <textarea
            className="context-input-textarea"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={CONTEXT_PLACEHOLDER}
            rows={6}
          />
          <p className="context-input-hint">
            This context is included with every feedback request.
          </p>
        </div>
      )}
    </div>
  );
}
