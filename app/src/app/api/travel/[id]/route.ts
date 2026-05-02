import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT /api/travel/[id] — update visited country (admin only)
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
  const { countryCode, name, nameEn, color, cities, sortOrder } = body

  const country = await prisma.visitedCountry.update({
    where: { id },
    data: {
      ...(countryCode && { countryCode: countryCode.toUpperCase() }),
      ...(name && { name }),
      ...(nameEn && { nameEn }),
      ...(color && { color }),
      ...(cities !== undefined && { cities }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  })

  return NextResponse.json(country)
}

// DELETE /api/travel/[id] — remove visited country (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  await prisma.visitedCountry.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
