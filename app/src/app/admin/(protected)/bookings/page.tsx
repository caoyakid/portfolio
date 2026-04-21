'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import { formatDate } from '@/lib/utils'

interface Booking {
  id: string
  name: string
  email: string
  reason: string
  status: string
  createdAt: string
  timeSlot: {
    date: string
    startTime: string
    endTime: string
  }
}

export default function AdminBookingsPage() {
  const { t } = useI18n()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    const params = filter !== 'all' ? `?status=${filter}` : ''
    const res = await fetch(`/api/bookings${params}`)
    const data = await res.json()
    setBookings(data)
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchBookings()
    setUpdating(null)
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">{t('admin.bookings')}</h1>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['all', 'pending', 'confirmed', 'rejected'].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}
            id={`filter-${f}`}
          >
            {f === 'all' ? '全部' : t(`common.status.${f}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>Email</th>
                <th>日期</th>
                <th>時段</th>
                <th>原因</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 40 }}>
                    尚無預訂
                  </td>
                </tr>
              ) : bookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 500 }}>{b.name}</td>
                  <td style={{ fontSize: '0.8rem' }}>{b.email}</td>
                  <td>{new Date(b.timeSlot.date).toLocaleDateString('zh-TW')}</td>
                  <td>{b.timeSlot.startTime} – {b.timeSlot.endTime}</td>
                  <td style={{ maxWidth: 200, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {b.reason.slice(0, 60)}{b.reason.length > 60 ? '…' : ''}
                  </td>
                  <td><span className={`badge badge-${b.status}`}>{t(`common.status.${b.status}`)}</span></td>
                  <td>
                    {b.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => updateStatus(b.id, 'confirmed')}
                          disabled={updating === b.id}
                          id={`confirm-${b.id}`}
                        >確認</button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => updateStatus(b.id, 'rejected')}
                          disabled={updating === b.id}
                          id={`reject-${b.id}`}
                        >拒絕</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
