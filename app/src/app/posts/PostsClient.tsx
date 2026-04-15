'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { SearchBar } from '@/components/SearchBar'
import { useI18n } from '@/lib/i18n'
import { formatDate } from '@/lib/utils'

interface Post {
  id: string
  title: string
  titleEn?: string
  slug: string
  coverImageUrl?: string
  status: string
  createdAt: string
  category?: { name: string; nameEn: string; slug: string }
  tags: string[]
}

export function PostsClient() {
  const { t, locale } = useI18n()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const category = searchParams.get('category')
  const query = searchParams.get('q')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      params.set('page', String(page))
      params.set('limit', '12')

      const res = await fetch(`/api/posts?${params}`)
      const data = await res.json()
      setPosts(data.posts || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }, [category, page])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return (
    <div>
      {/* Page hero */}
      <div className="page-hero">
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: 8 }}>{t('posts.title')}</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>{t('posts.subtitle')}</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
        {/* Search + filter bar */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <SearchBar />
          </div>
        </div>

        {loading ? (
          <div className="grid-posts">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 200 }} />
                <div className="card-body">
                  <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 20, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '1.125rem' }}>{t('posts.empty')}</p>
          </div>
        ) : (
          <>
            <div className="grid-posts">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link href={`/posts/${post.slug}`}>
                    <article className="card post-card">
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--color-bg-alt)' }}>
                        {post.coverImageUrl ? (
                          <Image
                            src={post.coverImageUrl}
                            alt={locale === 'zh' ? post.title : (post.titleEn || post.title)}
                            fill
                            style={{ objectFit: 'cover', transition: 'transform 0.4s' }}
                            className="post-card-cover-img"
                            unoptimized
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #f0ede8 0%, #e8e4de 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{ fontSize: '2.5rem', opacity: 0.4 }}>✦</span>
                          </div>
                        )}
                      </div>
                      <div className="post-card-body">
                        {post.category && (
                          <div className="post-card-category">
                            {locale === 'zh' ? post.category.name : post.category.nameEn}
                          </div>
                        )}
                        <h2 className="post-card-title" style={{ fontSize: '1.125rem' }}>
                          {locale === 'zh' ? post.title : (post.titleEn || post.title)}
                        </h2>
                        {post.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                            {post.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 8px',
                                  background: 'var(--color-bg-alt)',
                                  borderRadius: 'var(--radius-full)',
                                  color: 'var(--color-text-muted)',
                                }}
                              >{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="post-card-date">
                          {formatDate(post.createdAt, locale === 'zh' ? 'zh-TW' : locale === 'ja' ? 'ja-JP' : locale === 'ko' ? 'ko-KR' : 'en-US')}
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {total > 12 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
              <button
                  className="btn btn-secondary"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  id="prev-page"
                >{t('posts.prev')}</button>
                <button
                  className="btn btn-secondary"
                  disabled={page * 12 >= total}
                  onClick={() => setPage(p => p + 1)}
                  id="next-page"
                >{t('posts.next')}</button>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  )
}
