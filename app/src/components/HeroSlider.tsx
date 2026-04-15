'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface HeroMedia {
  id: string
  url: string
  type: 'image' | 'video'
  altText?: string
}

const FALLBACK_MEDIA: HeroMedia[] = [
  {
    id: 'fallback-1',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    type: 'image',
    altText: 'Mountain landscape',
  },
  {
    id: 'fallback-2',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
    type: 'image',
    altText: 'Forest sunrise',
  },
  {
    id: 'fallback-3',
    url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80',
    type: 'image',
    altText: 'Ocean coast',
  },
]

export function HeroSlider() {
  const [media, setMedia] = useState<HeroMedia[]>(FALLBACK_MEDIA)
  const [current, setCurrent] = useState(0)

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/hero-media')
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) setMedia(data)
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % media.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [media.length])

  const item = media[current]

  return (
    <div className="hero" id="hero-slider">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          className="hero-media"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {item.type === 'video' ? (
            <video
              src={item.url}
              autoPlay
              muted
              loop
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Image
              src={item.url}
              alt={item.altText || 'Hero image'}
              fill
              style={{ objectFit: 'cover' }}
              priority
              unoptimized
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="hero-overlay" />

      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h1 className="hero-title">ytoo.studio</h1>
        <p className="hero-subtitle">攝影・旅遊・生活記錄</p>
      </motion.div>

      {/* Slide indicators */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        zIndex: 3,
      }}>
        {media.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: 4,
              border: 'none',
              background: i === current ? '#fff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 300ms',
              padding: 0,
            }}
            id={`hero-dot-${i}`}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <motion.div
        style={{
          position: 'absolute', bottom: 80, right: 40, zIndex: 3,
          color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          writingMode: 'vertical-rl',
        }}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        Scroll
      </motion.div>
    </div>
  )
}
