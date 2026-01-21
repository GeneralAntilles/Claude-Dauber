import { buildSystemPrompt, buildUserContent } from './prompts';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 1024;

// Validate API key format
export function isValidKeyFormat(key) {
  return typeof key === 'string' && key.startsWith('sk-ant-') && key.length > 20;
}

// Test API key with minimal request
export async function validateApiKey(apiKey) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say "ok"' }]
      })
    });

    if (response.ok) {
      return { valid: true };
    }

    const error = await response.json().catch(() => ({}));

    if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' };
    }

    if (response.status === 429) {
      // Rate limited but key is valid
      return { valid: true };
    }

    return {
      valid: false,
      error: error.error?.message || `API error (${response.status})`
    };
  } catch (err) {
    return {
      valid: false,
      error: `Connection error: ${err.message}`
    };
  }
}

// Get feedback on a frame
export async function getFeedback({
  apiKey,
  currentFrame,
  compareFrame = null,
  touchLevel = 'balanced',
  sessionContext = '',
  conversationHistory = [],
  userMessage = null
}) {
  const systemPrompt = buildSystemPrompt({ touchLevel, sessionContext });

  // Build messages array with history (last 10 exchanges max)
  const messages = [];

  // Add recent history (pairs of user/assistant)
  const recentHistory = conversationHistory.slice(-20); // Last 10 exchanges = 20 messages
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role,
      content: msg.role === 'user' ? [{ type: 'text', text: msg.textContent || 'Get feedback' }] : msg.content
    });
  }

  // Add current request
  if (userMessage) {
    // Follow-up: text message with reference to recent frame for context
    const userContent = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: currentFrame.dataUrl.replace(/^data:image\/\w+;base64,/, '')
        }
      },
      {
        type: 'text',
        text: userMessage
      }
    ];
    messages.push({
      role: 'user',
      content: userContent
    });
  } else {
    // Initial feedback request
    const userContent = buildUserContent({ currentFrame, compareFrame });
    messages.push({
      role: 'user',
      content: userContent
    });
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your key and try again.');
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        throw new Error(`Rate limited. ${retryAfter ? `Try again in ${retryAfter} seconds.` : 'Please wait a moment.'}`);
      }

      if (response.status === 400) {
        throw new Error(error.error?.message || 'Invalid request');
      }

      throw new Error(error.error?.message || `API error (${response.status})`);
    }

    const data = await response.json();

    // Extract text content from response
    const textContent = data.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n\n');

    return {
      success: true,
      content: textContent,
      usage: data.usage
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}
