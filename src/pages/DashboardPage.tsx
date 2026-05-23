import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../App'
import { Icon } from '../components/Icon'

export function DashboardPage() {
  const { admin } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/members/stats').then(setStats).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const CARDS = [
    { label: 'Tổng thành viên', value: stats?.total     || 0, icon: 'Users'      as const, bg: 'var(--blue-50)',   color: 'var(--blue-600)' },
    { label: 'Đang hoạt động',  value: stats?.active    || 0, icon: 'TrendingUp' as const, bg: 'var(--green-50)',  color: 'var(--green-600)' },
    { label: 'Alumni',          value: stats?.alumni    || 0, icon: 'Award'      as const, bg: 'var(--gold-100)',  color: 'var(--gold-700)' },
    { label: 'Đình chỉ',       value: stats?.suspended || 0, icon: 'AlertCircle'as const, bg: 'var(--red-50)',    color: 'var(--red-600)' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 3, letterSpacing: '-.02em' }}>
          Xin chào, {admin?.name?.split(' ').pop()}!
        </h1>
        <p style={{ color: 'var(--text-4)', fontSize: 13.5 }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="g4" style={{ marginBottom: 24 }}>
        {CARDS.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <Icon name={s.icon} size={20} color={s.color} />
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="g21">
        <div className="card">
          <div className="card-head"><div className="card-title">Phân bố theo Department</div></div>
          {(stats?.byDepartment || []).length > 0
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(stats.byDepartment || []).slice(0,7).map((d: any) => {
                const pct = stats.total > 0 ? (d.count / stats.total) * 100 : 0
                return (
                  <div key={d.department}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{d.department || 'Chưa phân ban'}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-4)' }}>{d.count} · {pct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            : <div className="empty" style={{ padding: '24px 0' }}><span style={{ fontSize: 13 }}>Chưa có dữ liệu</span></div>
          }
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Theo Năm Khoá</div></div>
          {(stats?.byGeneration || []).length > 0
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(stats.byGeneration || []).map((g: any) => (
                <div key={g.generation} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 12px', background: 'var(--stone-50)',
                  borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{g.generation || 'N/A'}</span>
                  <span className="badge badge-gold">{g.count} người</span>
                </div>
              ))}
            </div>
            : <div className="empty" style={{ padding: '24px 0' }}><span style={{ fontSize: 13 }}>Chưa có dữ liệu</span></div>
          }
        </div>
      </div>
    </div>
  )
}
