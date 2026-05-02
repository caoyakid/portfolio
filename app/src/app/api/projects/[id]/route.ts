import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/projects/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: { category: true, posts: true },
  })

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(project)
}

// PUT /api/projects/[id] — update (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { title, titleEn, description, status, year, startDate, endDate, coverUrl, categoryId, sortOrder } = body

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(titleEn !== undefined && { titleEn }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(year !== undefined && { year }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(coverUrl !== undefined && { coverUrl }),
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  })

  return NextResponse.json(project)
}

// DELETE /api/projects/[id] — delete (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await prisma.project.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
