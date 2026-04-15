import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
  if (!post) return { title: 'Not Found' }
  return {
    title: post.title,
    description: post.body.replace(/<[^>]+>/g, '').slice(0, 150),
  }
}

export default async function PostPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.isAdmin

  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  })

  if (!post) notFound()
  if (post.status === 'locked' && !isAdmin) notFound()

  return (
    <article>
      {/* Cover image */}
      {post.coverImageUrl && (
        <div style={{ width: '100%', height: '50vh', position: 'relative', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImageUrl}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 50%, rgba(250,250,249,0.9) 100%)',
          }} />
        </div>
      )}

      <div className="container-narrow" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {/* Category */}
        {post.category && (
          <div style={{
            fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-accent-warm)', marginBottom: 16,
          }}>
            {post.category.name}
          </div>
        )}

        <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: 16, letterSpacing: '-0.02em' }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            {formatDate(post.createdAt)}
          </span>
          {post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              {post.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '0.75rem', padding: '2px 10px',
                  background: 'var(--color-bg-alt)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--color-text-secondary)',
                }}>{tag}</span>
              ))}
            </div>
          )}
          {post.status === 'locked' && (
            <span className="badge badge-locked">🔒 Locked</span>
          )}
        </div>

        <div className="divider" />

        {/* Content */}
        <div
          className="prose"
          style={{ marginTop: 40, maxWidth: '100%' }}
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Footer */}
        <div className="divider" style={{ marginTop: 60 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <span>建立：{formatDate(post.createdAt)}</span>
          <span>更新：{formatDate(post.updatedAt)}</span>
        </div>
      </div>
    </article>
  )
}
