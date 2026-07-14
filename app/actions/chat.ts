'use server'

import { askTravelAssistant, type ConversationMessage } from '../lib/ai'

export async function chat(query: string, history: ConversationMessage[] = []): Promise<string> {
  return askTravelAssistant(query, history)
}
