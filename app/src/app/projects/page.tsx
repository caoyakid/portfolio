'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  coverUrl?: string
  categoryId?: string
  category?: { name: string; nameEn: string; slug: string }
  sortOrder: number
}

interface Category {
  id: string
  name: string
  nameEn: string
  slug: string
}

const STATUS_ICONS: Record<string, string> = {
  'todo': '⚪',
  'in-progress': '🔵',
  'done': '🟢',
}

export default function ProjectsPage() {
  const { t, locale } = useI18n()
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.isAdmin
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showBucketList, setShowBucketList] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formTitleEn, setFormTitleEn] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formStatus, setFormStatus] = useState('todo')
  const [formYear, setFormYear] = useState(new Date().getFullYear())
  const [formStartDate, setFormStartDate] = useState('')
  const [formEndDate, setFormEndDate] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch {}
  }

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts?limit=100')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch {}
  }

  useEffect(() => {
    fetchProjects()
    fetchCategories()
    fetchPosts()
  }, [])

  // Group projects and travel posts by year
  const itemsByYear = useMemo(() => {
    const grouped: Record<number, any[]> = {}
    
    projects.forEach(p => {
      if (!grouped[p.year]) grouped[p.year] = []
      grouped[p.year].push({ ...p, isPost: false })
    })

    posts.forEach(post => {
      const year = new Date(post.createdAt).getFullYear()
      if (!grouped[year]) grouped[year] = []
      
      let icon = '📝'
      const catSlug = post.category?.slug.toLowerCase() || ''
      const catName = post.category?.name || ''
      if (catSlug.includes('travel') || catName.includes('旅遊')) icon = '✈️'
      else if (catSlug.includes('movie') || catName.includes('電影')) icon = '🎬'
      else if (catSlug.includes('book') || catName.includes('書')) icon = '📚'
      else if (catSlug.includes('mindset') || catName.includes('思維')) icon = '💡'

      grouped[year].push({
        id: `post-${post.id}`,
        title: `${icon} ${post.title}`,
        titleEn: post.titleEn ? `${icon} ${post.titleEn}` : undefined,
        status: 'done', // Treat posts as done
        year: year,
        startDate: post.createdAt,
        category: post.category,
        isPost: true,
        slug: post.slug,
        createdAt: post.createdAt
      })
    })

    return Object.entries(grouped)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .map(([year, items]) => {
        items.sort((a, b) => {
           const dateA = new Date(a.startDate || a.createdAt || 0).getTime()
           const dateB = new Date(b.startDate || b.createdAt || 0).getTime()
           return dateB - dateA
        })
        return [year, items]
      })
  }, [projects, posts])

  // Bucket list = projects with status "todo"
  const bucketList = useMemo(() =>
    projects.filter(p => p.status === 'todo'),
    [projects]
  )

  const resetForm = () => {
    setFormTitle('')
    setFormTitleEn('')
    setFormDescription('')
    setFormStatus('todo')
    setFormYear(new Date().getFullYear())
    setFormStartDate('')
    setFormEndDate('')
    setFormCategoryId('')
    setEditingId(null)
    setShowForm(false)
  }

  const openEdit = (p: Project) => {
    setFormTitle(p.title)
    setFormTitleEn(p.titleEn || '')
    setFormDescription(p.description || '')
    setFormStatus(p.status)
    setFormYear(p.year)
    setFormStartDate(p.startDate ? p.startDate.split('T')[0] : '')
    setFormEndDate(p.endDate ? p.endDate.split('T')[0] : '')
    setFormCategoryId(p.categoryId || '')
    setEditingId(p.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        title: formTitle,
        titleEn: formTitleEn || null,
        description: formDescription || null,
        status: formStatus,
        year: formYear,
        startDate: formStartDate || null,
        endDate: formEndDate || null,
        categoryId: formCategoryId || null,
      }

      if (editingId) {
        await fetch(`/api/projects/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      resetForm()
      fetchProjects()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除嗎？')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    fetchProjects()
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return t('projects.status.todo')
      case 'in-progress': return t('projects.status.inProgress')
      case 'done': return t('projects.status.done')
      default: return status
    }
  }

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700 }}>
              {t('nav.projects')}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>{t('projects.timeline')}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isAdmin && (
              <button
                className="btn btn-primary"
                onClick={() => { resetForm(); setShowForm(true) }}
              >
                + {t('projects.addProject')}
              </button>
            )}
            {isAdmin && (
              <button
                className="btn btn-secondary"
                onClick={() => setShowBucketList(true)}
                title={t('projects.bucketList')}
                style={{ padding: '0.5rem' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>Loading…</div>
        ) : itemsByYear.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '1.125rem' }}>{t('projects.noProjects')}</p>
          </div>
        ) : (
          <div className="timeline">
            {itemsByYear.map(([year, yearItems]) => (
              <div key={year as string} className="timeline-year-group">
                <div className="timeline-year-label">{year as string}</div>
                <div className="timeline-items">
                  {(yearItems as any[]).filter(p => p.status !== 'todo').map((item, i) => (
                    <motion.div
                      key={item.id}
                      className="timeline-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <div className="timeline-dot" style={{
                        background: item.isPost ? 'var(--color-accent)' : item.status === 'done' ? 'var(--color-success)' :
                                    item.status === 'in-progress' ? 'var(--color-accent-teal)' : 'var(--color-text-muted)'
                      }} />
                      <div className={`timeline-content ${item.isPost ? 'is-post' : ''}`}>
                        <div className="timeline-content-header">
                          <div>
                            <div className="timeline-title">
                              {item.isPost ? (
                                <Link href={`/posts/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit' }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>
                                  {locale === 'en' && item.titleEn ? item.titleEn : item.title}
                                </Link>
                              ) : (
                                locale === 'en' && item.titleEn ? item.titleEn : item.title
                              )}
                            </div>
                            {item.category && (
                              <span className="timeline-category">
                                {locale === 'zh' ? item.category.name : item.category.nameEn}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {!item.isPost ? (
                              <span className={`badge badge-${item.status === 'done' ? 'confirmed' : item.status === 'in-progress' ? 'pending' : 'unavailable'}`}>
                                {getStatusLabel(item.status)}
                              </span>
                            ) : (
                              <span className="badge" style={{ background: 'var(--color-bg-alt)', color: 'var(--color-text-primary)' }}>
                                {locale === 'zh' ? '文章' : 'Post'}
                              </span>
                            )}
                            {!item.isPost && isAdmin && (
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>{t('common.edit')}</button>
                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => handleDelete(item.id)}>{t('common.delete')}</button>
                              </div>
                            )}
                          </div>
                        </div>
                        {!item.isPost && item.description && (
                          <p className="timeline-description">
                            {item.description}
                          </p>
                        )}
                        <div className="timeline-dates">
                          {formatDate(item.startDate)}
                          {!item.isPost && item.startDate && ' — '}
                          {!item.isPost && (formatDate(item.endDate) || (item.startDate ? '' : ''))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bucket List Popup */}
        <AnimatePresence>
          {showBucketList && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.target === e.currentTarget && setShowBucketList(false)}
            >
              <motion.div
                className="modal"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                style={{ maxWidth: 480 }}
              >
                <div className="modal-header">
                  <h2 className="modal-title">📋 {t('projects.bucketList')}</h2>
                  <button className="btn btn-ghost" onClick={() => setShowBucketList(false)}>✕</button>
                </div>
                {bucketList.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 24 }}>
                    {t('projects.noProjects')}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {bucketList.map(p => (
                      <div key={p.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px',
                        border: '1px solid var(--color-border-light)',
                        borderRadius: 'var(--radius-md)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ opacity: 0.4 }}>○</span>
                          <span style={{ fontWeight: 500 }}>{locale === 'en' && p.titleEn ? p.titleEn : p.title}</span>
                        </div>
                        {p.category && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-alt)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                            {locale === 'zh' ? p.category.name : p.category.nameEn}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {isAdmin && (
                  <button
                    className="btn btn-secondary"
                    style={{ marginTop: 16, width: '100%' }}
                    onClick={() => { setShowBucketList(false); resetForm(); setFormStatus('todo'); setShowForm(true) }}
                  >
                    + {t('projects.addProject')}
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
            <div className="modal" style={{ maxWidth: 560 }}>
              <div className="modal-header">
                <h2 className="modal-title">{editingId ? t('common.edit') : t('projects.addProject')}</h2>
                <button className="btn btn-ghost" onClick={resetForm}>✕</button>
              </div>

              <div className="form-group">
                <label className="form-label">名稱 Title</label>
                <input className="form-input" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Portfolio Website" />
              </div>

              <div className="form-group">
                <label className="form-label">English Title</label>
                <input className="form-input" value={formTitleEn} onChange={e => setFormTitleEn(e.target.value)} placeholder="Optional" />
              </div>

              <div className="form-group">
                <label className="form-label">描述 Description</label>
                <textarea className="form-textarea" value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Optional" style={{ minHeight: 80 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">狀態 Status</label>
                  <select className="form-select" value={formStatus} onChange={e => setFormStatus(e.target.value)}>
                    <option value="todo">{t('projects.status.todo')}</option>
                    <option value="in-progress">{t('projects.status.inProgress')}</option>
                    <option value="done">{t('projects.status.done')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">年份 Year</label>
                  <input className="form-input" type="number" value={formYear} onChange={e => setFormYear(parseInt(e.target.value))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">開始日期</label>
                  <input className="form-input" type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">結束日期</label>
                  <input className="form-input" type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">分類 Category</label>
                <select className="form-select" value={formCategoryId} onChange={e => setFormCategoryId(e.target.value)}>
                  <option value="">— 無分類 —</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name} / {c.nameEn}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button className="btn btn-secondary" onClick={resetForm}>{t('common.cancel')}</button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving || !formTitle}
                >
                  {saving ? '...' : t('common.save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
