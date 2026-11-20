'use server'

import { askTravelAssistant, type ConversationMessage } from '../lib/ai'

const HISTORY_WINDOW = 10

export async function chat(query: string, history: ConversationMessage[] = []): Promise<string> {
  return askTravelAssistant(query, history.slice(-HISTORY_WINDOW))
}
