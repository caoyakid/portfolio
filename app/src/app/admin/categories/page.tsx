'use client'

import { useState, useEffect, useCallback } from 'react'
import { slugify } from '@/lib/utils'

interface Category {
  id: string
  name: string
  nameEn: string
  slug: string
  sortOrder: number
  parentId?: string
  children?: Category[]
}

function CategoryRow({ cat, depth = 0, onDelete, onEdit }: {
  cat: Category
  depth?: number
  onDelete: (id: string) => void
  onEdit: (cat: Category) => void
}) {
  return (
    <>
      <tr>
        <td style={{ paddingLeft: `${16 + depth * 24}px` }}>
          <span style={{ marginRight: 8, opacity: 0.3 }}>{'└'.repeat(depth)}</span>
          <span style={{ fontWeight: depth === 0 ? 600 : 400 }}>{cat.name}</span>
        </td>
        <td>{cat.nameEn}</td>
        <td><code style={{ fontSize: '0.8rem', background: 'var(--color-bg-alt)', padding: '2px 6px', borderRadius: 4 }}>{cat.slug}</code></td>
        <td>{cat.sortOrder}</td>
        <td>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm btn-secondary" onClick={() => onEdit(cat)} id={`edit-cat-${cat.id}`}>編輯</button>
            <button className="btn btn-sm btn-danger" onClick={() => onDelete(cat.id)} id={`delete-cat-${cat.id}`}>刪除</button>
          </div>
        </td>
      </tr>
      {cat.children?.map(child => (
        <CategoryRow key={child.id} cat={child} depth={depth + 1} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </>
  )
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', nameEn: '', slug: '', parentId: '', sortOrder: '0' })
  const [saving, setSaving] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', nameEn: '', slug: '', parentId: '', sortOrder: '0' })
    setShowForm(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({
      name: cat.name,
      nameEn: cat.nameEn,
      slug: cat.slug,
      parentId: cat.parentId || '',
      sortOrder: String(cat.sortOrder),
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...form,
      sortOrder: parseInt(form.sortOrder),
      parentId: form.parentId || null,
    }

    if (editing) {
      await fetch(`/api/categories/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    setShowForm(false)
    await fetchCategories()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此分類？')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    await fetchCategories()
  }

  // Flat list for parent selector
  const flatCats: Category[] = []
  const flatten = (cats: Category[]) => cats.forEach(c => { flatCats.push(c); if (c.children) flatten(c.children) })
  flatten(categories)

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">分類管理</h1>
        <button className="btn btn-primary" onClick={openNew} id="add-cat-btn">+ 新增分類</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? '編輯分類' : '新增分類'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)} id="close-cat-modal">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-name">名稱（中文）</label>
                <input id="cat-name" className="form-input" required value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: p.slug || slugify(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-name-en">Name (English)</label>
                <input id="cat-name-en" className="form-input" required value={form.nameEn}
                  onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-slug">Slug</label>
                <input id="cat-slug" className="form-input" required value={form.slug}
                  onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-parent">父分類</label>
                <select id="cat-parent" className="form-select" value={form.parentId}
                  onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}>
                  <option value="">— 頂層分類 —</option>
                  {flatCats.filter(c => c.id !== editing?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-order">排序</label>
                <input id="cat-order" type="number" className="form-input" value={form.sortOrder}
                  onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} id="cancel-cat-btn">取消</button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="save-cat-btn">
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
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>名稱</th>
                <th>英文名</th>
                <th>Slug</th>
                <th>排序</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 40 }}>尚無分類</td></tr>
              ) : categories.map(cat => (
                <CategoryRow key={cat.id} cat={cat} onDelete={handleDelete} onEdit={openEdit} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
