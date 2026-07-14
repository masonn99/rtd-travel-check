import { GoogleGenerativeAI } from '@google/generative-ai'
import visaData from '../../data.json'
import { getSql } from './db'

let _gemini: GoogleGenerativeAI | null = null

function getModel() {
  if (!_gemini) _gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  return _gemini.getGenerativeModel({ model: 'text-embedding-004' })
}

export async function embed(text: string): Promise<number[]> {
  const result = await getModel().embedContent(text)
  return result.embedding.values
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

// ─── Visa index ────────────────────────────────────────────────────────────────

type VisaEntry = (typeof visaData)[0]

function visaToText(e: VisaEntry): string {
  return [
    `Country: ${e.country}`,
    `Visa requirement: ${e.visaRequirement}`,
    e.duration ? `Duration: ${e.duration}` : '',
    e.notes ? `Notes: ${e.notes}` : '',
  ].filter(Boolean).join('. ')
}

// Singleton promise so parallel requests don't trigger duplicate batch calls
let _visaIndexPromise: Promise<Array<{ item: VisaEntry; embedding: number[] }>> | null = null

async function buildVisaIndex() {
  const model = getModel()
  const texts = visaData.map(visaToText)

  // One API call for all 99 entries
  const batch = await model.batchEmbedContents({
    requests: texts.map(text => ({
      content: { parts: [{ text }], role: 'user' },
    })),
  })

  return visaData.map((item, i) => ({
    item,
    embedding: batch.embeddings[i].values,
  }))
}

function getVisaIndex() {
  if (!_visaIndexPromise) _visaIndexPromise = buildVisaIndex()
  return _visaIndexPromise
}

// ─── Search ────────────────────────────────────────────────────────────────────

/**
 * Embed the query and return the topK most semantically similar visa entries.
 * Falls back to an empty array so the caller can use keyword search instead.
 */
export async function findRelevantVisa(
  query: string,
  topK = 8,
): Promise<VisaEntry[]> {
  const [queryVec, index] = await Promise.all([embed(query), getVisaIndex()])

  return index
    .map(e => ({ item: e.item, score: cosineSimilarity(queryVec, e.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(e => e.item)
}

// ─── Story search ──────────────────────────────────────────────────────────────

// Minimal shape needed from the DB — keeps this module decoupled from the
// full Experience type in actions/experiences.ts.
interface StoryRow {
  id: number
  country_name: string
  experience_type: string
  title: string
  description: string
  embedding: number[]
}

/** Text representation used both when embedding at insert time and at search time. */
export function storyToText(s: Pick<StoryRow, 'country_name' | 'experience_type' | 'title' | 'description'>): string {
  return [
    `Country: ${s.country_name}`,
    `Type: ${s.experience_type}`,
    `Title: ${s.title}`,
    s.description,
  ].join('. ')
}

/**
 * Embed the query, then fetch community stories that have embeddings and rank
 * them by semantic similarity. Stories without embeddings are ignored here —
 * the caller falls back to keyword search to cover those.
 */
export async function findRelevantStories(
  query: string,
  topK = 8,
): Promise<Omit<StoryRow, 'embedding'>[]> {
  const sql = getSql()

  // Fetch up to 200 recent published stories that have been embedded.
  // LIMIT 200 keeps memory usage bounded even as the table grows.
  const rows = await sql`
    SELECT id, country_name, experience_type, title, description, embedding
    FROM experiences
    WHERE (status = 'published' OR status IS NULL)
      AND embedding IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 200
  ` as StoryRow[]

  if (rows.length === 0) return []

  const queryVec = await embed(query)

  return rows
    .map(row => ({
      ...row,
      score: cosineSimilarity(queryVec, row.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ embedding: _emb, score: _score, ...story }) => story)
}
