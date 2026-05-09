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
  const visaTypes = ['Visa Free', 'E-Visa', 'Visa Required', 'Visa on Arrival', 'Not Recognized']

  const difficultyLabels: Record<number, string> = {
    1: 'Very Easy', 2: 'Easy', 3: 'Neutral', 4: 'Hard', 5: 'Very Hard'
  }
  const difficultyColors: Record<number, string> = {
    1: 'bg-emerald-600 shadow-emerald-600/30',
    2: 'bg-emerald-500 shadow-emerald-500/30',
    3: 'bg-amber-500 shadow-amber-500/30',
    4: 'bg-orange-500 shadow-orange-500/30',
    5: 'bg-red-600 shadow-red-600/30',
  }

  const handleNext = () => {
    if (step === 1 && (!formData.country || !formData.travelDate || !formData.visaType)) {
      alert('Please fill in all required fields.')
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => setStep(step - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const lastSubmission = localStorage.getItem('lastSubmissionTime')
    const now = Date.now()
    const COOLDOWN_MS = 5 * 60 * 1000

    if (lastSubmission && now - parseInt(lastSubmission) < COOLDOWN_MS) {
      const remainingMin = Math.ceil((COOLDOWN_MS - (now - parseInt(lastSubmission))) / 60000)
      alert(`Please wait ${remainingMin} minute(s) before submitting another experience.`)
      return
    }

    const spamKeywords = ['http://', 'https://', 'www.', 'click here', 'buy now', 'casino', 'viagra']
    const combinedText = (formData.entryExperience + ' ' + formData.tips).toLowerCase()
    if (spamKeywords.some(keyword => combinedText.includes(keyword))) {
      alert('Your submission contains prohibited content. Please remove any links or promotional text.')
      return
    }

    if (formData.entryExperience.length < 20) {
      alert('Please provide more detail (at least 20 characters).')
      return
    }

    setIsSubmitting(true)

    try {
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
        localStorage.setItem('lastSubmissionTime', now.toString())
        setFormData({
          country: '', travelDate: '', visaType: '', processingTime: '',
          difficulty: 3, hasGreenCard: false, entryExperience: '', tips: '', authorName: '',
        })
        setStep(1)
        if (onSuccess) onSuccess()
        alert('Experience submitted! Thank you for contributing.')
      } else {
        alert(result.error || 'Failed to submit. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting experience:', error)
      alert('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = "w-full px-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
  const labelClass = "block text-xs font-semibold text-zinc-400 mb-1.5"

  return (
    <div className={embedded ? 'w-full' : 'max-w-2xl mx-auto bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 animate-fadeIn'}>
      {/* Progress */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-400 ease-out"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
        <span className="text-[11px] text-zinc-500 font-medium flex-shrink-0">
          {step} / 2
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4 animate-slideInRight">
            <div>
              <label className={labelClass}>Destination *</label>
              <select
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={inputClass}
              >
                <option value="">Select country</option>
                {countries.map((country: string) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Visa Type *</label>
                <select
                  required
                  value={formData.visaType}
                  onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select type</option>
                  {visaTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Travel Date *</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    required
                    value={formData.travelDate.split('-')[1] || ''}
                    onChange={(e) => {
                      const year = formData.travelDate.split('-')[0] || new Date().getFullYear()
                      setFormData({ ...formData, travelDate: `${year}-${e.target.value}` })
                    }}
                    className={inputClass + ' text-xs'}
                  >
                    <option value="">Month</option>
                    {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                      <option key={m} value={m}>{new Date(2000, parseInt(m) - 1).toLocaleString('default', { month: 'short' })}</option>
                    ))}
                  </select>
                  <select
                    required
                    value={formData.travelDate.split('-')[0] || ''}
                    onChange={(e) => {
                      const month = formData.travelDate.split('-')[1] || ''
                      setFormData({ ...formData, travelDate: `${e.target.value}-${month}` })
                    }}
                    className={inputClass + ' text-xs'}
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className={labelClass}>
                Difficulty — <span className="text-zinc-300">{difficultyLabels[formData.difficulty]}</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: num })}
                    className={`flex-1 h-9 rounded-lg font-bold text-sm transition-all duration-150 ${
                      formData.difficulty === num
                        ? `${difficultyColors[num]} text-white shadow-md scale-105`
                        : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 group"
            >
              Continue
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-slideInRight">
            <div>
              <label className={labelClass}>Your Story *</label>
              <textarea
                required
                value={formData.entryExperience}
                onChange={(e) => setFormData({ ...formData, entryExperience: e.target.value })}
                placeholder="Documents asked, interview questions, arrival experience..."
                rows={4}
                className={inputClass + ' resize-none'}
              />
              <p className="text-[10px] text-zinc-600 mt-1">Minimum 20 characters</p>
            </div>

            <div>
              <label className={labelClass}>Tips (optional)</label>
              <textarea
                value={formData.tips}
                onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                placeholder="Things you wish you knew before..."
                rows={2}
                className={inputClass + ' resize-none'}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Processing Time</label>
                <input
                  type="text"
                  value={formData.processingTime}
                  onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                  placeholder="e.g. 2 weeks"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Display Name</label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="Anonymous"
                  className={inputClass}
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.hasGreenCard}
                onChange={(e) => setFormData({ ...formData, hasGreenCard: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500/30 focus:ring-offset-zinc-900"
              />
              <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                I have a US Green Card
              </span>
            </label>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold text-sm transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-sm shadow-blue-600/20"
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
