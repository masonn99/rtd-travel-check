'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatIcon, ChevronIcon } from './Icons'
import ChatMarkdown from './ChatMarkdown'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

const SUGGESTIONS = [
  'Is Japan visa-free for RTD holders?',
  'What do I need to enter Thailand with an RTD?',
  'Which countries are easiest to visit with an RTD?',
  'Can I visit Canada with a Refugee Travel Document?',
]

const Avatar = () => (
  <div className="w-8 h-8 rounded-full bg-accent text-accent-ink flex items-center justify-center flex-none" aria-hidden="true">
    <ChatIcon className="w-[18px] h-[18px]" />
  </div>
)

function Bubble({ msg, isStreaming }: { msg: Message; isStreaming?: boolean }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <Avatar />}
      <div
        className={`max-w-[85%] sm:max-w-[72%] px-3.5 py-2.5 rounded-[18px] text-[15px] leading-relaxed ${
          isUser ? 'whitespace-pre-line bg-accent text-accent-ink rounded-br-[6px]' : 'bg-surface text-ink border border-line/70 rounded-bl-[6px]'
        }`}
      >
        <span className="sr-only">{isUser ? 'You: ' : 'Assistant: '}</span>
        {isUser ? msg.text : <ChatMarkdown text={msg.text} />}
        {isStreaming && (
          <span className="inline-block w-[2px] h-[1em] bg-accent ml-0.5 align-[-0.15em] animate-pulse" aria-hidden="true" />
        )}
      </div>
    </div>
  )
}

function Typing() {
  return (
    <div className="flex gap-2.5" role="status" aria-label="Assistant is answering">
      <Avatar />
      <div className="bg-surface border border-line/70 rounded-[18px] rounded-bl-[6px] px-4 py-3.5 flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1.5 h-1.5 bg-ink-3 rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
        ))}
      </div>
    </div>
  )
}

const FAILURE = "I couldn't get an answer just now. Try again in a moment, or check the Directory for the official rule."

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  const busy = loading || streaming

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || busy) return

    // Snapshot history BEFORE adding the new user message
    const history = messages
    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', text: q }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, history }),
      })
      if (!res.ok || !res.body) throw new Error('Stream failed')

      // Add an empty assistant bubble and fill it chunk by chunk
      setMessages(prev => [...prev, { role: 'assistant', text: '' }])
      setLoading(false)
      setStreaming(true)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages(prev => {
          const last = prev[prev.length - 1]
          return [...prev.slice(0, -1), { ...last, text: last.text + chunk }]
        })
      }
      setStreaming(false)
    } catch {
      setLoading(false)
      setStreaming(false)
      setMessages(prev => {
        const last = prev[prev.length - 1]
        // Replace an empty streaming bubble rather than leaving it blank
        if (last && last.role === 'assistant' && !last.text) {
          return [...prev.slice(0, -1), { role: 'assistant', text: FAILURE }]
        }
        return [...prev, { role: 'assistant', text: FAILURE }]
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 flex flex-col h-[calc(100dvh-56px-56px-env(safe-area-inset-bottom)-1rem)] md:h-[calc(100dvh-56px-2rem)]">
      <div className="flex-none">
        <h1 className="text-[28px] md:text-[34px] leading-tight font-bold tracking-[-0.025em] text-ink">AI Chat</h1>
        <p className="text-[15px] text-ink-2 mt-1 max-w-[60ch]">
          Answers from this site only: the official rule first, then what holders reported.
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto mt-5 pb-4 space-y-3" aria-live="polite">
        {messages.length === 0 ? (
          <div>
            <p className="text-[13px] font-semibold text-ink-2 mb-2 px-1">Try asking</p>
            <ul className="bg-surface rounded-xl border border-line/70 overflow-hidden">
              {SUGGESTIONS.map((s, i) => (
                <li key={s} className="relative">
                  {i > 0 && <span aria-hidden="true" className="absolute top-0 left-4 right-0 h-px bg-line" />}
                  <button
                    onClick={() => send(s)}
                    className="w-full flex items-center justify-between gap-3 px-4 min-h-[52px] py-3 text-left text-[15px] text-ink hover:bg-fill/50 active:bg-fill transition-colors"
                  >
                    {s}
                    <ChevronIcon className="w-3.5 h-3.5 text-ink-3 flex-none" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <Bubble key={i} msg={msg} isStreaming={streaming && i === messages.length - 1 && msg.role === 'assistant'} />
            ))}
            {loading && <Typing />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex-none pt-3 pb-2 border-t border-line"
        onSubmit={e => { e.preventDefault(); send(input) }}
      >
        <div className="flex gap-2">
          <label className="flex-1">
            <span className="sr-only">Your question</span>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about a country or visa rule"
              disabled={busy}
              enterKeyHint="send"
              className="w-full h-11 px-4 rounded-full bg-surface border border-line text-[16px] text-ink placeholder:text-ink-3 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60"
            />
          </label>
          <button
            type="submit"
            disabled={!input.trim() || busy}
            className="h-11 px-5 rounded-full bg-accent text-accent-ink text-[15px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ask
          </button>
        </div>
        <p className="text-[12px] text-ink-3 mt-2 text-center">
          AI answers can be wrong. Always verify with the embassy before you travel.
        </p>
      </form>
    </div>
  )
}
