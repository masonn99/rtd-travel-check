'use server'

import { askTravelAssistant } from '../lib/ai';

export async function chatWithAI(message: string) {
  if (!message || message.trim().length === 0) {
    return { error: "Message is empty" };
  }

  try {
    const response = await askTravelAssistant(message);
    return { text: response };
  } catch (error) {
    console.error("Chat Action Error:", error);
    return { error: "Failed to connect to AI" };
  }
}
