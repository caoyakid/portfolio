'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useI18n, type Locale } from '@/lib/i18n'

interface Category {
  id: string
  name: string
  nameEn: string
  slug: string
  children?: Category[]
}

function CategoryTree({ categories, depth = 0 }: { categories: Category[]; depth?: number }) {
  const { locale } = useI18n()
  const pathname = usePathname()

  return (
    <>
      {categories.map((cat) => (
        <div key={cat.id}>
          <Link
            href={`/posts?category=${cat.slug}`}
            className={`sidebar-link ${pathname === `/posts` ? '' : ''}`}
            style={{ paddingLeft: `${(depth + 1) * 16}px` }}
          >
            <span>{locale === 'zh' ? cat.name : cat.nameEn}</span>
          </Link>
          {cat.children && cat.children.length > 0 && (
            <CategoryTree categories={cat.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </>
  )
}

export function Sidebar() {
  const { t, locale, setLocale } = useI18n()
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.isAdmin
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch {}
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const navLink = (href: string, label: string, icon: React.ReactNode) => (
    <Link
      href={href}
      className={`sidebar-link ${pathname === href ? 'active' : ''}`}
      onClick={() => setMobileOpen(false)}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 150,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8, padding: '8px',
          display: 'none',
        }}
        id="mobile-menu-btn"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <nav className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            ytoo<span>.</span>studio
          </Link>
        </div>

        <div className="sidebar-nav">
          {/* Main nav */}
          <div className="sidebar-section">
            {navLink('/', t('nav.home'), (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            ))}
            {navLink('/posts', t('nav.posts'), (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            ))}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-section-label">{t('nav.categories')}</div>
              <CategoryTree categories={categories} />
            </div>
          )}

          {/* Admin */}
          {isAdmin && (
            <div className="sidebar-section">
              <div className="sidebar-section-label">{t('nav.manage')}</div>
              {navLink('/admin', t('admin.dashboard'), (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              ))}
              {navLink('/admin/posts', t('admin.posts'), (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              ))}
              {navLink('/admin/bookings', t('admin.bookings'), (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              ))}
              {navLink('/admin/timeslots', t('admin.timeslots'), (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              ))}
              {navLink('/admin/categories', t('admin.categories'), (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              ))}
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="sidebar-bottom">
          {/* Language toggle */}
          <div className="lang-toggle" style={{ marginBottom: 12 }}>
            {(['zh', 'en', 'ja', 'ko'] as Locale[]).map((lang) => (
              <button
                key={lang}
                className={`lang-btn ${locale === lang ? 'active' : ''}`}
                onClick={() => setLocale(lang)}
                id={`lang-${lang}`}
              >
                {lang === 'zh' ? '中' : lang === 'en' ? 'EN' : lang === 'ja' ? '日' : '한'}
              </button>
            ))}
          </div>

          {session ? (
            <button
              className="sidebar-link btn-ghost"
              onClick={() => signOut()}
              style={{ width: '100%', border: 'none', cursor: 'pointer' }}
              id="logout-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>{t('nav.logout')}</span>
            </button>
          ) : (
            <Link href="/admin/login" className="sidebar-link" id="login-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <span>{t('nav.login')}</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}
