'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'

interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  bookings: { id: string }[]
}

interface BookingFormProps {
  onSuccess?: () => void
}

export function BookingCalendar({ onSuccess }: BookingFormProps) {
  const { t, locale } = useI18n()
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const res = await fetch('/api/timeslots')
      const data = await res.json()
      setSlots(data)
    } catch {}
  }

  // Build calendar data
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const getDateSlots = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return slots.filter(s => s.date.startsWith(dateStr))
  }

  const hasAvailable = (day: number) => getDateSlots(day).some(s => s.status === 'available')

  const handleDayClick = (day: number) => {
    const daySlots = getDateSlots(day).filter(s => s.status === 'available')
    if (daySlots.length > 0) {
      setSelectedSlot(daySlots[0])
      setShowForm(true)
      setSuccess(false)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, timeSlotId: selectedSlot.id }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t('booking.error'))
      }

      setSuccess(true)
      setShowForm(false)
      setFormData({ name: '', email: '', reason: '' })
      fetchSlots()
      onSuccess?.()
    } catch (e: any) {
      setError(e.message || t('booking.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const monthNames = t('calendar.months').split(',')
  const weekDays = t('calendar.weekdays').split(',')

  return (
    <div>
      {success && (
        <div style={{
          background: '#e8f5ee',
          color: '#2d6e4a',
          padding: '16px 20px',
          borderRadius: 8,
          marginBottom: 24,
          fontSize: '0.9rem',
        }}>
          ✓ {t('home.booking.success')}
        </div>
      )}

      <div className="calendar-section">
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-dot legend-dot-available" />
            <span>{t('common.status.available')}</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-dot-unavailable" />
            <span>{t('common.status.unavailable')}</span>
          </div>
        </div>

        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
            id="prev-month"
          >←</button>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', fontWeight: 600 }}>
            {monthNames[month]} {year}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
            id="next-month"
          >→</button>
        </div>

        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {weekDays.map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: '0.75rem',
              fontWeight: 600, color: 'var(--color-text-muted)',
              padding: '4px 0',
            }}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const available = hasAvailable(day)
            const daySlots = getDateSlots(day)
            const today = new Date()
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
            const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

            return (
              <button
                key={day}
                onClick={() => !isPast && handleDayClick(day)}
                disabled={isPast || daySlots.length === 0}
                id={`calendar-day-${day}`}
                style={{
                  padding: '8px 4px',
                  borderRadius: 8,
                  border: isToday ? '2px solid var(--color-accent)' : '1px solid transparent',
                  background: available
                    ? 'rgba(90, 138, 110, 0.12)'
                    : 'transparent',
                  cursor: available && !isPast ? 'pointer' : 'default',
                  opacity: isPast ? 0.35 : 1,
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: isToday ? 700 : 400,
                  transition: 'all 150ms',
                  position: 'relative',
                }}
              >
                {day}
                {available && (
                  <div style={{
                    width: 5, height: 5,
                    borderRadius: '50%',
                    background: 'var(--color-success)',
                    margin: '2px auto 0',
                  }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showForm && selectedSlot && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('home.booking.title')}</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowForm(false)}
                id="close-booking-modal"
              >✕</button>
            </div>

            <div style={{
              background: 'var(--color-bg-alt)',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: '0.875rem',
            }}>
              📅 {new Date(selectedSlot.date).toLocaleDateString(
                locale === 'zh' ? 'zh-TW' : locale === 'ja' ? 'ja-JP' : locale === 'ko' ? 'ko-KR' : 'en-US',
                { month: 'long', day: 'numeric' }
              )}
              {'  '}⏰ {selectedSlot.startTime} – {selectedSlot.endTime}
            </div>

            {error && (
              <div style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginBottom: 12 }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="booking-name">{t('home.booking.name')}</label>
                <input
                  id="booking-name"
                  className="form-input"
                  required
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="booking-email">{t('home.booking.email')}</label>
                <input
                  id="booking-email"
                  type="email"
                  className="form-input"
                  required
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="booking-reason">{t('home.booking.reason')}</label>
                <textarea
                  id="booking-reason"
                  className="form-textarea"
                  required
                  value={formData.reason}
                  onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                  id="cancel-booking"
                >{t('common.cancel')}</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  id="submit-booking"
                >
                  {submitting ? t('booking.submitting') : t('home.booking.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
