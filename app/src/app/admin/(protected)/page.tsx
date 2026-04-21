import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '後台管理' }

export default async function AdminDashboard() {
  const [postCount, bookingCount, slotCount] = await Promise.all([
    prisma.post.count(),
    prisma.booking.count({ where: { status: 'pending' } }),
    prisma.timeSlot.count({ where: { status: 'available' } }),
  ])

  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { timeSlot: true },
  })

  const stats = [
    { label: '文章總數', value: postCount, href: '/admin/posts', color: 'var(--color-accent)' },
    { label: '待確認預訂', value: bookingCount, href: '/admin/bookings', color: 'var(--color-warning)' },
    { label: '可用時段', value: slotCount, href: '/admin/timeslots', color: 'var(--color-success)' },
  ]

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">後台管理</h1>
        <Link href="/admin/posts/new" className="btn btn-primary" id="new-post-btn">
          + 新增文章
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href}>
            <div className="card card-body" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: stat.color, fontFamily: 'var(--font-serif)' }}>
                {stat.value}
              </div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)' }}>最近預訂</h3>
            <Link href="/admin/bookings" className="btn btn-ghost btn-sm">查看全部</Link>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>Email</th>
              <th>日期</th>
              <th>時段</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>尚無預訂</td></tr>
            ) : recentBookings.map(b => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.email}</td>
                <td>{new Date(b.timeSlot.date).toLocaleDateString('zh-TW')}</td>
                <td>{b.timeSlot.startTime} – {b.timeSlot.endTime}</td>
                <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
