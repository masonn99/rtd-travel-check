import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import visaData from '../../data.json'
import { getExperiences } from '../actions/experiences'

// ─── Clients (lazily initialised) ─────────────────────────────────────────────

let _gemini: GoogleGenerativeAI | null = null
let _groq: Groq | null = null

function getGemini() {
  if (!_gemini) _gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  return _gemini
}

function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _groq
}

// ─── Story extraction ──────────────────────────────────────────────────────────

export interface ExtractionResult {
  isReport: boolean
  country_name?: string
  experience_type?: 'Visa Free' | 'E-Visa' | 'Visa Required' | 'Not Recognized'
  title?: string
  description?: string
}

const EXTRACTION_SYSTEM = `You extract RTD (Refugee Travel Document / US I-571) travel experiences from Telegram messages.

Return ONLY a JSON object — no markdown, no explanation.

Schema:
{
  "isReport": true | false,
  "country_name": "full English country name",
  "experience_type": "Visa Free" | "E-Visa" | "Visa Required" | "Not Recognized",
  "title": "short one-line summary (max 80 chars)",
  "description": "copy the most relevant part of the original message verbatim — NEVER leave this empty"
}

RULES:
- If the message IS a first-hand travel experience, set isReport=true and fill ALL fields.
- description must always contain actual text. If unsure what to write, copy the full original message.
- If the message is NOT a first-hand travel experience (questions, off-topic, RTD application talk), return {"isReport": false}.`

/**
 * Extract a structured story from a raw Telegram message.
 * Primary: Gemini 1.5 Flash (free, 1500 req/day)
 * Fallback: Groq Llama 3.1 8B (free, fast)
 */
export async function extractTravelExperience(text: string): Promise<ExtractionResult> {
  // Try Gemini Flash first
  try {
    const model = getGemini().getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
      systemInstruction: EXTRACTION_SYSTEM,
    })
    const result = await model.generateContent(text)
    const json = JSON.parse(result.response.text())
    return json as ExtractionResult
  } catch (geminiErr: any) {
    const isQuota = geminiErr?.status === 429 || String(geminiErr).includes('quota')
    console.warn(`[AI] Gemini failed (${isQuota ? 'quota' : geminiErr?.message}) — falling back to Groq`)
  }

  // Fallback: Groq Llama 3.1 8B
  try {
    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM },
        { role: 'user', content: text },
      ],
    })
    const raw = completion.choices[0]?.message?.content ?? '{"isReport":false}'
    return JSON.parse(raw) as ExtractionResult
  } catch (groqErr) {
    console.error('[AI] Groq fallback also failed:', groqErr)
    return { isReport: false }
  }
}

// ─── Travel assistant chat ─────────────────────────────────────────────────────

export interface ConversationMessage {
  role: 'user' | 'assistant'
  text: string
}

// City/alias → country name mappings for smarter retrieval
const CITY_TO_COUNTRY: Record<string, string> = {
  dubai: 'united arab emirates',
  'abu dhabi': 'united arab emirates',
  uae: 'united arab emirates',
  bangkok: 'thailand',
  tokyo: 'japan',
  osaka: 'japan',
  paris: 'france',
  london: 'united kingdom',
  uk: 'united kingdom',
  rome: 'italy',
  berlin: 'germany',
  amsterdam: 'netherlands',
  madrid: 'spain',
  lisbon: 'portugal',
  seoul: 'south korea',
  beijing: 'china',
  shanghai: 'china',
  toronto: 'canada',
  montreal: 'canada',
  sydney: 'australia',
  melbourne: 'australia',
  istanbul: 'turkey',
}

function resolveCountries(text: string): string[] {
  const lower = text.toLowerCase()
  const countries = new Set<string>()
  for (const [alias, country] of Object.entries(CITY_TO_COUNTRY)) {
    if (lower.includes(alias)) countries.add(country)
  }
  return Array.from(countries)
}

/**
 * Answer RTD travel questions using visa data + community stories as context.
 * Primary: Groq Llama 3.3 70B (fast, good reasoning)
 * Fallback: Gemini Flash
 */
export async function askTravelAssistant(
  query: string,
  history: ConversationMessage[] = [],
): Promise<string> {
  const allStories = await getExperiences()

  // Search across the full conversation so follow-up questions like
  // "what about a visa?" still find the right country context.
  const fullConversationText = [
    ...history.map(m => m.text),
    query,
  ].join(' ').toLowerCase()

  const aliasCountries = resolveCountries(fullConversationText)

  const relevantOfficial = visaData.filter(item => {
    const c = item.country.toLowerCase()
    return (
      fullConversationText.includes(c) ||
      aliasCountries.includes(c)
    )
  })
  const relevantStories = allStories.filter(s => {
    const c = s.country_name.toLowerCase()
    return (
      fullConversationText.includes(c) ||
      aliasCountries.includes(c)
    )
  })

  const context = {
    officialRules: relevantOfficial.length > 0 ? relevantOfficial : visaData.slice(0, 15),
    communityReports: relevantStories.length > 0 ? relevantStories.slice(0, 15) : allStories.slice(0, 8),
  }

  const systemPrompt = `You are the RTD Travel Assistant — a knowledgeable guide for holders of the US Refugee Travel Document (Form I-571).

CONTEXT (official rules + community reports):
${JSON.stringify(context)}

GUIDELINES:
1. Ground your answer in the context above. If a country isn't covered, say so honestly and suggest they verify with the embassy.
2. Lead with the official visa requirement, then share what the community has reported.
3. Map city/regional names to their country (Tokyo → Japan, Dubai → UAE, etc.).
4. Be conversational and thorough — don't truncate useful information. Short or long, match the depth the question needs.
5. When relevant, mention processing times, required documents, or tips from community reports.
6. Always end with a reminder to confirm with the official embassy or consulate before travel.`

  // Build history in the format the Groq / OpenAI API expects
  const historyMessages = history.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.text,
  }))

  // Primary: Groq (faster for chat)
  try {
    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: query },
      ],
    })
    return completion.choices[0]?.message?.content ?? "I couldn't generate an answer."
  } catch (groqErr: any) {
    const isQuota = groqErr?.status === 429 || String(groqErr).includes('quota')
    console.warn(`[AI] Groq chat failed (${isQuota ? 'quota' : groqErr?.message}) — falling back to Gemini`)
  }

  // Fallback: Gemini Flash
  try {
    const model = getGemini().getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    })
    // Prepend history as plain text for Gemini (no native multi-turn here)
    const historyContext = history.length > 0
      ? history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n') + '\n\n'
      : ''
    const result = await model.generateContent(historyContext + query)
    return result.response.text()
  } catch (geminiErr) {
    console.error('[AI] Gemini chat fallback failed:', geminiErr)
    return "I'm a bit busy right now — please try again in a moment."
  }
}
