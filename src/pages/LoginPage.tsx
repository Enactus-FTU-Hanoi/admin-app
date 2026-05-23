import { useState } from 'react'
import { useAuth } from '../App'
import { api } from '../lib/api'
import { Icon } from '../components/Icon'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await api<any>('/auth/login', { method: 'POST', body: { email, password } })
      if (!['admin','super_admin'].includes(res.member?.role)) {
        setError('Bạn không có quyền truy cập Admin Panel.')
        return
      }
      login(res.accessToken, res.refreshToken, res.member)
    } catch (err: any) { setError(err.message || 'Đăng nhập thất bại') }
    finally { setLoading(false) }
  }

  return (
    <div className="login-root">
      <div className="login-left">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 300 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(255,255,255,.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(255,255,255,.4)',
          }}>
            <Icon name="ShieldCheck" size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-.02em' }}>
            Admin Panel
          </h1>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 14, lineHeight: 1.7 }}>
            Enactus FTU Hanoi<br />Dành cho Admin & Super Admin
          </p>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
            {[
              { icon: 'Users'      as const, text: 'Quản lý toàn bộ thành viên' },
              { icon: 'BarChart3'  as const, text: 'Chấm điểm KPI & giao task' },
              { icon: 'FileText'   as const, text: 'Tạo form, cấp huy hiệu' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(255,255,255,.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={f.icon} size={17} color="rgba(255,255,255,.9)" />
                </div>
                <span style={{ color: 'rgba(255,255,255,.8)', fontSize: 13.5 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: '-.02em' }}>Đăng nhập</h2>
            <p style={{ color: 'var(--text-4)', fontSize: 14 }}>Truy cập bảng điều khiển quản trị</p>
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
              <div style={{ background: 'var(--red-50)', border: '1px solid #FECACA', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 13.5, color: 'var(--red-600)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="AlertCircle" size={15} color="var(--red-600)" />{error}
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', height: 44, fontSize: 14.5, marginTop: 4 }}>
              {loading ? <><div className="spinner" style={{ width: 17, height: 17, borderWidth: 2 }} /> Đang đăng nhập...</> : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
