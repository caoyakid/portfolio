import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/timeslots?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get('date')

  if (dateStr) {
    const date = new Date(dateStr)
    const slots = await prisma.timeSlot.findMany({
      where: { date },
      include: { bookings: true },
      orderBy: { startTime: 'asc' },
    })
    return NextResponse.json(slots)
  }

  // Get all available slots  
  const slots = await prisma.timeSlot.findMany({
    where: { status: 'available' },
    include: { bookings: true },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  })

  return NextResponse.json(slots)
}

// POST /api/timeslots — admin creates time slots
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { date, startTime, endTime, status } = body

  const slot = await prisma.timeSlot.create({
    data: {
      date: new Date(date),
      startTime,
      endTime,
      status: status || 'available',
    },
  })

  return NextResponse.json(slot, { status: 201 })
}
