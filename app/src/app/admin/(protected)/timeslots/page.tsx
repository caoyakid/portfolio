'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'

interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  bookings: { id: string; name: string }[]
}

export default function AdminTimeslotsPage() {
  const { t } = useI18n()
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: '', startTime: '09:00', endTime: '10:00', status: 'available' })
  const [saving, setSaving] = useState(false)

  const fetchSlots = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/timeslots')
    const data = await res.json()
    setSlots(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  const createSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/timeslots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setShowForm(false)
    setForm({ date: '', startTime: '09:00', endTime: '10:00', status: 'available' })
    await fetchSlots()
    setSaving(false)
  }

  const updateSlotStatus = async (id: string, status: string) => {
    await fetch(`/api/timeslots/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchSlots()
  }

  const deleteSlot = async (id: string) => {
    if (!confirm('確定刪除此時段？')) return
    await fetch(`/api/timeslots/${id}`, { method: 'DELETE' })
    await fetchSlots()
  }

  // Group by date
  const grouped = slots.reduce((acc, slot) => {
    const date = new Date(slot.date).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' })
    if (!acc[date]) acc[date] = []
    acc[date].push(slot)
    return acc
  }, {} as Record<string, TimeSlot[]>)

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">{t('admin.timeslots')}</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} id="add-slot-btn">
          + 新增時段
        </button>
      </div>

      {/* Add slot modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">新增時段</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)} id="close-slot-modal">✕</button>
            </div>
            <form onSubmit={createSlot}>
              <div className="form-group">
                <label className="form-label" htmlFor="slot-date">日期</label>
                <input id="slot-date" type="date" className="form-input" required value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="slot-start">開始時間</label>
                  <input id="slot-start" type="time" className="form-input" required value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="slot-end">結束時間</label>
                  <input id="slot-end" type="time" className="form-input" required value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="slot-status">狀態</label>
                <select id="slot-status" className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="available">可預訂</option>
                  <option value="unavailable">不可預訂</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} id="cancel-slot-btn">取消</button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="save-slot-btn">
                  {saving ? '儲存中…' : '儲存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--color-text-muted)' }}>
          <p>尚無時段</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {Object.entries(grouped).map(([date, dateSlots]) => (
            <div key={date} className="card">
              <div className="card-body" style={{ paddingBottom: 0 }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', marginBottom: 16 }}>{date}</h4>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>時段</th>
                    <th>狀態</th>
                    <th>預訂</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {dateSlots.map(slot => (
                    <tr key={slot.id}>
                      <td style={{ fontWeight: 500 }}>{slot.startTime} – {slot.endTime}</td>
                      <td><span className={`badge badge-${slot.status}`}>{t(`common.status.${slot.status}`)}</span></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {slot.bookings.length > 0 ? slot.bookings.map(b => b.name).join(', ') : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => updateSlotStatus(slot.id, slot.status === 'available' ? 'unavailable' : 'available')}
                            id={`toggle-slot-${slot.id}`}
                          >
                            {slot.status === 'available' ? '設為不可用' : '設為可用'}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteSlot(slot.id)}
                            id={`delete-slot-${slot.id}`}
                          >刪除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
