import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/posts/[slug]
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.isAdmin === true

  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
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
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const post = await prisma.post.update({
    where: { slug: params.slug },
    data: body,
  })

  return NextResponse.json(post)
}

// DELETE /api/posts/[slug]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.post.delete({ where: { slug: params.slug } })

  return NextResponse.json({ success: true })
}
