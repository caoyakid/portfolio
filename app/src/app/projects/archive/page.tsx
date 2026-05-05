'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

interface ArchivePost {
  id: string
  title: string
  titleEn?: string
  slug: string
  coverImageUrl?: string
  type: string
  tags: string[]
  createdAt: string
}

type ArchiveTab = 'movie' | 'series' | 'book'

export default function ArchivePage() {
  const { t, locale } = useI18n()
  const [posts, setPosts] = useState<ArchivePost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ArchiveTab>('movie')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/posts?category=${activeTab}&limit=50`)
      .then(res => res.json())
      .then(data => setPosts(data.posts || []))
      .finally(() => setLoading(false))
  }, [activeTab])

  const tabs: { key: ArchiveTab; icon: string }[] = [
    { key: 'movie', icon: '🎬' },
    { key: 'series', icon: '📺' },
    { key: 'book', icon: '📚' },
  ]

  return (
    <div className="section">
      <div className="container">
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700 }}>
            {t('projects.archive')}
          </h1>
        </div>

        {/* Tabs */}
        <div className="archive-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`archive-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} {t(`archive.${tab.key}`)}
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid-posts">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 200 }} />
                <div className="card-body">
                  <div className="skeleton" style={{ height: 20, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '3rem', marginBottom: 12 }}>
              {activeTab === 'movie' ? '🎬' : activeTab === 'series' ? '📺' : '📚'}
            </p>
            <p>{locale === 'zh' ? '尚無紀錄' : 'No records yet'}</p>
          </div>
        ) : (
          <div className="grid-posts">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link href={`/posts/${post.slug}`}>
                  <article className="card archive-card">
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', overflow: 'hidden', background: 'var(--color-bg-alt)' }}>
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
                          width: '100%', height: '100%',
                          background: 'linear-gradient(135deg, #f0ede8 0%, #e8e4de 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ fontSize: '3rem', opacity: 0.3 }}>
                            {activeTab === 'movie' ? '🎬' : activeTab === 'series' ? '📺' : '📚'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="post-card-body">
                      <h3 className="post-card-title" style={{ fontSize: '1rem' }}>
                        {locale === 'zh' ? post.title : (post.titleEn || post.title)}
                      </h3>
                      {post.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                          {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} style={{
                              fontSize: '0.7rem', padding: '2px 8px',
                              background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-full)',
                              color: 'var(--color-text-muted)',
                            }}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
