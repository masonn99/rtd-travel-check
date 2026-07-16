'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

const SUGGESTIONS = [
  { icon: '🇯🇵', text: 'Is Japan visa-free for RTD holders?' },
  { icon: '🇹🇭', text: 'What do I need to enter Thailand with an RTD?' },
  { icon: '🌍', text: 'Which countries are easiest to visit with RTD?' },
  { icon: '🇨🇦', text: 'Can I visit Canada with a Refugee Travel Document?' },
]

function Bubble({ msg, isStreaming }: { msg: Message; isStreaming?: boolean }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 animate-glow-pulse">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      )}
      <div className={`max-w-[75%] sm:max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-blue-600 text-white rounded-tr-sm'
          : 'bg-zinc-800/70 text-zinc-100 rounded-tl-sm border border-zinc-700/40'
      }`}>
        {msg.text}
        {isStreaming && (
          <span className="inline-block w-0.5 h-3.5 bg-blue-400 ml-0.5 align-middle animate-cursor-blink" />
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-600/30">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div className="bg-zinc-800/70 border border-zinc-700/40 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  )
}

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || loading) return

    // Snapshot history BEFORE adding the new user message
    const history = messages
    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user' as const, text: q }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, history }),
      })

      if (!res.ok || !res.body) throw new Error('Stream failed')

      // Add an empty assistant bubble — we'll fill it chunk by chunk
      setMessages(prev => [...prev, { role: 'assistant' as const, text: '' }])
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
      setMessages(prev => [...prev, {
        role: 'assistant' as const,
        text: "Sorry, I couldn't get an answer right now. Please try again in a moment.",
      }])
    }
  }

  return (
    <div className="animate-fadeIn flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-8">

            {/* Empty state heading */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-glow-pulse" />
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">RTD Assistant</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                What do you want to know?
              </h2>
              <p className="text-zinc-500 text-sm">
                Ask about visa rules, entry requirements, or what the community has experienced.
              </p>
            </div>

            {/* Suggestion chips — minimal, no box */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xl">
              {SUGGESTIONS.map(s => (
                <button
                  key={s.text}
                  onClick={() => send(s.text)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 hover:border-zinc-600 text-sm text-zinc-400 hover:text-white transition-all duration-200 hover:bg-zinc-800/40"
                >
                  <span>{s.icon}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>

          </div>
        ) : (
          <div className="py-6 space-y-4">
            {messages.map((msg, i) => (
              <Bubble
                key={i}
                msg={msg}
                isStreaming={streaming && i === messages.length - 1 && msg.role === 'assistant'}
              />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Unified input — button lives inside the field */}
      <div className="pt-4">
        <div className={`relative flex items-center bg-zinc-900/70 border rounded-2xl transition-colors duration-200 ${
          loading ? 'border-zinc-800/40 opacity-70' : 'border-zinc-700/60 focus-within:border-blue-500/50'
        }`}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
            placeholder="Ask about any country or visa requirement…"
            disabled={loading}
            className="flex-1 bg-transparent px-5 py-4 text-sm text-white placeholder-zinc-600 focus:outline-none"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className={`mr-2 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
              input.trim() && !loading
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-[11px] text-zinc-700 mt-2 text-center">
          Always verify with the official embassy before travel.
        </p>
      </div>

    </div>
  )
}
