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

function CategoryTree({ categories }: { categories: Category[] }) {
  const { locale } = useI18n()

  const flatCategories = categories.reduce((acc, cat) => {
    return [...acc, cat, ...(cat.children ? cat.children : [])]
  }, [] as Category[])

  const colors = [
    { bg: '#E3F2FD', text: '#1565C0' },
    { bg: '#F3E5F5', text: '#6A1B9A' },
    { bg: '#E8F5E9', text: '#2E7D32' },
    { bg: '#FFF3E0', text: '#EF6C00' },
    { bg: '#FFEBEE', text: '#C62828' },
    { bg: '#FBE9E7', text: '#D84315' },
    { bg: '#E0F2F1', text: '#00695C' }
  ]

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 24px' }}>
      {flatCategories.map((cat, i) => {
        const color = colors[i % colors.length]
        return (
          <Link
            key={cat.id}
            href={`/posts?category=${cat.slug}`}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 500,
              backgroundColor: color.bg,
              color: color.text,
              borderRadius: 'var(--radius-full)',
              textDecoration: 'none',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            #{locale === 'zh' ? cat.name : cat.nameEn}
          </Link>
        )
      })}
    </div>
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
    } catch { }
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
        }}
        id="mobile-menu-btn"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <nav className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo & About */}
        <div className="sidebar-logo">
          <a
            href="https://www.instagram.com/ytt._.oo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#ig-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f09433" />
                  <stop offset="25%" stopColor="#e6683c" />
                  <stop offset="50%" stopColor="#dc2743" />
                  <stop offset="75%" stopColor="#cc2366" />
                  <stop offset="100%" stopColor="#bc1888" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            ytt._.oo
          </a>
          
          <div className="sidebar-about" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 500 }}>{t('sidebar.about.role')}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>{t('home.hero.subtitle')}</div>
          </div>
        </div>

        <div className="sidebar-nav">
          {/* Main nav */}
          <div className="sidebar-section">
            {navLink('/', t('nav.home'), (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            ))}
            {navLink('/posts', t('nav.posts'), (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            ))}
            {navLink('/projects', t('nav.projects'), (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            ))}
          </div>

          {/* Projects sub-nav */}
          {pathname.startsWith('/projects') && (
            <div className="sidebar-section" style={{ paddingLeft: 'var(--spacing-md)' }}>
              <Link
                href="/projects/archive"
                className={`sidebar-link ${pathname === '/projects/archive' ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
                style={{ paddingLeft: 24 }}
              >
                <span style={{ fontSize: '0.85rem' }}>📁 {t('projects.archive')}</span>
              </Link>
              <Link
                href="/projects/mindset"
                className={`sidebar-link ${pathname === '/projects/mindset' ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
                style={{ paddingLeft: 24 }}
              >
                <span style={{ fontSize: '0.85rem' }}>💡 {t('projects.mindset')}</span>
              </Link>
              <Link
                href="/projects/evolution"
                className={`sidebar-link ${pathname === '/projects/evolution' ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
                style={{ paddingLeft: 24 }}
              >
                <span style={{ fontSize: '0.85rem' }}>🚀 {t('projects.evolution')}</span>
              </Link>
            </div>
          )}

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
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
              ))}
              {navLink('/admin/posts', t('admin.posts'), (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ))}
              {navLink('/admin/bookings', t('admin.bookings'), (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              ))}
              {navLink('/admin/timeslots', t('admin.timeslots'), (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              ))}
              {navLink('/admin/categories', t('admin.categories'), (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              ))}
              {navLink('/admin/travel', t('admin.travel'), (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ))}
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="sidebar-bottom">
          {/* Language toggle moved to fixed bottom-right */}

          {session ? (
            <button
              className="sidebar-link btn-ghost"
              onClick={() => signOut()}
              style={{ width: '100%', border: 'none', cursor: 'pointer' }}
              id="logout-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>{t('nav.logout')}</span>
            </button>
          ) : (
            <Link href="/login" className="sidebar-link" id="login-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>{t('nav.login')}</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Floating Language Switcher */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        display: 'flex',
        gap: 4,
        background: 'rgba(250, 250, 249, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '6px',
        borderRadius: 'var(--radius-full)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-border)',
      }}>
        {(['zh', 'en', 'ja', 'ko'] as Locale[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setLocale(lang)}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: locale === lang ? 600 : 400,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: locale === lang ? 'var(--color-text-primary)' : 'transparent',
              color: locale === lang ? 'var(--color-surface)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {lang === 'zh' ? '中' : lang === 'en' ? 'EN' : lang === 'ja' ? '日' : '한'}
          </button>
        ))}
      </div>
    </>
  )
}
