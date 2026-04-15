import { Suspense } from 'react'
import { PostsClient } from './PostsClient'

export default function PostsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>}>
      <PostsClient />
    </Suspense>
  )
}
