import nlp from 'compromise'
import visaData from '../../data.json'

// Keywords that indicate the user is talking about their RTD application/USCIS, not travel
const NOISE_KEYWORDS = [
  'uscis', 'biometrics', 'receipt', 'expedite', 'mailing', 
  'renewal', 'applied for rtd', 'got my rtd', 'waiting for rtd',
  'processing time for rtd', 'i-131', 'form', 'renewing'
]

// Keywords that indicate it might be a travel experience
const TRAVEL_KEYWORDS = [
  'visa', 'entry', 'entered', 'border', 'immigration', 'officer',
  'stamp', 'airport', 'arrived', 'landed', 'travelled', 'traveled',
  'embassy', 'consulate', 'e-visa', 'voa', 'on arrival', 'experience'
]

interface NLPAnalysis {
  isPotentialReport: boolean
  confidence: number
  reason?: string
  detectedCountry?: string
}

/**
 * Layer 1: Local NLP Filter
 * Analyzes message to decide if it's worth calling the LLM.
 */
export function analyzeMessageLocally(text: string): NLPAnalysis {
  const lowerText = text.toLowerCase()
  const doc = nlp(lowerText)

  // 1. Noise Filter: Is this about the RTD application itself?
  if (NOISE_KEYWORDS.some(word => lowerText.includes(word))) {
    return { isPotentialReport: false, confidence: 0, reason: 'Detected RTD/USCIS application talk' }
  }

  // 2. Question Filter: Is this just a question?
  const isQuestion = doc.questions().found || 
                     lowerText.includes('?') || 
                     lowerText.startsWith('can i') || 
                     lowerText.startsWith('does anyone know') ||
                     lowerText.includes('has anyone')

  if (isQuestion && !lowerText.includes('i just') && !lowerText.includes('i entered')) {
    return { isPotentialReport: false, confidence: 0, reason: 'Message appears to be a question' }
  }

  // 3. Country Detection: Does it mention a country in our database?
  const detectedCountry = visaData.find(c => lowerText.includes(c.country.toLowerCase()))
  if (!detectedCountry) {
    return { isPotentialReport: false, confidence: 0, reason: 'No supported country detected' }
  }

  // 4. Tense and Intent Detection
  // Check for past tense using tags (#PastTense)
  const hasPastTense = doc.verbs().has('#PastTense')
  const hasTravelContext = TRAVEL_KEYWORDS.some(word => lowerText.includes(word))

  let confidence = 0
  if (hasPastTense) confidence += 40
  if (hasTravelContext) confidence += 40
  if (lowerText.includes('i ') || lowerText.includes('my ') || lowerText.includes('me ')) confidence += 20

  // 5. Final Decision
  // We want a high threshold to save tokens
  const isPotentialReport = confidence >= 60

  return {
    isPotentialReport,
    confidence,
    detectedCountry: detectedCountry.country,
    reason: isPotentialReport ? 'High travel context + detected country' : 'Low confidence travel context'
  }
}
