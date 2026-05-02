'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

interface Project {
  id: string
  title: string
  titleEn?: string
  description?: string
  status: string
  year: number
  startDate?: string
  endDate?: string
  category?: { name: string; nameEn: string }
}

interface YearGoal {
  id: string
  year: number
  content: string
  contentEn?: string
}

export default function EvolutionPage() {
  const { t, locale } = useI18n()
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.isAdmin
  const [projects, setProjects] = useState<Project[]>([])
  const [goals, setGoals] = useState<YearGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Goal editing
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalText, setGoalText] = useState('')
  const [savingGoal, setSavingGoal] = useState(false)

  useEffect(() => {
    if (!session) {
      setLoading(false)
      return
    }
    Promise.all([
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/year-goals').then(r => r.json()),
    ]).then(([projData, goalData]) => {
      setProjects(Array.isArray(projData) ? projData : [])
      setGoals(Array.isArray(goalData) ? goalData : [])
    }).finally(() => setLoading(false))
  }, [session])

  const currentGoal = useMemo(() =>
    goals.find(g => g.year === selectedYear),
    [goals, selectedYear]
  )

  const yearProjects = useMemo(() =>
    projects.filter(p => p.year === selectedYear),
    [projects, selectedYear]
  )

  const byStatus = useMemo(() => ({
    'in-progress': yearProjects.filter(p => p.status === 'in-progress'),
    'done': yearProjects.filter(p => p.status === 'done'),
    'todo': yearProjects.filter(p => p.status === 'todo'),
  }), [yearProjects])

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    projects.forEach(p => years.add(p.year))
    goals.forEach(g => years.add(g.year))
    years.add(new Date().getFullYear())
    return Array.from(years).sort((a, b) => b - a)
  }, [projects, goals])

  const handleSaveGoal = async () => {
    setSavingGoal(true)
    try {
      await fetch('/api/year-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: selectedYear, content: goalText }),
      })
      const res = await fetch('/api/year-goals')
      const data = await res.json()
      setGoals(Array.isArray(data) ? data : [])
      setEditingGoal(false)
    } finally {
      setSavingGoal(false)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return t('projects.status.todo')
      case 'in-progress': return t('projects.status.inProgress')
      case 'done': return t('projects.status.done')
      default: return status
    }
  }

  // Login required guard
  if (!session) {
    return (
      <div className="section">
        <div className="container">
          <div style={{
            textAlign: 'center', padding: '120px 0',
            color: 'var(--color-text-muted)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
            <p style={{ fontSize: '1.125rem', marginBottom: 24 }}>{t('projects.loginRequired')}</p>
            <Link href="/login" className="btn btn-primary">{t('nav.login')}</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700 }}>
            🚀 {t('projects.evolution')}
          </h1>
          {/* Year selector */}
          <div style={{ display: 'flex', gap: 6 }}>
            {availableYears.map(y => (
              <button
                key={y}
                className={`btn ${selectedYear === y ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 14px', fontSize: '0.85rem' }}
                onClick={() => setSelectedYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>Loading…</div>
        ) : (
          <>
            {/* Year Goal */}
            <div className="evolution-goal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                  🎯 {selectedYear} {t('projects.yearGoal')}
                </h3>
                {isAdmin && !editingGoal && (
                  <button className="btn btn-ghost btn-sm" onClick={() => {
                    setGoalText(currentGoal?.content || '')
                    setEditingGoal(true)
                  }}>{t('common.edit')}</button>
                )}
              </div>
              {editingGoal ? (
                <div>
                  <textarea
                    className="form-textarea"
                    value={goalText}
                    onChange={e => setGoalText(e.target.value)}
                    placeholder={locale === 'zh' ? '寫下你的年度目標...' : 'Write your year goal...'}
                    style={{ minHeight: 80 }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingGoal(false)}>{t('common.cancel')}</button>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveGoal} disabled={savingGoal}>
                      {savingGoal ? '...' : t('common.save')}
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: currentGoal ? 'var(--color-text-primary)' : 'var(--color-text-muted)', lineHeight: 1.7 }}>
                  {currentGoal
                    ? (locale === 'en' && currentGoal.contentEn ? currentGoal.contentEn : currentGoal.content)
                    : (locale === 'zh' ? '尚未設定年度目標' : 'No goal set for this year')}
                </p>
              )}
            </div>

            {/* Projects by status */}
            {(['in-progress', 'done', 'todo'] as const).map(status => {
              const statusProjects = byStatus[status]
              if (statusProjects.length === 0) return null
              return (
                <div key={status} style={{ marginTop: 40 }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, marginBottom: 20 }}>
                    {status === 'in-progress' ? '🔵' : status === 'done' ? '🟢' : '⚪'}{' '}
                    {getStatusLabel(status)}
                    <span style={{ fontWeight: 400, fontSize: '0.875rem', color: 'var(--color-text-muted)', marginLeft: 8 }}>
                      ({statusProjects.length})
                    </span>
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {statusProjects.map((p, i) => (
                      <motion.div
                        key={p.id}
                        className="card evolution-project-card"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        <div className="card-body" style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <h4 style={{ fontWeight: 600, fontSize: '1rem' }}>
                              {locale === 'en' && p.titleEn ? p.titleEn : p.title}
                            </h4>
                            {p.category && (
                              <span style={{
                                fontSize: '0.7rem', padding: '2px 8px',
                                background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-full)',
                                color: 'var(--color-text-muted)', whiteSpace: 'nowrap',
                              }}>
                                {locale === 'zh' ? p.category.name : p.category.nameEn}
                              </span>
                            )}
                          </div>
                          {p.description && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
                              {p.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
