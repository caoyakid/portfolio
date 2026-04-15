import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/bookings — visitor submits booking
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, reason, timeSlotId } = body

  if (!name || !email || !reason || !timeSlotId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify the slot exists and is available
  const slot = await prisma.timeSlot.findUnique({
    where: { id: timeSlotId },
    include: { bookings: true },
  })

  if (!slot || slot.status !== 'available') {
    return NextResponse.json({ error: 'Time slot not available' }, { status: 400 })
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      name,
      email,
      reason,
      timeSlotId,
      status: 'pending',
    },
    include: { timeSlot: true },
  })

  // TODO: Implement custom email/notification workaround here
  console.log('New booking received:', booking)

  return NextResponse.json(booking, { status: 201 })
}

// GET /api/bookings — admin only
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const bookings = await prisma.booking.findMany({
    where: status ? { status } : undefined,
    include: { timeSlot: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(bookings)
}
