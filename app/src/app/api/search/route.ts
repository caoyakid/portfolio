import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/search?q=keyword
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')?.trim()

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  // Simple search — title and body contain keywords (public only)
  // In production with pg_trgm enabled on Supabase, use raw SQL with similarity()
  const keywords = query.split(/\s+/).filter(Boolean)

  const posts = await prisma.post.findMany({
    where: {
      status: 'public',
      AND: keywords.map((kw) => ({
        OR: [
          { title: { contains: kw, mode: 'insensitive' } },
          { titleEn: { contains: kw, mode: 'insensitive' } },
          { body: { contains: kw, mode: 'insensitive' } },
          { tags: { has: kw } },
        ],
      })),
    },
    select: {
      id: true,
      title: true,
      titleEn: true,
      slug: true,
      coverImageUrl: true,
      createdAt: true,
      category: { select: { name: true, nameEn: true, slug: true } },
    },
    take: 20,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ results: posts, query })
}
