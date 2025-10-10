'use client'

import { useState } from 'react'
import { createExperience } from '../actions/experiences'
import data from '../../data.json'

interface ExperienceFormProps {
  onSuccess?: () => void
}

const ExperienceForm = ({ onSuccess }: ExperienceFormProps) => {
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
  const [showForm, setShowForm] = useState(false)

  const countries = data.map((c: any) => c.country).sort()

  const visaTypes = [
    'Visa Free',
    'E-Visa',
    'Visa Required',
    'Visa on Arrival',
    'Not Recognized'
  ]

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

        setShowForm(false)
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

  if (!showForm) {
    return (
      <div className="text-center py-8">
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          + Share Your Travel Experience
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto bg-zinc-800/40 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6 sm:p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Share Your Experience</h2>
        <button
          onClick={() => setShowForm(false)}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Country Visited *
          </label>
          <select
            required
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">Select a country</option>
            {countries.map((country: string) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Travel Date & Visa Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              When did you travel? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                required
                value={formData.travelDate.split('-')[1] || ''}
                onChange={(e) => {
                  const year = formData.travelDate.split('-')[0] || new Date().getFullYear()
                  setFormData({ ...formData, travelDate: `${year}-${e.target.value}` })
                }}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Month</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
              <select
                required
                value={formData.travelDate.split('-')[0] || ''}
                onChange={(e) => {
                  const month = formData.travelDate.split('-')[1] || ''
                  setFormData({ ...formData, travelDate: `${e.target.value}-${month}` })
                }}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Year</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Visa Type *
            </label>
            <select
              required
              value={formData.visaType}
              onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">Select visa type</option>
              {visaTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Processing Time */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Processing Time (if applicable)
          </label>
          <input
            type="text"
            value={formData.processingTime}
            onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
            placeholder="e.g., 2 weeks, 3 days"
            className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Difficulty Rating */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Process Difficulty (1 = Very Easy, 5 = Very Hard) *
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="5"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-2xl font-bold text-blue-400 w-8 text-center">
              {formData.difficulty}
            </span>
          </div>
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>Very Easy</span>
            <span>Very Hard</span>
          </div>
        </div>

        {/* Green Card */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasGreenCard}
              onChange={(e) => setFormData({ ...formData, hasGreenCard: e.target.checked })}
              className="w-5 h-5 rounded border-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900"
            />
            <span className="text-sm font-medium text-zinc-300">
              I have a US Green Card
            </span>
          </label>
        </div>

        {/* Entry Experience */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Entry/Exit Experience *
          </label>
          <textarea
            required
            value={formData.entryExperience}
            onChange={(e) => setFormData({ ...formData, entryExperience: e.target.value })}
            placeholder="Describe your experience at immigration, any issues, documents required, etc."
            rows={4}
            className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          />
        </div>

        {/* Tips */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Tips & Advice
          </label>
          <textarea
            value={formData.tips}
            onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
            placeholder="Any tips or advice for other RTD holders traveling to this country?"
            rows={3}
            className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          />
        </div>

        {/* Author Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Your Name (optional)
          </label>
          <input
            type="text"
            value={formData.authorName}
            onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
            placeholder="Anonymous"
            className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 px-6 py-3 bg-zinc-800/50 text-white rounded-xl font-medium border border-zinc-700/50 hover:bg-zinc-700/50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Experience'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ExperienceForm
