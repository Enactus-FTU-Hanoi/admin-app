import { useState } from 'react'
import { useAuth } from '../App'
import { api } from '../lib/api'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api<{ accessToken: string; refreshToken: string; member: any }>('/auth/login', {
        method: 'POST', body: { email, password },
      })
      if (!['admin', 'super_admin'].includes(res.member?.role)) {
        setError('Bạn không có quyền truy cập Admin Panel.')
        return
      }
      login(res.accessToken, res.refreshToken, res.member)
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-left">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 300 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 800, color: '#B45309',
            margin: '0 auto 24px', boxShadow: '0 8px 28px rgba(0,0,0,.12)',
          }}>E</div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1000', marginBottom: 8 }}>Admin Panel</h1>
          <p style={{ color: 'rgba(0,0,0,.5)', fontSize: 14, lineHeight: 1.7 }}>
            Enactus FTU Hanoi<br />Chỉ dành cho Admin & Super Admin
          </p>

          <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
            {[
              { icon: '👥', text: 'Quản lý toàn bộ thành viên' },
              { icon: '🏅', text: 'Chấm điểm KPI & giao task' },
              { icon: '📋', text: 'Tạo form, cấp huy hiệu' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{f.icon}</div>
                <span style={{ color: 'rgba(0,0,0,.55)', fontSize: 13.5, fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Đăng nhập</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Truy cập bảng điều khiển quản trị</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@enactusftuhanoi.id.vn" style={{ height: 44 }} />
            </div>
            <div className="form-group">
              <label className="label">Mật khẩu</label>
              <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ height: 44 }} />
            </div>

            {error && (
              <div style={{ background: 'var(--red-lt)', border: '1px solid #FECACA', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: 13.5, color: 'var(--red)', marginBottom: 14 }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', height: 44, fontSize: 15, marginTop: 8 }}>
              {loading ? <><div className="spinner" style={{ width: 17, height: 17, borderWidth: 2 }} /> Đang đăng nhập...</> : 'Đăng nhập →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
