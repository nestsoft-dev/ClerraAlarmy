<<<<<<< HEAD
import { Alarm } from '../types';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export interface VoiceAlarmResult {
  success: boolean;
  alarm?: Partial<Alarm>;
  error?: string;
  transcription?: string;
}

export const aiService = {
  async transcribeAudio(uri: string): Promise<string> {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API Key not found. Please add EXPO_PUBLIC_OPENAI_API_KEY to your .env file.');

    const formData = new FormData();
    // @ts-ignore
    formData.append('file', {
      uri,
      name: 'audio.m4a',
      type: 'audio/m4a',
    });
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Transcription failed');
    }

    const data = await response.json();
    return data.text;
  },

  async parseAlarmIntent(text: string): Promise<Partial<Alarm>> {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API Key not found.');

    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentContext = `
      Current Time: ${now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
      Current Date: ${now.toDateString()}
      Current Day of Week: ${days[now.getDay()]}
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using gpt-4o-mini for better structured output and tool efficiency
        messages: [
          { 
            role: 'system', 
            content: `You are a highly precise Temporal AI Assistant for an alarm app.
            
            Current Time Context:
            - Time: ${now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            - Date: ${now.toDateString()}
            - Weekday: ${days[now.getDay()]} (0=Sunday, 1=Monday, ..., 6=Saturday)

            TEMPORAL RULES:
            1. PAST CHECK: If the user specifies a time (e.g., "8 AM") that has already passed today, and no day is specified, set it for TOMORROW.
            2. RECURRING vs ONE-TIME: 
               - "Every [Day]", "Weekdays", "Daily" -> Use repeatDays [0-6] appropriately.
               - "Tomorrow", "Next Friday", "In 5 minutes", "At 8 AM" (as a one-off) -> set repeatDays to empty array [] (indicates one-time).
            3. RELATIVE DURATIONS: If the user says "in X minutes/hours", calculate the exact target time (HH:mm) from the Current Time Context.
            4. SPECIFIC DAYS: If the user says "on Saturday", set it for the upcoming Saturday. If they say "Every Saturday", use repeatDays: [6].
            
            ALWAYS:
            - Set "enabled" to true for every new alarm.
                        
            Always prioritize the nearest logical occurrence.`
          },
          { role: 'user', content: text }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'create_alarm',
              description: 'Create a new alarm with the specified parameters',
              parameters: {
                type: 'object',
                properties: {
                  time: {
                    type: 'string',
                    description: 'The time in 24-hour format (HH:mm)'
                  },
                  repeatDays: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Array of days to repeat (0 for Sunday, 1 for Monday, ..., 6 for Saturday)'
                  },
                  label: {
                    type: 'string',
                    description: 'A short descriptive label for the alarm'
                  },
                  disciplineMode: {
                    type: 'boolean',
                    description: 'Whether discipline mode is enabled (default true)'
                  },
                  enabled: {
                    type: 'boolean',
                    description: 'Whether the alarm is currently active (default true)'
                  }
                },
                required: ['time', 'repeatDays', 'label', 'enabled']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'create_alarm' } },
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Parsing failed');
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls[0];
    if (!toolCall) throw new Error('AI could not determine alarm details.');
    
    return JSON.parse(toolCall.function.arguments);
  },

  async processVoiceCommand(uri: string): Promise<VoiceAlarmResult> {
    try {
      // Create a timeout controller to prevent indefinite hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      try {
        const transcription = await this.transcribeAudio(uri);
        const alarmData = await this.parseAlarmIntent(transcription);
        clearTimeout(timeoutId);
        
        return {
          success: true,
          alarm: {
            ...alarmData,
            soundId: 'alarm_clock',  // default sound for voice-created alarms
            volume: 1.0,
          },
          transcription
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'The request timed out. Please check your internet connection and try again.';
      } else if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('API Key not found')) {
        errorMessage = 'OpenAI API Key is missing. Please check your configuration.';
      } else {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  async verifyColorInImage(base64Image: string, targetColor: string): Promise<boolean> {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API Key not found.');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an objective vision AI resolving a morning wake-up challenge. Respond ONLY with YES or NO. Does this photo prominently feature one or more objects that are primarily the color requested?'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Target Color: ${targetColor}` },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'low' } }
            ]
          }
        ],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze photo.');
    }

    const data = await response.json();
    const answer = data.choices[0].message.content.trim().toUpperCase();
    return answer === 'YES' || answer.includes('YES');
  },

  async verifyObjectInImage(base64Image: string, targetDescription: string): Promise<boolean> {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API Key not found.');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an objective vision AI resolving a morning wake-up challenge. Respond ONLY with YES or NO. Does this photo clearly fulfill the following visual requirement?'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Requirement: ${targetDescription}` },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'low' } }
            ]
          }
        ],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze photo.');
    }

    const data = await response.json();
    const answer = data.choices[0].message.content.trim().toUpperCase();
    return answer === 'YES' || answer.includes('YES');
  }
};
=======
import { Alarm } from '../types';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export interface VoiceAlarmResult {
  success: boolean;
  alarm?: Partial<Alarm>;
  error?: string;
  transcription?: string;
}

export const aiService = {
  async transcribeAudio(uri: string): Promise<string> {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API Key not found. Please add EXPO_PUBLIC_OPENAI_API_KEY to your .env file.');

    const formData = new FormData();
    // @ts-ignore
    formData.append('file', {
      uri,
      name: 'audio.m4a',
      type: 'audio/m4a',
    });
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Transcription failed');
    }

    const data = await response.json();
    return data.text;
  },

  async parseAlarmIntent(text: string): Promise<Partial<Alarm>> {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API Key not found.');

    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentContext = `
      Current Time: ${now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
      Current Date: ${now.toDateString()}
      Current Day of Week: ${days[now.getDay()]}
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using gpt-4o-mini for better structured output and tool efficiency
        messages: [
          { 
            role: 'system', 
            content: `You are a highly precise Temporal AI Assistant for an alarm app.
            
            Current Time Context:
            - Time: ${now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            - Date: ${now.toDateString()}
            - Weekday: ${days[now.getDay()]} (0=Sunday, 1=Monday, ..., 6=Saturday)

            TEMPORAL RULES:
            1. PAST CHECK: If the user specifies a time (e.g., "8 AM") that has already passed today, and no day is specified, set it for TOMORROW.
            2. RECURRING vs ONE-TIME: 
               - "Every [Day]", "Weekdays", "Daily" -> Use repeatDays [0-6] appropriately.
               - "Tomorrow", "Next Friday", "In 5 minutes", "At 8 AM" (as a one-off) -> set repeatDays to empty array [] (indicates one-time).
            3. RELATIVE DURATIONS: If the user says "in X minutes/hours", calculate the exact target time (HH:mm) from the Current Time Context.
            4. SPECIFIC DAYS: If the user says "on Saturday", set it for the upcoming Saturday. If they say "Every Saturday", use repeatDays: [6].
            
            ALWAYS:
            - Set "enabled" to true for every new alarm.
                        
            Always prioritize the nearest logical occurrence.`
          },
          { role: 'user', content: text }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'create_alarm',
              description: 'Create a new alarm with the specified parameters',
              parameters: {
                type: 'object',
                properties: {
                  time: {
                    type: 'string',
                    description: 'The time in 24-hour format (HH:mm)'
                  },
                  repeatDays: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Array of days to repeat (0 for Sunday, 1 for Monday, ..., 6 for Saturday)'
                  },
                  label: {
                    type: 'string',
                    description: 'A short descriptive label for the alarm'
                  },
                  disciplineMode: {
                    type: 'boolean',
                    description: 'Whether discipline mode is enabled (default true)'
                  },
                  enabled: {
                    type: 'boolean',
                    description: 'Whether the alarm is currently active (default true)'
                  }
                },
                required: ['time', 'repeatDays', 'label', 'enabled']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'create_alarm' } },
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Parsing failed');
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls[0];
    if (!toolCall) throw new Error('AI could not determine alarm details.');
    
    return JSON.parse(toolCall.function.arguments);
  },

  async processVoiceCommand(uri: string): Promise<VoiceAlarmResult> {
    try {
      // Create a timeout controller to prevent indefinite hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      try {
        const transcription = await this.transcribeAudio(uri);
        const alarmData = await this.parseAlarmIntent(transcription);
        clearTimeout(timeoutId);
        
        return {
          success: true,
          alarm: {
            ...alarmData,
            soundId: 'alarm_clock',  // default sound for voice-created alarms
            volume: 1.0,
          },
          transcription
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'The request timed out. Please check your internet connection and try again.';
      } else if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('API Key not found')) {
        errorMessage = 'OpenAI API Key is missing. Please check your configuration.';
      } else {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  async verifyColorInImage(base64Image: string, targetColor: string): Promise<boolean> {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API Key not found.');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an objective vision AI resolving a morning wake-up challenge. Respond ONLY with YES or NO. Does this photo prominently feature one or more objects that are primarily the color requested?'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Target Color: ${targetColor}` },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'low' } }
            ]
          }
        ],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze photo.');
    }

    const data = await response.json();
    const answer = data.choices[0].message.content.trim().toUpperCase();
    return answer === 'YES' || answer.includes('YES');
  },

  async verifyObjectInImage(base64Image: string, targetDescription: string): Promise<boolean> {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API Key not found.');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an objective vision AI resolving a morning wake-up challenge. Respond ONLY with YES or NO. Does this photo clearly fulfill the following visual requirement?'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Requirement: ${targetDescription}` },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'low' } }
            ]
          }
        ],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze photo.');
    }

    const data = await response.json();
    const answer = data.choices[0].message.content.trim().toUpperCase();
    return answer === 'YES' || answer.includes('YES');
  }
};
>>>>>>> origin/main
