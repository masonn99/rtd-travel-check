'use client'

import { useState } from 'react'
import { createExperience } from '../actions/experiences'
import { COUNTRIES, codeFor } from '../lib/countries'
import { STATUS_ORDER, STATUS_LABEL } from '../lib/visa'

interface ExperienceFormProps {
  onSuccess?: () => void
  embedded?: boolean
}

type Notice = { kind: 'error' | 'success'; text: string } | null

const EMPTY = {
  country: '',
  travelDate: '',
  visaType: '',
  processingTime: '',
  difficulty: 0,
  hasGreenCard: false,
  entryExperience: '',
  tips: '',
  authorName: '',
}

const DIFFICULTY_LABEL: Record<number, string> = {
  0: 'Not rated',
  1: 'Very easy', 2: 'Easy', 3: 'Neutral', 4: 'Hard', 5: 'Very hard',
}

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

const ExperienceForm = ({ onSuccess, embedded = false }: ExperienceFormProps) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(EMPTY)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [invalid, setInvalid] = useState<Set<string>>(new Set())

  const set = (patch: Partial<typeof EMPTY>) => {
    setFormData(prev => ({ ...prev, ...patch }))
    if (notice?.kind === 'error') setNotice(null)
    if (invalid.size) {
      const next = new Set(invalid)
      Object.keys(patch).forEach(k => next.delete(k === 'travelDate' ? 'month' : k))
      if ('travelDate' in patch) next.delete('year')
      setInvalid(next)
    }
  }

  const [year = '', month = ''] = formData.travelDate.split('-')

  const handleNext = () => {
    const missing = [
      !formData.country && 'country',
      !formData.visaType && 'visaType',
      !month && 'month',
      !year && 'year',
    ].filter(Boolean) as string[]
    if (missing.length) {
      setInvalid(new Set(missing))
      setNotice({ kind: 'error', text: 'Fill in the highlighted fields to continue.' })
      document.getElementById(`xf-${missing[0]}`)?.focus()
      return
    }
    setInvalid(new Set())
    setNotice(null)
    setStep(2)
  }

  const bad = (k: string) => invalid.has(k)
  const errRing = (k: string) => (bad(k) ? ' ring-2 ring-status-nr-fg/70 focus:!ring-status-nr-fg' : '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const lastSubmission = localStorage.getItem('lastSubmissionTime')
    const now = Date.now()
    const COOLDOWN_MS = 5 * 60 * 1000
    if (lastSubmission && now - parseInt(lastSubmission) < COOLDOWN_MS) {
      const remainingMin = Math.ceil((COOLDOWN_MS - (now - parseInt(lastSubmission))) / 60000)
      setNotice({ kind: 'error', text: `You just posted a report. You can post another in ${remainingMin} minute${remainingMin === 1 ? '' : 's'}.` })
      return
    }

    const spamKeywords = ['http://', 'https://', 'www.', 'click here', 'buy now', 'casino', 'viagra']
    const combinedText = (formData.entryExperience + ' ' + formData.tips).toLowerCase()
    if (spamKeywords.some(keyword => combinedText.includes(keyword))) {
      setNotice({ kind: 'error', text: 'Links and promotional text are not allowed. Remove them and post again.' })
      return
    }

    if (formData.entryExperience.trim().length < 20) {
      setNotice({ kind: 'error', text: 'Add a little more about how entry went (at least 20 characters).' })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createExperience({
        country_code: codeFor(formData.country) ?? formData.country.substring(0, 2).toUpperCase(),
        country_name: formData.country,
        experience_type: formData.visaType,
        title: `${formData.visaType} - ${formData.country}`,
        description: `Travel Date: ${formData.travelDate}
Visa Type: ${formData.visaType}
Processing Time: ${formData.processingTime || 'N/A'}
Difficulty: ${formData.difficulty ? `${formData.difficulty}/5` : 'Not rated'}
Has Green Card: ${formData.hasGreenCard ? 'Yes' : 'No'}

Entry/Exit Experience:
${formData.entryExperience}

${formData.tips ? `Tips & Advice:\n${formData.tips}` : ''}`,
        author_name: formData.authorName || 'Anonymous',
      })

      if (result.success) {
        localStorage.setItem('lastSubmissionTime', now.toString())
        setFormData(EMPTY)
        setStep(1)
        setNotice({ kind: 'success', text: 'Thank you. Your report is posted and will help the next holder.' })
        onSuccess?.()
      } else {
        setNotice({ kind: 'error', text: result.error || 'Your report could not be posted. Check your connection and try again.' })
      }
    } catch (error) {
      console.error('Error submitting experience:', error)
      setNotice({ kind: 'error', text: 'Your report could not be posted. Check your connection and try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const field = 'w-full h-11 px-3 rounded-[10px] bg-fill text-[16px] text-ink placeholder:text-ink-3 outline-none focus:ring-2 focus:ring-accent/40'
  const area = 'w-full px-3 py-2.5 rounded-[10px] bg-fill text-[16px] leading-relaxed text-ink placeholder:text-ink-3 outline-none focus:ring-2 focus:ring-accent/40 resize-y'
  const label = 'block text-[14px] font-medium text-ink mb-1.5'
  const optional = <span className="font-normal text-ink-3"> (optional)</span>

  return (
    <div className={embedded ? 'w-full' : 'max-w-2xl mx-auto bg-surface border border-line rounded-xl p-6'}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-medium text-ink-2">
          Step {step} of 2 · {step === 1 ? 'Your trip' : 'What happened'}
        </p>
        <div className="flex gap-1" aria-hidden="true">
          {[1, 2].map(n => (
            <span key={n} className={`h-1.5 w-6 rounded-full ${n <= step ? 'bg-accent' : 'bg-line'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {notice && (
          <p
            role={notice.kind === 'error' ? 'alert' : 'status'}
            className={`mb-4 rounded-[10px] px-3 py-2.5 text-[14px] leading-snug ${
              notice.kind === 'error' ? 'bg-status-nr-bg text-status-nr-fg' : 'bg-status-free-bg text-status-free-fg'
            }`}
          >
            {notice.text}
          </p>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="xf-country" className={label}>Country</label>
              <select id="xf-country" aria-invalid={bad('country')} value={formData.country} onChange={e => set({ country: e.target.value })} className={field + errRing('country')}>
                <option value="">Choose a country</option>
                {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="xf-visaType" className={label}>How you entered</label>
              <select id="xf-visaType" aria-invalid={bad('visaType')} value={formData.visaType} onChange={e => set({ visaType: e.target.value })} className={field + errRing('visaType')}>
                <option value="">Choose one</option>
                {STATUS_ORDER.map(s => <option key={s} value={STATUS_LABEL[s]}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>

            <fieldset>
              <legend className={label}>When you traveled</legend>
              <div className="grid grid-cols-2 gap-2">
                <select
                  id="xf-month"
                  aria-label="Month"
                  aria-invalid={bad('month')}
                  value={month}
                  onChange={e => set({ travelDate: `${year || new Date().getFullYear()}-${e.target.value}` })}
                  className={field + errRing('month')}
                >
                  <option value="">Month</option>
                  {MONTHS.map(m => (
                    <option key={m} value={m}>{new Date(2000, parseInt(m) - 1).toLocaleString('en-US', { month: 'long' })}</option>
                  ))}
                </select>
                <select
                  id="xf-year"
                  aria-label="Year"
                  aria-invalid={bad('year')}
                  value={year}
                  onChange={e => set({ travelDate: `${e.target.value}-${month}` })}
                  className={field + errRing('year')}
                >
                  <option value="">Year</option>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </fieldset>

            <fieldset>
              <legend className={label}>
                How hard was it?{optional} <span className="font-normal text-ink-2">· {DIFFICULTY_LABEL[formData.difficulty]}</span>
              </legend>
              <div className="grid grid-cols-5 gap-1 p-1 rounded-[10px] bg-fill" role="radiogroup">
                {[1, 2, 3, 4, 5].map(n => {
                  const on = formData.difficulty === n
                  return (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={`${n}, ${DIFFICULTY_LABEL[n]}`}
                      onClick={() => set({ difficulty: on ? 0 : n })}
                      className={`h-9 rounded-[7px] text-[15px] font-semibold tabular-nums transition-colors ${
                        on ? 'bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-ink-2 hover:text-ink'
                      }`}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
              <div className="flex justify-between text-[12px] text-ink-3 mt-1 px-1">
                <span>Very easy</span><span>Very hard</span>
              </div>
            </fieldset>

            <button type="button" onClick={handleNext} className="w-full h-11 rounded-[10px] bg-accent text-accent-ink text-[16px] font-semibold">
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="xf-story" className={label}>How did entry go?</label>
              <textarea
                id="xf-story"
                value={formData.entryExperience}
                onChange={e => set({ entryExperience: e.target.value })}
                placeholder="Documents they asked for, questions at the border, how long it took"
                rows={5}
                className={area}
              />
              <p className="text-[12px] text-ink-3 mt-1">At least 20 characters. Please leave out links.</p>
            </div>

            <div>
              <label htmlFor="xf-tips" className={label}>Tips for the next holder{optional}</label>
              <textarea
                id="xf-tips"
                value={formData.tips}
                onChange={e => set({ tips: e.target.value })}
                placeholder="What you wish you had known before"
                rows={2}
                className={area}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="xf-time" className={label}>Processing time{optional}</label>
                <input id="xf-time" type="text" value={formData.processingTime} onChange={e => set({ processingTime: e.target.value })} placeholder="e.g. 2 weeks" className={field} />
              </div>
              <div>
                <label htmlFor="xf-name" className={label}>Display name{optional}</label>
                <input id="xf-name" type="text" value={formData.authorName} onChange={e => set({ authorName: e.target.value })} placeholder="Anonymous" className={field} />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasGreenCard}
                onChange={e => set({ hasGreenCard: e.target.checked })}
                className="w-5 h-5 rounded accent-[rgb(var(--accent))]"
              />
              <span className="text-[15px] text-ink">I had a US green card when I traveled</span>
            </label>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => { setNotice(null); setStep(1) }} className="h-11 px-4 rounded-[10px] bg-fill text-ink text-[16px] font-semibold">
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-[10px] bg-accent text-accent-ink text-[16px] font-semibold disabled:opacity-60 disabled:cursor-wait"
              >
                {isSubmitting ? 'Posting…' : 'Post report'}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  )
}

export default ExperienceForm
