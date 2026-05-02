'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useI18n } from '@/lib/i18n'

interface QuotePost {
  id: string
  title: string
  titleEn?: string
  slug: string
  body: string
  coverImageUrl?: string
  createdAt: string
}

export default function MindsetPage() {
  const { t, locale } = useI18n()
  const { data: session } = useSession()
  const [posts, setPosts] = useState<QuotePost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      setLoading(false)
      return
    }
    fetch('/api/posts?type=quote&limit=50')
      .then(res => res.json())
      .then(data => setPosts(data.posts || []))
      .finally(() => setLoading(false))
  }, [session])

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
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700 }}>
            💡 {t('projects.mindset')}
          </h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>Loading…</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--color-text-muted)' }}>
            <p>{locale === 'zh' ? '尚無語錄' : 'No quotes yet'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link href={`/posts/${post.slug}`}>
                  <div className="quote-card">
                    {post.coverImageUrl ? (
                      <div style={{
                        width: '100%', borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden', marginBottom: 16,
                        maxHeight: 300,
                      }}>
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ) : null}
                    <blockquote className="quote-text">
                      {post.body.length > 200 ? post.body.slice(0, 200) + '…' : post.body}
                    </blockquote>
                    <div className="quote-title">
                      — {locale === 'zh' ? post.title : (post.titleEn || post.title)}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
