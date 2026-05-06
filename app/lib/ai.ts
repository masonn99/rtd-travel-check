import Groq from "groq-sdk";
import visaData from '../../data.json';
import { getExperiences } from '../actions/experiences';

let groqInstance: Groq | null = null;

function getGroqClient() {
  if (!groqInstance) {
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqInstance;
}

/**
 * Answers user questions using the Directory and Community Stories as context.
 * Uses a "Search-First" strategy to provide the most relevant data.
 */
export async function askTravelAssistant(query: string) {
  try {
    const groq = getGroqClient();
    // 1. Fetch all community stories
    const allStories = await getExperiences();
    
    // 2. Filter context based on the user's query (Basic "Retrieval" logic)
    // We look for any country mentioned in the query
    const lowerQuery = query.toLowerCase();
    
    // Find matching official rules
    const relevantOfficial = visaData.filter(item => 
      lowerQuery.includes(item.country.toLowerCase()) || 
      (item.country.toLowerCase() === 'united arab emirates' && lowerQuery.includes('dubai')) ||
      (item.country.toLowerCase() === 'united arab emirates' && lowerQuery.includes('uae'))
    );

    // Find matching community stories
    const relevantStories = allStories.filter(story => 
      lowerQuery.includes(story.country_name.toLowerCase())
    );

    // If no specific country found, give it a small sample of the latest to maintain general knowledge
    const context = {
      officialRules: relevantOfficial.length > 0 ? relevantOfficial : visaData.slice(0, 10),
      communityReports: relevantStories.length > 0 
        ? relevantStories.slice(0, 10) 
        : allStories.slice(0, 5)
    };

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are the "RTD Travel Assistant" for US Refugee Travel Document (I-571) holders. 
          
          CONTEXT (Relevant Official Rules and Community Reports):
          ${JSON.stringify(context)}
          
          GUIDELINES:
          1. Answer based ON THE CONTEXT. 
          2. If a specific country is in the Context, give the official rule first, then community reports.
          3. If the user asks about a city (like Dubai), map it to the country (UAE).
          4. If the info isn't in the context, say: "I don't have verified data for that country in our community records yet."
          5. Keep answers to 2-3 concise sentences.`
        },
        {
          role: "user",
          content: query
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    return chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate an answer.";
  } catch (error: any) {
    console.error("GROQ ERROR:", error);
    return `AI Error: ${error.message || "Failed to connect"}. Please try again.`;
  }
}

/**
 * Extracts structured travel experience data from messy chat text.
 */
export async function extractTravelExperience(text: string) {
  try {
    const groq = getGroqClient();
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Extract visa info. Return ONLY a valid JSON object. No markdown, no extra text. Schema: {isReport: boolean, country_name: string, experience_type: string, title: string, description: string}. Ensure all newlines in strings are escaped as \\n."
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });

    let content = chatCompletion.choices[0]?.message?.content || '{"isReport": false}';
    
    // Clean potential markdown blocks
    if (content.includes('```')) {
      content = content.replace(/```json|```/g, '').trim();
    }

    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw Content:", content);
      // Fallback: try to fix common control character issues
      const cleanedContent = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
      return JSON.parse(cleanedContent);
    }
  } catch (error) {
    console.error("Groq Extraction Error:", error);
    return { isReport: false };
  }
}
