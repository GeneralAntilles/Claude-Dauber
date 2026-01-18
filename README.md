# Claude Dauber

A simple web app for getting AI feedback on paintings in progress. Point your webcam at your canvas, and Claude acts as a studio companion - not a critic or teacher, but a curious presence who's genuinely interested in your process.

## Features

- **Live webcam feed** with device selection for multiple cameras
- **Manual capture** - click "Get Feedback" or press spacebar to snap the current frame
- **Comparison frames** - select a previous capture to include "before/after" context
- **Touch slider** - three distinct feedback personalities:
  - **Curious**: Observational, asks questions more than gives answers
  - **Balanced**: Mix of observation and gentle suggestion
  - **Direct**: Specific, technical, concrete feedback
- **Session context** - describe what you're working on for more relevant feedback
- **Conversation history** - see all feedback with thumbnails of analyzed frames
- **Frame history** - last 20 captures for reference and comparison

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Usage

1. Enter your Anthropic API key (stored in localStorage)
2. Allow camera access when prompted
3. Point your camera at your canvas
4. Optionally set session context (medium, subject, goals)
5. Click "Get Feedback" or press spacebar
6. Adjust the touch level for different feedback styles

## Tech Stack

- Vite + React
- Vanilla CSS
- Anthropic API (Claude claude-sonnet-4-20250514)
- Client-side only (no backend)

## Privacy

- Your API key is stored in localStorage
- Images are sent directly to Anthropic's API
- No data is stored on any server
