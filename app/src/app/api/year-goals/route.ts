import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/year-goals — list all year goals (public)
export async function GET() {
  const goals = await prisma.yearGoal.findMany({
    orderBy: { year: 'desc' },
  })
  return NextResponse.json(goals)
}

// POST /api/year-goals — create or upsert year goal (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { year, content, contentEn } = body

  const goal = await prisma.yearGoal.upsert({
    where: { year },
    update: { content, contentEn },
    create: { year, content, contentEn },
  })

  return NextResponse.json(goal)
}
