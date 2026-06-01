'use server'

import { askTravelAssistant } from '../lib/ai'

/**
 * Server action wrapper — keeps the Groq/Gemini SDKs server-side only.
 * Client components (ChatView) call this instead of importing ai.ts directly.
 */
export async function chat(query: string): Promise<string> {
  return askTravelAssistant(query)
}
