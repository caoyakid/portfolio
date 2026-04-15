'use client'

import { HeroSlider } from '@/components/HeroSlider'
import { BookingCalendar } from '@/components/BookingCalendar'
import { useI18n } from '@/lib/i18n'

export default function HomePage() {
  const { t } = useI18n()

  return (
    <>
      <HeroSlider />

      {/* Booking section */}
      <section className="section" id="booking">
        <div className="container">
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="section-header" style={{ textAlign: 'center' }}>
              <h2 className="section-title">{t('home.booking.title')}</h2>
              <p className="section-subtitle">{t('home.booking.subtitle')}</p>
            </div>
            <BookingCalendar />
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p className="footer-text">{t('footer.copyright')}</p>
        </div>
      </footer>
    </>
  )
}
