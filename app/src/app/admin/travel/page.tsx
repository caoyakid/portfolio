'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'

interface City {
  name: string
  nameEn: string
  lat?: number
  lng?: number
  landmark?: string
}

interface VisitedCountry {
  id: string
  countryCode: string
  name: string
  nameEn: string
  color: string
  cities: City[]
  sortOrder: number
}

export default function AdminTravelPage() {
  const { t } = useI18n()
  const [countries, setCountries] = useState<VisitedCountry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formCode, setFormCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formNameEn, setFormNameEn] = useState('')
  const [formColor, setFormColor] = useState('#c8a882')
  const [formCities, setFormCities] = useState<City[]>([])
  const [saving, setSaving] = useState(false)

  const fetchCountries = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/travel')
      const data = await res.json()
      setCountries(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCountries() }, [])

  const resetForm = () => {
    setFormCode('')
    setFormName('')
    setFormNameEn('')
    setFormColor('#c8a882')
    setFormCities([])
    setEditingId(null)
    setShowForm(false)
  }

  const openEdit = (c: VisitedCountry) => {
    setFormCode(c.countryCode)
    setFormName(c.name)
    setFormNameEn(c.nameEn)
    setFormColor(c.color)
    setFormCities(c.cities as City[])
    setEditingId(c.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        countryCode: formCode,
        name: formName,
        nameEn: formNameEn,
        color: formColor,
        cities: formCities,
      }

      if (editingId) {
        await fetch(`/api/travel/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch('/api/travel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      resetForm()
      fetchCountries()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除嗎？')) return
    await fetch(`/api/travel/${id}`, { method: 'DELETE' })
    fetchCountries()
  }

  const addCity = () => {
    setFormCities([...formCities, { name: '', nameEn: '', landmark: '' }])
  }

  const updateCity = (index: number, field: keyof City, value: string | number) => {
    const updated = [...formCities]
    ;(updated[index] as any)[field] = value
    setFormCities(updated)
  }

  const removeCity = (index: number) => {
    setFormCities(formCities.filter((_, i) => i !== index))
  }

  const PRESET_COLORS = [
    '#c8a882', '#5a8a7e', '#c47474', '#7e8ac4',
    '#c4a05a', '#8a5a7e', '#5a8a5a', '#c47e5a',
  ]

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">旅行管理 Travel Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => { resetForm(); setShowForm(true) }}
        >
          + 新增國家
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? '編輯國家' : '新增國家'}</h2>
              <button className="btn btn-ghost" onClick={resetForm}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">國家代碼 Country Code (ISO Alpha-2)</label>
              <input
                className="form-input"
                placeholder="e.g. JP, TW, FR"
                value={formCode}
                onChange={e => setFormCode(e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">中文名稱</label>
                <input
                  className="form-input"
                  placeholder="e.g. 日本"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">English Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Japan"
                  value={formNameEn}
                  onChange={e => setFormNameEn(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">地圖顏色 Map Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setFormColor(c)}
                    style={{
                      width: 28, height: 28,
                      borderRadius: '50%',
                      background: c,
                      border: formColor === c ? '3px solid var(--color-accent)' : '2px solid var(--color-border)',
                      cursor: 'pointer',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={formColor}
                  onChange={e => setFormColor(e.target.value)}
                  style={{ width: 28, height: 28, border: 'none', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formColor}</span>
              </div>
            </div>

            {/* Cities */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">城市 Cities</label>
                <button className="btn btn-ghost btn-sm" onClick={addCity}>+ 新增城市</button>
              </div>

              {formCities.map((city, i) => (
                <div key={i} style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 12,
                  marginTop: 8,
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 8 }}>
                    <input
                      className="form-input"
                      placeholder="中文名"
                      value={city.name}
                      onChange={e => updateCity(i, 'name', e.target.value)}
                    />
                    <input
                      className="form-input"
                      placeholder="English"
                      value={city.nameEn}
                      onChange={e => updateCity(i, 'nameEn', e.target.value)}
                    />
                    <input
                      className="form-input"
                      placeholder="🗼"
                      value={city.landmark || ''}
                      onChange={e => updateCity(i, 'landmark', e.target.value)}
                      style={{ width: 56, textAlign: 'center' }}
                    />
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeCity(i)}
                      style={{ color: 'var(--color-error)' }}
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={resetForm}>取消</button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || !formCode || !formName || !formNameEn}
              >
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Country list */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>
      ) : countries.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 0',
          color: 'var(--color-text-muted)',
        }}>
          <p>尚未新增任何國家</p>
          <p style={{ fontSize: '0.875rem', marginTop: 8 }}>
            點擊「新增國家」開始標記你去過的地方
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {countries.map(c => (
            <div key={c.id} className="card" style={{ padding: 0 }}>
              <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{
                      width: 14, height: 14,
                      borderRadius: '50%',
                      background: c.color,
                      display: 'inline-block',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                      {c.name} ({c.countryCode})
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                      {c.nameEn}
                    </span>
                  </div>
                  {(c.cities as City[]).length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(c.cities as City[]).map((city, i) => (
                        <span key={i} className="city-tag">
                          {city.landmark || '📍'} {city.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>
                    {t('common.edit')}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-error)' }}
                    onClick={() => handleDelete(c.id)}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
