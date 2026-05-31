import { NextRequest, NextResponse } from 'next/server'
import { getCode } from 'country-list'
import { extractTravelExperience } from '../../lib/ai'
import { analyzeMessageLocally } from '../../lib/nlp'
import { sendTelegramMessage } from '../../lib/telegram'
import {
  insertTelegramExperience,
  approveExperience,
  rejectExperience,
  countStoriesForCountry,
} from '../../actions/experiences'

// Always return 200 to Telegram — if we return anything else it retries endlessly
const OK = () => NextResponse.json({ ok: true })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const adminId = process.env.ADMIN_TELEGRAM_ID
    const groupId = process.env.TELEGRAM_GROUP_ID // optional: restrict to one group

    if (!adminId) {
      console.error('[Telegram] ADMIN_TELEGRAM_ID not set')
      return OK()
    }

    // ── CASE 1: Button click (approve / reject) ───────────────────────────────
    if (body.callback_query) {
      const { data, from } = body.callback_query

      // Only the admin can act on buttons
      if (String(from.id) !== String(adminId)) return OK()

      const callbackId = body.callback_query.id

      if (data?.startsWith('approve_')) {
        const id = parseInt(data.replace('approve_', ''), 10)
        const result = await approveExperience(id)
        await answerCallback(callbackId, result.success ? '✅ Published!' : '❌ Failed')
        if (result.success) {
          await sendTelegramMessage(adminId, `✅ Story #${id} is now <b>live</b> on the site.`)
        }
      } else if (data?.startsWith('reject_')) {
        const id = parseInt(data.replace('reject_', ''), 10)
        const result = await rejectExperience(id)
        await answerCallback(callbackId, result.success ? '🗑 Rejected' : '❌ Failed')
        if (result.success) {
          await sendTelegramMessage(adminId, `🗑 Story #${id} rejected and removed.`)
        }
      }

      return OK()
    }

    // ── CASE 2: Incoming message ───────────────────────────────────────────────
    const message = body?.message
    const messageText: string | undefined = message?.text
    const chatId = message?.chat?.id

    console.log(`[TG] Received: type=${message ? 'message' : 'other'} chatId=${chatId} hasText=${!!messageText}`)

    if (!messageText) return OK()

    // Optional: only process messages from your community group
    if (groupId && String(chatId) !== String(groupId)) {
      console.log(`[TG] Ignored: chatId ${chatId} doesn't match TELEGRAM_GROUP_ID ${groupId}`)
      return OK()
    }

    const messageId: number = message.message_id
    const senderName: string = [message.from?.first_name, message.from?.last_name]
      .filter(Boolean).join(' ') || 'Community Member'

    console.log(`[TG] Processing message ${messageId} from ${senderName}: "${messageText.substring(0, 80)}…"`)

    // ── Step 1: Heuristic filter (free, no API call) ──────────────────────────
    const local = analyzeMessageLocally(messageText)
    console.log(`[NLP] confidence=${local.confidence} isPotential=${local.isPotentialReport} reason="${local.reason}"`)
    if (!local.isPotentialReport) {
      return OK()
    }

    // ── Step 2: LLM extraction (Gemini Flash → Groq fallback) ─────────────────
    console.log(`[AI] Extracting story from message ${messageId}…`)
    const extraction = await extractTravelExperience(messageText)
    console.log(`[AI] Result: isReport=${extraction.isReport} country="${extraction.country_name}" type="${extraction.experience_type}"`)

    if (!extraction.isReport || !extraction.country_name) {
      console.log(`[AI] Not a report — skipping`)
      return OK()
    }

    // ── Step 3: Save as pending_review ────────────────────────────────────────
    const countryCode = getCode(extraction.country_name) ?? 'XX'
    const experienceType = extraction.experience_type ?? 'Visa Required'
    const title = extraction.title ?? `Report for ${extraction.country_name}`
    const description = (extraction.description && extraction.description.trim().length > 5)
      ? extraction.description
      : messageText

    console.log(`[DB] Inserting pending story: "${title}" for ${extraction.country_name}`)
    const insert = await insertTelegramExperience({
      country_code: countryCode,
      country_name: extraction.country_name,
      experience_type: experienceType,
      title,
      description: `${description}\n\n— ${senderName} (via Telegram)`,
      author_name: senderName,
      telegram_message_id: messageId,
    })
    console.log(`[DB] Insert result: success=${insert.success} id=${insert.id} error=${insert.error}`)

    if (!insert.success) {
      if (insert.error !== 'duplicate') {
        console.error('[DB] insertTelegramExperience failed:', insert.error)
      }
      return OK()
    }

    // ── Step 4: Notify admin with approve / reject buttons ────────────────────
    console.log(`[TG] Sending approval notification to admin for story #${insert.id}`)
    const existingCount = await countStoriesForCountry(extraction.country_name)
    const isNewCountry = existingCount === 0

    const countryLabel = isNewCountry
      ? `🌍 <b>NEW COUNTRY</b> — first story ever for <b>${extraction.country_name}</b>`
      : `📖 New story for <b>${extraction.country_name}</b> (${existingCount} existing)`

    const notifText = [
      `${countryLabel}`,
      ``,
      `<b>Type:</b> ${experienceType}`,
      `<b>From:</b> ${senderName}`,
      `<b>Title:</b> ${title}`,
      ``,
      `<b>Description:</b>`,
      description.substring(0, 400) + (description.length > 400 ? '…' : ''),
      ``,
      `Story ID: #${insert.id}`,
    ].join('\n')

    await sendTelegramMessage(adminId, notifText, {
      inline_keyboard: [[
        { text: '✅ Approve', callback_data: `approve_${insert.id}` },
        { text: '❌ Reject',  callback_data: `reject_${insert.id}`  },
      ]],
    })

    return OK()
  } catch (error) {
    console.error('[Telegram webhook] Unhandled error:', error)
    return OK() // always 200 so Telegram doesn't retry
  }
}

/** Acknowledge a button click — removes the spinner in Telegram UI */
async function answerCallback(callbackQueryId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  }).catch(() => {})
}
