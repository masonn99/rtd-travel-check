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
  'embassy', 'consulate', 'e-visa', 'voa', 'on arrival', 'experience',
  'got in', 'let me in', 'let me through', 'no problem', 'no issue',
  'got back', 'just returned', 'just came back', 'visited', 'trip',
  'passport control', 'customs', 'denied', 'rejected', 'refused',
  'rtd', 'travel document', 'refugee travel'
]

// Strong first-person travel signals — alone enough to pass filter
const STRONG_SIGNALS = [
  'just got back from', 'just returned from', 'just came back from',
  'i traveled to', 'i travelled to', 'i visited', 'i went to',
  'i entered', 'i arrived in', 'i landed in',
  'they stamped', 'they let me', 'they denied', 'they refused',
  'no visa needed', 'visa free', 'visa on arrival',
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

  // 3. Strong signal check — bypass scoring entirely
  if (STRONG_SIGNALS.some(s => lowerText.includes(s))) {
    const detectedCountry = visaData.find(c => lowerText.includes(c.country.toLowerCase()))
    return {
      isPotentialReport: true,
      confidence: 90,
      detectedCountry: detectedCountry?.country,
      reason: 'Strong first-person travel signal'
    }
  }

  // 4. Country Detection: Does it mention a country in our database?
  const detectedCountry = visaData.find(c => lowerText.includes(c.country.toLowerCase()))
  if (!detectedCountry) {
    return { isPotentialReport: false, confidence: 0, reason: 'No supported country detected' }
  }

  // 5. Tense and Intent Detection
  const hasPastTense = doc.verbs().has('#PastTense')
  const hasTravelContext = TRAVEL_KEYWORDS.some(word => lowerText.includes(word))
  const isFirstPerson = lowerText.includes('i ') || lowerText.includes('my ') || lowerText.includes('me ')

  let confidence = 0
  if (hasPastTense) confidence += 35
  if (hasTravelContext) confidence += 35
  if (isFirstPerson) confidence += 30

  // Lowered threshold from 60 → 40 to catch more natural messages
  const isPotentialReport = confidence >= 40

  return {
    isPotentialReport,
    confidence,
    detectedCountry: detectedCountry.country,
    reason: isPotentialReport ? 'Travel context + detected country' : `Low confidence (${confidence}%) travel context`
  }
}
