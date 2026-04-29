'use client'

import { useState } from 'react'
import { createExperience } from '../actions/experiences'
import data from '../../data.json'

interface ExperienceFormProps {
  onSuccess?: () => void
  embedded?: boolean
}

const ExperienceForm = ({ onSuccess, embedded = false }: ExperienceFormProps) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    country: '',
    travelDate: '',
    visaType: '',
    processingTime: '',
    difficulty: 3,
    hasGreenCard: false,
    entryExperience: '',
    tips: '',
    authorName: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const countries = data.map((c: any) => c.country).sort()

  const visaTypes = [
    'Visa Free',
    'E-Visa',
    'Visa Required',
    'Visa on Arrival',
    'Not Recognized'
  ]

  const handleNext = () => {
    if (step === 1) {
      if (!formData.country || !formData.travelDate || !formData.visaType) {
        alert('Please fill in all required fields.')
        return
      }
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Rate limiting
    const lastSubmission = localStorage.getItem('lastSubmissionTime')
    const now = Date.now()
    const COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

    if (lastSubmission && now - parseInt(lastSubmission) < COOLDOWN_MS) {
      const remainingMin = Math.ceil((COOLDOWN_MS - (now - parseInt(lastSubmission))) / 60000)
      alert(`Please wait ${remainingMin} minute(s) before submitting another experience.`)
      return
    }

    // Basic spam detection
    const spamKeywords = ['http://', 'https://', 'www.', 'click here', 'buy now', 'casino', 'viagra']
    const combinedText = (formData.entryExperience + ' ' + formData.tips).toLowerCase()
    const hasSpam = spamKeywords.some(keyword => combinedText.includes(keyword))

    if (hasSpam) {
      alert('Your submission contains prohibited content. Please remove any links or promotional text.')
      return
    }

    // Validate minimum content length
    if (formData.entryExperience.length < 20) {
      alert('Please provide more detailed information about your experience (at least 20 characters).')
      return
    }

    setIsSubmitting(true)

    try {
      // Get country code - use first 2 letters of country name as fallback
      const countryCode = formData.country ? formData.country.substring(0, 2).toUpperCase() : 'XX'

      const result = await createExperience({
        country_code: countryCode,
        country_name: formData.country,
        experience_type: formData.visaType,
        title: `${formData.visaType} - ${formData.country}`,
        description: `Travel Date: ${formData.travelDate}
Visa Type: ${formData.visaType}
Processing Time: ${formData.processingTime || 'N/A'}
Difficulty: ${formData.difficulty}/5
Has Green Card: ${formData.hasGreenCard ? 'Yes' : 'No'}

Entry/Exit Experience:
${formData.entryExperience}

${formData.tips ? `Tips & Advice:\n${formData.tips}` : ''}`,
        author_name: formData.authorName || 'Anonymous',
      })

      if (result.success) {
        // Set rate limit
        localStorage.setItem('lastSubmissionTime', now.toString())

        // Reset form
        setFormData({
          country: '',
          travelDate: '',
          visaType: '',
          processingTime: '',
          difficulty: 3,
          hasGreenCard: false,
          entryExperience: '',
          tips: '',
          authorName: '',
        })

        setStep(1)
        if (onSuccess) onSuccess()

        alert('Experience submitted successfully! Thank you for contributing to the community.')
      } else {
        alert(result.error || 'Failed to submit experience. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting experience:', error)
      alert('Failed to submit experience. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const containerClasses = embedded 
    ? "w-full" 
    : "max-w-3xl mx-auto bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fadeIn"

  return (
    <div className={containerClasses}>
      {!embedded && (
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Share Your Experience</h2>
            <p className="text-zinc-400 text-sm mt-1">Help others travel with confidence</p>
          </div>
          <div className="flex items-center gap-1">
            <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-blue-500' : 'bg-zinc-700'}`} />
            <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-blue-500' : 'bg-zinc-700'}`} />
          </div>
        </div>
      )}

      {embedded && (
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Step {step} of 2
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 && (
          <div className="space-y-5 animate-slideInRight">
            {/* Country */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Destination *
              </label>
              <select
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              >
                <option value="">Select country</option>
                {countries.map((country: string) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Visa Type & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Visa Type *
                </label>
                <select
                  required
                  value={formData.visaType}
                  onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                >
                  <option value="">Select type</option>
                  {visaTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Travel Date *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    required
                    value={formData.travelDate.split('-')[1] || ''}
                    onChange={(e) => {
                      const year = formData.travelDate.split('-')[0] || new Date().getFullYear()
                      setFormData({ ...formData, travelDate: `${year}-${e.target.value}` })
                    }}
                    className="w-full px-3 py-3 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Month</option>
                    {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                      <option key={m} value={m}>{new Date(2000, parseInt(m)-1).toLocaleString('default', { month: 'short' })}</option>
                    ))}
                  </select>
                  <select
                    required
                    value={formData.travelDate.split('-')[0] || ''}
                    onChange={(e) => {
                      const month = formData.travelDate.split('-')[1] || ''
                      setFormData({ ...formData, travelDate: `${e.target.value}-${month}` })
                    }}
                    className="w-full px-3 py-3 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Difficulty Rating */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                How difficult was the process?
              </label>
              <div className="flex justify-between items-center bg-zinc-950/30 p-4 rounded-2xl border border-zinc-800/50">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: num })}
                    className={`w-10 h-10 rounded-xl font-bold transition-all duration-200 ${
                      formData.difficulty === num
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-110'
                        : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600 mt-2 px-1 uppercase font-bold tracking-tighter">
                <span>Very Easy</span>
                <span>Neutral</span>
                <span>Very Hard</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group"
            >
              Continue to Details
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-slideInRight">
            {/* Entry Experience */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Your Story *
              </label>
              <textarea
                required
                value={formData.entryExperience}
                onChange={(e) => setFormData({ ...formData, entryExperience: e.target.value })}
                placeholder="Documents asked, interview questions, arrival experience..."
                rows={4}
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
              />
              <p className="text-[10px] text-zinc-600 mt-1 italic">Minimum 20 characters</p>
            </div>

            {/* Tips */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Any Pro-Tips?
              </label>
              <textarea
                value={formData.tips}
                onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                placeholder="Optional: things you wish you knew before"
                rows={2}
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
              />
            </div>

            {/* Optional Fields Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Processing Time
                </label>
                <input
                  type="text"
                  value={formData.processingTime}
                  onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                  placeholder="e.g. 2 weeks"
                  className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="Anonymous"
                  className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer group/check">
                <input
                  type="checkbox"
                  checked={formData.hasGreenCard}
                  onChange={(e) => setFormData({ ...formData, hasGreenCard: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-zinc-800 bg-zinc-950/50 text-blue-600 focus:ring-blue-500/50 focus:ring-offset-zinc-900 transition-all"
                />
                <span className="text-sm font-medium text-zinc-400 group-hover/check:text-zinc-200 transition-colors">
                  I have a US Green Card
                </span>
              </label>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-bold transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post Experience'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default ExperienceForm
