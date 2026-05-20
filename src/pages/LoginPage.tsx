import { useState } from 'react'
import { useAuth } from '../App'
import { api } from '../lib/api'
import { Icon } from '../components/Icon'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    <div className="login-container">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">
            <Icon name="Sparkles" size={32} color="#FFFFFF" />
          </div>
          <h1>Enactus FTU Hanoi</h1>
          <p>Admin Panel - Chỉ dành cho Quản trị viên</p>
        </div>
        <div className="login-features">
          <div className="feature-item">
            <Icon name="Users" size={20} />
            <span>Quản lý toàn bộ thành viên</span>
          </div>
          <div className="feature-item">
            <Icon name="Award" size={20} />
            <span>Chấm điểm KPI & giao task</span>
          </div>
          <div className="feature-item">
            <Icon name="FormInput" size={20} />
            <span>Tạo form, cấp huy hiệu</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <h2>Đăng nhập</h2>
          <p>Truy cập bảng điều khiển quản trị</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@enactusftuhanoi.id.vn"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Mật khẩu</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="login-error">
                <Icon name="AlertCircle" size={16} />
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? <Icon name="Loader2" size={16} className="spin" /> : null}
              {loading ? ' Đang đăng nhập...' : ' Đăng nhập →'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .login-container {
          display: flex;
          min-height: 100vh;
          background: #F3F4F6;
        }
        .login-left {
          width: 42%;
          min-width: 340px;
          background: linear-gradient(135deg, #FFC107 0%, #FFB300 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 52px;
          position: relative;
          overflow: hidden;
        }
        .login-left::before {
          content: '';
          position: absolute;
          top: -80px;
          right: -80px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
        }
        .login-left::after {
          content: '';
          position: absolute;
          bottom: -100px;
          left: -60px;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.06);
        }
        .login-brand {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 300px;
          margin: 0 auto;
        }
        .login-logo {
          width: 72px;
          height: 72px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          backdrop-filter: blur(4px);
        }
        .login-brand h1 {
          font-size: 28px;
          font-weight: 800;
          color: #1a1000;
          margin-bottom: 8px;
        }
        .login-brand p {
          color: rgba(0, 0, 0, 0.5);
          font-size: 14px;
        }
        .login-features {
          position: relative;
          z-index: 1;
          margin-top: 48px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          text-align: left;
          max-width: 260px;
          margin-left: auto;
          margin-right: auto;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(0, 0, 0, 0.55);
          font-size: 13.5px;
          font-weight: 500;
        }
        .feature-item svg {
          width: 20px;
          height: 20px;
        }
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
        }
        .login-form-container {
          width: 100%;
          max-width: 380px;
        }
        .login-form-container h2 {
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 6px;
          color: #1F2937;
        }
        .login-form-container p {
          color: #9CA3AF;
          font-size: 14px;
          margin-bottom: 32px;
        }
        .login-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13.5px;
          color: #DC2626;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .login-btn {
          width: 100%;
          height: 44px;
          font-size: 15px;
          margin-top: 8px;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}