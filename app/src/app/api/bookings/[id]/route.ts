import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PATCH /api/bookings/[id] — admin updates booking status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const booking = await prisma.booking.update({
    where: { id: params.id },
    data: { status: body.status },
    include: { timeSlot: true },
  })

  // If rejected, mark slot as available again
  if (body.status === 'rejected') {
    await prisma.timeSlot.update({
      where: { id: booking.timeSlotId },
      data: { status: 'available' },
    })
  }

  // If confirmed, mark slot as unavailable
  if (body.status === 'confirmed') {
    await prisma.timeSlot.update({
      where: { id: booking.timeSlotId },
      data: { status: 'unavailable' },
    })
  }

  return NextResponse.json(booking)
}
