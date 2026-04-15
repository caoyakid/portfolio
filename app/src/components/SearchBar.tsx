'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

interface SearchResult {
  id: string
  title: string
  titleEn?: string
  slug: string
  category?: { name: string; nameEn: string; slug: string }
  createdAt: string
}

export function SearchBar() {
  const { t, locale } = useI18n()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="search-bar" ref={ref} style={{ maxWidth: 400, position: 'relative' }}>
      <div className="search-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <input
        id="search-input"
        type="text"
        className="search-input"
        placeholder={t('posts.search')}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && query.trim()) {
            window.location.href = `/posts?q=${encodeURIComponent(query)}`
          }
        }}
      />
      {open && query && (
        <div className="search-dropdown">
          {loading ? (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              無結果
            </div>
          ) : (
            results.map((r) => (
              <Link
                key={r.id}
                href={`/posts/${r.slug}`}
                className="search-result-item"
                onClick={() => setOpen(false)}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {locale === 'zh' ? r.title : (r.titleEn || r.title)}
                  </div>
                  {r.category && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {locale === 'zh' ? r.category.name : r.category.nameEn}
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
