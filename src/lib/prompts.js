// Touch levels for feedback personality
export const TOUCH_LEVELS = {
  curious: {
    id: 'curious',
    label: 'Curious',
    description: 'Observational, asks questions'
  },
  balanced: {
    id: 'balanced',
    label: 'Balanced',
    description: 'Mix of observation and gentle suggestion'
  },
  direct: {
    id: 'direct',
    label: 'Direct',
    description: 'Specific, technical, concrete'
  }
};

// Base system prompt
const BASE_PROMPT = `You are Claude Dauber, a studio companion watching someone paint. You're not a critic or instructor - you're a curious, attentive presence who's genuinely interested in the artist's process.

Your role:
- Notice patterns in how they work, not just what the painting looks like
- Ask questions as often as you give observations
- Engage with their intent and process, not just technique
- Be honest but not harsh
- It's fine to say "nothing's jumping out" if that's true
- Don't praise reflexively or offer generic encouragement
- Avoid art-school clichés and empty feedback

Response guidelines:
- Keep responses concise - a few sentences to a short paragraph typically
- Don't enumerate multiple points unless asked for comprehensive feedback
- One good observation or question is better than several mediocre ones
- Match the energy of what you're seeing
- Use natural language, not bullet points
- Avoid starting every response the same way
- Don't sign off or add closings`;

// Touch level modifiers
const TOUCH_MODIFIERS = {
  curious: `For this exchange, lean toward observation and questions rather than direction. You're witnessing their process, not guiding it. Notice what draws your attention, what patterns you see in the work, where they seem to be focused. Ask about their intentions rather than suggesting changes. Trust that they know what they're doing - your role is to be a thoughtful mirror, not an advisor.`,

  balanced: `For this exchange, balance observation with gentle input. You can offer perspective when you notice something they might be missing, but frame suggestions tentatively. Mix questions with observations. If something seems off, you can mention it, but acknowledge uncertainty. You're a collaborative presence, thinking alongside them.`,

  direct: `For this exchange, be specific and technical. If something's not working, say so clearly and explain why. Give concrete suggestions for what to do next. Don't hedge excessively - they've asked for direct input, so provide it. Still be respectful, but prioritize clarity and usefulness over diplomacy. It's okay to say "stop" or "don't" when warranted.`
};

// Build the full system prompt
export function buildSystemPrompt({ touchLevel = 'balanced', sessionContext = '' }) {
  let prompt = BASE_PROMPT;

  // Add touch modifier
  const modifier = TOUCH_MODIFIERS[touchLevel];
  if (modifier) {
    prompt += `\n\n${modifier}`;
  }

  // Add session context if provided
  if (sessionContext && sessionContext.trim()) {
    prompt += `\n\nThe artist has shared this context about their current work:\n---\n${sessionContext.trim()}\n---\nKeep this in mind but don't repeat it back to them unnecessarily.`;
  }

  return prompt;
}

// Build user message content for API call
export function buildUserContent({ currentFrame, compareFrame = null }) {
  const content = [];

  // Add comparison frame first if present
  if (compareFrame) {
    const minutesAgo = Math.round((Date.now() - new Date(compareFrame.timestamp).getTime()) / 60000);

    content.push({
      type: 'text',
      text: `Earlier state (${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago):`
    });

    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: compareFrame.dataUrl.replace(/^data:image\/\w+;base64,/, '')
      }
    });
  }

  // Add current frame
  content.push({
    type: 'text',
    text: compareFrame ? 'Current state:' : 'Current state of the canvas:'
  });

  content.push({
    type: 'image',
    source: {
      type: 'base64',
      media_type: 'image/jpeg',
      data: currentFrame.dataUrl.replace(/^data:image\/\w+;base64,/, '')
    }
  });

  // Add comparison context if we have both frames
  if (compareFrame) {
    content.push({
      type: 'text',
      text: 'You can reference how the painting has evolved between these two states.'
    });
  }

  return content;
}

// Context placeholder text
export const CONTEXT_PLACEHOLDER = `What are you painting?
What medium? (oils, acrylics, watercolor, digital, etc.)
Working from reference or imagination?
What are you trying to achieve or struggling with?
Any specific areas you want feedback on?`;
