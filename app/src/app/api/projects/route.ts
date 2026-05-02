import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/projects — list projects (public)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const year = searchParams.get('year')
  const status = searchParams.get('status')

  const where: any = {}
  if (year) where.year = parseInt(year)
  if (status) where.status = status

  const projects = await prisma.project.findMany({
    where,
    include: { category: true },
    orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(projects)
}

// POST /api/projects — create project (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, titleEn, description, status, year, startDate, endDate, coverUrl, categoryId, sortOrder } = body

  const project = await prisma.project.create({
    data: {
      title,
      titleEn,
      description,
      status: status || 'todo',
      year: year || new Date().getFullYear(),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      coverUrl,
      categoryId: categoryId || null,
      sortOrder: sortOrder || 0,
    },
  })

  return NextResponse.json(project, { status: 201 })
}
