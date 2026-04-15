'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TiptapEditor } from '@/components/TiptapEditor'
import { slugify } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
}

export default function NewPostPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    title: '',
    titleEn: '',
    slug: '',
    body: '',
    coverImageUrl: '',
    status: 'public',
    categoryId: '',
    tags: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => {
      const flat: Category[] = []
      const flatten = (cats: any[]) => cats.forEach(c => { flat.push(c); if (c.children) flatten(c.children) })
      flatten(data)
      setCategories(flat)
    })
  }, [])

  const handleTitleChange = (title: string) => {
    setForm(p => ({ ...p, title, slug: p.slug || slugify(title) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          categoryId: form.categoryId || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '儲存失敗')
      }

      router.push('/admin/posts')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">新增文章</h1>
      </div>

      {error && (
        <div style={{
          background: '#f5e8e8', color: 'var(--color-error)',
          padding: '12px 16px', borderRadius: 8, marginBottom: 24,
        }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
          {/* Main content */}
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="post-title">標題（中文）</label>
              <input
                id="post-title"
                className="form-input"
                required
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="文章標題"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="post-title-en">Title (English)</label>
              <input
                id="post-title-en"
                className="form-input"
                value={form.titleEn}
                onChange={e => setForm(p => ({ ...p, titleEn: e.target.value }))}
                placeholder="Optional English title"
              />
            </div>
            <div className="form-group">
              <label className="form-label">內容</label>
              <TiptapEditor
                content={form.body}
                onChange={body => setForm(p => ({ ...p, body }))}
                placeholder="開始撰寫文章…"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card card-body" style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 16, fontFamily: 'var(--font-serif)' }}>發佈設定</h4>

              <div className="form-group">
                <label className="form-label" htmlFor="post-slug">Slug</label>
                <input
                  id="post-slug"
                  className="form-input"
                  required
                  value={form.slug}
                  onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  placeholder="post-url-slug"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="post-status">狀態</label>
                <select
                  id="post-status"
                  className="form-select"
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                >
                  <option value="public">公開</option>
                  <option value="locked">鎖定（僅管理員可見）</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="post-category">分類</label>
                <select
                  id="post-category"
                  className="form-select"
                  value={form.categoryId}
                  onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                >
                  <option value="">— 無分類 —</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="post-tags">標籤（逗號分隔）</label>
                <input
                  id="post-tags"
                  className="form-input"
                  value={form.tags}
                  onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                  placeholder="旅遊, 日本, 東京"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="post-cover">封面圖片 URL</label>
                <input
                  id="post-cover"
                  className="form-input"
                  type="url"
                  value={form.coverImageUrl}
                  onChange={e => setForm(p => ({ ...p, coverImageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              {form.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.coverImageUrl}
                  alt="Cover preview"
                  style={{ width: '100%', borderRadius: 8, marginTop: 8, aspectRatio: '16/9', objectFit: 'cover' }}
                />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                id="save-post-btn"
              >
                {saving ? '儲存中…' : '儲存文章'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.back()}
                id="cancel-post-btn"
              >取消</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
