import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/categories
export async function GET() {
  const categories = await prisma.category.findMany({
    include: {
      children: {
        include: { children: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    where: { parentId: null },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(categories)
}

// POST /api/categories
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, nameEn, slug, parentId, sortOrder } = body

  const category = await prisma.category.create({
    data: {
      name,
      nameEn,
      slug,
      parentId: parentId || null,
      sortOrder: sortOrder || 0,
    },
  })

  return NextResponse.json(category, { status: 201 })
}
