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
      if (!['admin','super_admin'].includes(res.member?.role)) {
        setError('Bạn không có quyền truy cập Admin Panel.')
        return
      }
      login(res.accessToken, res.refreshToken, res.member)
    } catch(err: any) {
      setError(err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--bg)' }}>
      {/* Left dark panel */}
      <div style={{
        width:'44%', minWidth:360,
        background:'var(--sidebar-bg)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:52, position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:260, height:260, borderRadius:'50%', background:'rgba(232,25,44,.12)', filter:'blur(50px)' }} />
        <div style={{ position:'absolute', bottom:-80, left:-40, width:200, height:200, borderRadius:'50%', background:'rgba(232,25,44,.07)', filter:'blur(60px)' }} />

        <div style={{ position:'relative', textAlign:'center', width:'100%', maxWidth:300 }}>
          <div style={{
            width:64, height:64, borderRadius:18, background:'var(--red)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:28, fontWeight:800, color:'#fff',
            margin:'0 auto 24px', boxShadow:'0 8px 28px var(--red-glow)',
          }}>E</div>

          <h1 style={{ fontSize:26, fontWeight:700, color:'var(--text-on-dark)', marginBottom:8 }}>
            Enactus FTU Hanoi
          </h1>
          <p style={{ color:'var(--text-on-dark-sub)', fontSize:14, lineHeight:1.7 }}>
            Admin Panel — Dành cho quản trị viên CLB
          </p>

          <div style={{ marginTop:44, display:'flex', flexDirection:'column', gap:14, textAlign:'left' }}>
            {[
              { icon:'◉', text:'Quản lý toàn bộ thành viên' },
              { icon:'◈', text:'Chấm điểm KPI & giao task' },
              { icon:'▤', text:'Tạo form, phân quyền, huy hiệu' },
            ].map(f => (
              <div key={f.text} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, background:'rgba(232,25,44,.18)', display:'flex', alignItems:'center', justifyContent:'center', color:'#FCA5AD', fontSize:15 }}>{f.icon}</div>
                <span style={{ color:'rgba(255,255,255,.5)', fontSize:14 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:48 }}>
        <div style={{ width:'100%', maxWidth:380 }}>
          <h2 style={{ fontSize:26, fontWeight:700, marginBottom:6 }}>Admin Login</h2>
          <p style={{ color:'var(--text-3)', fontSize:14, marginBottom:32 }}>Chỉ dành cho Admin & Super Admin</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:0 }}>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@enactusftuhanoi.id.vn" autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="label">Mật khẩu</label>
              <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </div>

            {error && (
              <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'var(--r-sm)', padding:'10px 14px', fontSize:13.5, color:'#B91C1C', marginBottom:14 }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop:6, padding:'11px 18px', fontSize:14.5 }}>
              {loading
                ? <><div className="spinner" style={{width:17,height:17,borderWidth:2}} /> Đang đăng nhập...</>
                : 'Đăng nhập →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
