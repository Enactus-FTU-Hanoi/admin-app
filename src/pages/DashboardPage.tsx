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
    { label: 'Tổng thành viên', value: stats?.total     || 0, icon: '👥', bg: '#EFF6FF', color: '#2563EB' },
    { label: 'Đang hoạt động',  value: stats?.active    || 0, icon: '✨', bg: '#F0FDF4', color: '#16A34A' },
    { label: 'Alumni',          value: stats?.alumni    || 0, icon: '🎓', bg: '#FFF8E1', color: '#B45309' },
    { label: 'Tạm đình chỉ',   value: stats?.suspended || 0, icon: '🚫', bg: '#FEF2F2', color: '#DC2626' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          Xin chào, {admin?.name?.split(' ').pop()} 👋
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 13.5 }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="g4" style={{ marginBottom: 24 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="g21">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Phân bố theo Department</div>
          </div>
          {stats?.byDepartment?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stats.byDepartment.slice(0, 7).map((d: any) => {
                const pct = stats.total > 0 ? (d.count / stats.total) * 100 : 0
                return (
                  <div key={d.department}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{d.department || 'Chưa phân ban'}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{d.count} · {pct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--amber)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty" style={{ padding: '24px 0' }}><span>Chưa có dữ liệu</span></div>
          )}
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Theo Năm Khoá</div></div>
          {stats?.byGeneration?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.byGeneration.map((g: any) => (
                <div key={g.generation} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{g.generation || 'N/A'}</span>
                  <span className="badge b-amber">{g.count} người</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty" style={{ padding: '24px 0' }}><span>Chưa có dữ liệu</span></div>
          )}
        </div>
      </div>
    </div>
  )
}
