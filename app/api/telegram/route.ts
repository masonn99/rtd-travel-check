import { NextRequest, NextResponse } from 'next/server';
import { extractTravelExperience } from '../../../lib/ai';
import { createExperience } from '../../../actions/experiences';
import { sendTelegramMessage } from '../../../lib/telegram';
import { analyzeMessageLocally } from '../../../lib/nlp';
import { getCode } from 'country-list';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const adminId = process.env.ADMIN_TELEGRAM_ID;

    // --- CASE 1: BUTTON CLICK (CALLBACK QUERY) ---
    if (body.callback_query) {
      const { data, message, from } = body.callback_query;
      
      // Security: Only you can click the buttons
      if (String(from.id) !== String(adminId)) {
         return NextResponse.json({ ok: true });
      }

      if (data.startsWith('approve_')) {
        const [_, countryCode, countryName, type] = data.split('|');
        const originalText = message.text;
        const description = originalText.split('Description:')[1]?.trim() || "No description";

        await createExperience({
          country_code: countryCode,
          country_name: countryName,
          experience_type: type,
          title: `Report for ${countryName}`,
          description: `${description}\n\n(Verified from Telegram Community)`,
          author_name: "Community Member"
        });

        await sendTelegramMessage(adminId!, `✅ <b>Success!</b> Added report for ${countryName} to the database.`);
      } else if (data === 'reject') {
        await sendTelegramMessage(adminId!, `❌ Report rejected and ignored.`);
      }
      
      return NextResponse.json({ ok: true });
    }

    // --- CASE 2: NEW MESSAGE FROM GROUP ---
    const messageText = body?.message?.text;
    if (!messageText || !adminId) return NextResponse.json({ ok: true });

    // 1. LAYER 1: Local NLP Filter (FREE)
    const localAnalysis = analyzeMessageLocally(messageText);
    
    // Only proceed to LLM if it looks like a real travel report
    if (!localAnalysis.isPotentialReport) {
      // Debug: Log why it was ignored if you want to monitor it
      console.log(`[NLP] Ignored message: "${messageText.substring(0, 50)}..." Reason: ${localAnalysis.reason}`);
      return NextResponse.json({ ok: true });
    }

    // 2. LAYER 2: AI Extraction (PAID/LIMITED)
    // We only call this for the ~10% of messages that pass Layer 1
    const extraction = await extractTravelExperience(messageText);

    if (extraction.isReport && extraction.country_name) {
      const countryCode = getCode(extraction.country_name) || "??";
      
      // 3. LAYER 3: Human Approval (YOU)
      const adminMessage = `
<b>New Visa Report Detected!</b>
<b>Confidence Score:</b> ${localAnalysis.confidence}%
<b>Country:</b> ${extraction.country_name} (${countryCode})
<b>Type:</b> ${extraction.experience_type}
<b>User:</b> ${body.message.from?.first_name || "Unknown"}
<b>Description:</b> ${extraction.description}

Should I add this to the website?
      `;

      // We pack basic data into callback (limit 64 chars)
      const callbackData = `approve_|${countryCode}|${extraction.country_name.substring(0, 15)}|${extraction.experience_type}`;

      await sendTelegramMessage(adminId, adminMessage, {
        inline_keyboard: [[
          { text: "✅ Approve", callback_data: callbackData },
          { text: "❌ Reject", callback_data: "reject" }
        ]]
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ ok: true });
  }
}
