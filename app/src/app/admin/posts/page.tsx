'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { formatDate } from '@/lib/utils'

interface Post {
  id: string
  title: string
  slug: string
  status: string
  createdAt: string
  category?: { name: string }
  tags: string[]
}

export default function AdminPostsPage() {
  const { t } = useI18n()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    const res = await fetch('/api/posts?limit=100')
    const data = await res.json()
    setPosts(data.posts || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const deletePost = async (slug: string) => {
    if (!confirm('確定刪除這篇文章？')) return
    setDeleting(slug)
    await fetch(`/api/posts/${slug}`, { method: 'DELETE' })
    await fetchPosts()
    setDeleting(null)
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">{t('admin.posts')}</h1>
        <Link href="/admin/posts/new" className="btn btn-primary" id="new-post-btn">
          + 新增文章
        </Link>
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
                <th>標題</th>
                <th>分類</th>
                <th>狀態</th>
                <th>建立時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 40 }}>
                    尚無文章
                  </td>
                </tr>
              ) : posts.map(post => (
                <tr key={post.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{post.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{post.slug}</div>
                  </td>
                  <td>{post.category?.name || '—'}</td>
                  <td><span className={`badge badge-${post.status}`}>{t(`common.status.${post.status}`)}</span></td>
                  <td>{formatDate(post.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/posts/${post.slug}`} className="btn btn-ghost btn-sm" target="_blank" id={`view-${post.slug}`}>
                        查看
                      </Link>
                      <Link href={`/admin/posts/${post.slug}/edit`} className="btn btn-secondary btn-sm" id={`edit-${post.slug}`}>
                        編輯
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deletePost(post.slug)}
                        disabled={deleting === post.slug}
                        id={`delete-${post.slug}`}
                      >
                        {deleting === post.slug ? '…' : '刪除'}
                      </button>
                    </div>
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
