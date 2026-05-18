import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../App'

export function DashboardPage() {
  const { admin } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/members/stats').then(setStats).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const STAT_CARDS = [
    { label: 'Tổng thành viên', value: stats?.total        || 0, color: '#2563EB', icon: '👥' },
    { label: 'Đang hoạt động',  value: stats?.active       || 0, color: '#16A34A', icon: '✨' },
    { label: 'Alumni',          value: stats?.alumni       || 0, color: '#D97706', icon: '🎓' },
    { label: 'Tạm đình chỉ',   value: stats?.suspended    || 0, color: '#E8192C', icon: '🚫' },
  ]

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Xin chào, {admin?.name?.split(' ').pop()} 👋
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 13.5 }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="g4" style={{ marginBottom: 24 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-blob" style={{ background: s.color, opacity: .08 }} />
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="g21">
        {/* Phân bố department */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Phân bố theo Department</div>
          </div>
          {stats?.byDepartment?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.byDepartment.slice(0, 7).map((d: any) => {
                const pct = stats.total > 0 ? (d.count / stats.total) * 100 : 0
                return (
                  <div key={d.department}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{d.department || 'Chưa phân ban'}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{d.count} người ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--amber)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty" style={{ padding: '24px 0' }}>
              <span>Chưa có dữ liệu</span>
            </div>
          )}
        </div>

        {/* Phân bố năm khoá */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Theo Năm Khoá</div>
          </div>
          {stats?.byGeneration?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.byGeneration.map((g: any) => (
                <div key={g.generation} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--r-sm)' }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{g.generation || 'N/A'}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>{g.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty" style={{ padding: '24px 0' }}>
              <span>Chưa có dữ liệu</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
