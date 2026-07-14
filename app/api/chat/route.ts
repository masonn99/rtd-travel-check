import { askTravelAssistantStream, type ConversationMessage } from '../../lib/ai'

const HISTORY_WINDOW = 10

export async function POST(req: Request) {
  const { query, history = [] } = await req.json() as {
    query: string
    history: ConversationMessage[]
  }

  if (!query?.trim()) {
    return new Response('Missing query', { status: 400 })
  }

  try {
    const stream = await askTravelAssistantStream(query, history.slice(-HISTORY_WINDOW))
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error('[/api/chat] stream error:', err)
    return new Response("I'm having trouble right now — please try again in a moment.", {
      status: 500,
    })
  }
}
