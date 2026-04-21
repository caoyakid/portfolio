import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
)

// POST /api/upload — admin uploads media
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const supabase = getSupabase()
  let { data, error } = await supabase.storage
    .from('media')
    .upload(filename, buffer, {
      contentType: file.type,
    })

  if (error) {
    if (error.message === 'Bucket not found') {
      console.log('Bucket "media" not found. Creating it dynamically...')
      await supabase.storage.createBucket('media', { public: true })
      // Retry upload after creating the bucket
      const retryResult = await supabase.storage
        .from('media')
        .upload(filename, buffer, { contentType: file.type })
      
      error = retryResult.error
      data = retryResult.data as any
    }
    
    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filename)

  return NextResponse.json({ url: publicUrl, path: data!.path })
}
