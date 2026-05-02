import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/posts/[slug]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.isAdmin === true
  const { slug } = await params

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { category: true },
  })

  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (post.status === 'locked' && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(post)
}

// PATCH /api/posts/[slug]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  const body = await req.json()

  if (body.createdAt) {
    body.createdAt = new Date(body.createdAt)
  }

  try {
    const post = await prisma.post.update({
      where: { slug },
      data: body,
    })
    return NextResponse.json(post)
  } catch (error: any) {
    console.error('Update post error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug (網址代稱) 已經存在，請換一個' }, { status: 400 })
    }
    return NextResponse.json({ error: '更新失敗，請檢查資料格式' }, { status: 500 })
  }
}

// DELETE /api/posts/[slug]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { slug } = await params

  await prisma.post.delete({ where: { slug } })

  return NextResponse.json({ success: true })
}
