'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TiptapEditor } from '@/components/TiptapEditor'
import { slugify } from '@/lib/utils'

interface Category { id: string; name: string; slug: string }

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    title: '', titleEn: '', slug: '', body: '',
    coverImageUrl: '', status: 'public', categoryId: '', tags: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${slug}`).then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([post, cats]) => {
      setForm({
        title: post.title || '',
        titleEn: post.titleEn || '',
        slug: post.slug || '',
        body: post.body || '',
        coverImageUrl: post.coverImageUrl || '',
        status: post.status || 'public',
        categoryId: post.categoryId || '',
        tags: (post.tags || []).join(', '),
      })
      const flat: Category[] = []
      const flatten = (c: any[]) => c.forEach(x => { flat.push(x); if (x.children) flatten(x.children) })
      flatten(cats)
      setCategories(flat)
      setLoading(false)
    })
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          categoryId: form.categoryId || null,
        }),
      })
      if (!res.ok) throw new Error('儲存失敗')
      router.push('/admin/posts')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">編輯文章</h1>
      </div>

      {error && <div style={{ background: '#f5e8e8', color: 'var(--color-error)', padding: '12px 16px', borderRadius: 8, marginBottom: 24 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-title">標題（中文）</label>
              <input id="edit-title" className="form-input" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-title-en">Title (English)</label>
              <input id="edit-title-en" className="form-input" value={form.titleEn} onChange={e => setForm(p => ({ ...p, titleEn: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">內容</label>
              <TiptapEditor content={form.body} onChange={body => setForm(p => ({ ...p, body }))} />
            </div>
          </div>
          <div>
            <div className="card card-body" style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 16, fontFamily: 'var(--font-serif)' }}>發佈設定</h4>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-slug">Slug</label>
                <input id="edit-slug" className="form-input" required value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-status">狀態</label>
                <select id="edit-status" className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="public">公開</option>
                  <option value="locked">鎖定</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-category">分類</label>
                <select id="edit-category" className="form-select" value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                  <option value="">— 無分類 —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-tags">標籤（逗號分隔）</label>
                <input id="edit-tags" className="form-input" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-cover">封面圖片 URL</label>
                <input id="edit-cover" className="form-input" type="url" value={form.coverImageUrl} onChange={e => setForm(p => ({ ...p, coverImageUrl: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={saving} id="save-edit-btn">
                {saving ? '儲存中…' : '儲存變更'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => router.back()} id="cancel-edit-btn">取消</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
