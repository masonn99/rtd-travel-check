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

/**
 * Answer RTD travel questions using visa data + community stories as context.
 * Primary: Groq Llama 3.3 70B (fast, good reasoning)
 * Fallback: Gemini Flash
 */
export async function askTravelAssistant(query: string): Promise<string> {
  const allStories = await getExperiences()
  const lowerQuery = query.toLowerCase()

  const relevantOfficial = visaData.filter(item =>
    lowerQuery.includes(item.country.toLowerCase()) ||
    (item.country.toLowerCase() === 'united arab emirates' &&
      (lowerQuery.includes('dubai') || lowerQuery.includes('uae')))
  )
  const relevantStories = allStories.filter(s =>
    lowerQuery.includes(s.country_name.toLowerCase())
  )

  const context = {
    officialRules: relevantOfficial.length > 0 ? relevantOfficial : visaData.slice(0, 10),
    communityReports: relevantStories.length > 0 ? relevantStories.slice(0, 10) : allStories.slice(0, 5),
  }

  const systemPrompt = `You are the RTD Travel Assistant for US Refugee Travel Document (I-571) holders.

CONTEXT (official rules + community reports):
${JSON.stringify(context)}

RULES:
1. Base your answer on the context only.
2. Give the official rule first, then any community reports.
3. Map city names to countries (Dubai → UAE).
4. If a country isn't in the context, say so honestly.
5. Keep answers to 2-3 concise sentences.`

  // Primary: Groq (faster for chat)
  try {
    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
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
    const result = await model.generateContent(query)
    return result.response.text()
  } catch (geminiErr) {
    console.error('[AI] Gemini chat fallback failed:', geminiErr)
    return "I'm a bit busy right now — please try again in a moment."
  }
}
