import { TOUCH_LEVELS } from '../lib/prompts';
import './TouchSlider.css';

const levels = Object.values(TOUCH_LEVELS);

export function TouchSlider({ value, onChange }) {
  return (
    <div className="touch-slider">
      <label className="touch-slider-label">Touch</label>
      <div className="touch-slider-options">
        {levels.map((level) => (
          <button
            key={level.id}
            type="button"
            className={`touch-slider-option ${value === level.id ? 'touch-slider-option--active' : ''}`}
            onClick={() => onChange(level.id)}
            title={level.description}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}
