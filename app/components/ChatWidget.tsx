'use client'

import { useState, useRef, useEffect } from 'react'
import { askTravelAssistant } from '../lib/ai'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant'
  text: string
}

// ─── Suggested prompts shown when chat is empty ────────────────────────────────

const SUGGESTIONS = [
  'Is Japan visa-free for RTD holders?',
  'Can I enter Thailand with an RTD?',
  'What countries are visa-free with RTD?',
  'Do I need a visa for Canada with RTD?',
]

// ─── Single message bubble ─────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      )}
      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-blue-600 text-white rounded-tr-sm'
          : 'bg-zinc-800/80 text-zinc-200 rounded-tl-sm'
      }`}>
        {msg.text}
      </div>
    </div>
  )
}

// ─── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div className="bg-zinc-800/80 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main widget ───────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)

    try {
      const answer = await askTravelAssistant(q)
      setMessages(prev => [...prev, { role: 'assistant', text: answer }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "Sorry, I couldn't get an answer right now. Please try again in a moment."
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm flex flex-col bg-zinc-950 border border-zinc-800/70 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-slideUp">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-600/40">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">RTD Assistant</p>
                <p className="text-[10px] text-zinc-500">Powered by community data</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[400px]">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 text-center">
                  Ask anything about RTD travel requirements — I'll check official policies and community stories.
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl text-xs text-zinc-300 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
                {loading && <TypingIndicator />}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-zinc-800/60 bg-zinc-900/50">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about any country…"
                disabled={loading}
                className="flex-1 px-3 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 mt-1.5 text-center">
              Based on {' '}
              <span className="text-zinc-500">community stories</span>
              {' '}+{' '}
              <span className="text-zinc-500">official visa data</span>
              . Always verify before travel.
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-[88px] right-4 md:bottom-6 md:right-6 z-50 w-12 h-12 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
          open
            ? 'bg-zinc-700 shadow-zinc-900/50 rotate-90'
            : 'bg-blue-600 shadow-blue-600/40 hover:bg-blue-500 hover:scale-105'
        }`}
        aria-label="Open RTD Assistant"
      >
        {open ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </button>
    </>
  )
}
