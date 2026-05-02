import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/travel — list all visited countries (public)
export async function GET() {
  const countries = await prisma.visitedCountry.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(countries)
}

// POST /api/travel — add visited country (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { countryCode, name, nameEn, color, cities, sortOrder } = body

  const country = await prisma.visitedCountry.create({
    data: {
      countryCode: countryCode.toUpperCase(),
      name,
      nameEn,
      color: color || '#c8a882',
      cities: cities || [],
      sortOrder: sortOrder || 0,
    },
  })

  return NextResponse.json(country, { status: 201 })
}
