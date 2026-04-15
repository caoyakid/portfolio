import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/posts — list posts (admin sees all, visitors see only public)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.isAdmin === true

  const { searchParams } = new URL(req.url)
  const categorySlug = searchParams.get('category')
  const tag = searchParams.get('tag')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const where: any = {}

  if (!isAdmin) {
    where.status = 'public'
  }

  if (categorySlug) {
    where.category = { slug: categorySlug }
  }

  if (tag) {
    where.tags = { has: tag }
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ])

  return NextResponse.json({ posts, total, page, limit })
}

// POST /api/posts — create post (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, titleEn, slug, body: postBody, coverImageUrl, status, categoryId, tags } = body

  const post = await prisma.post.create({
    data: {
      title,
      titleEn,
      slug,
      body: postBody,
      coverImageUrl,
      status: status || 'public',
      categoryId: categoryId || null,
      tags: tags || [],
    },
  })

  return NextResponse.json(post, { status: 201 })
}
