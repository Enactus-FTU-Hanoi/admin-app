import { useAuth } from '../App'

export function ProfilePage() {
  const { admin } = useAuth()

  return (
    <section>
      <div style={{ marginBottom: 20 }}>
        <p style={{ margin: 0, color: '#94a3b8' }}>Hồ sơ</p>
        <h2 style={{ margin: '10px 0 0', color: '#f8fafc' }}>Thông tin tài khoản</h2>
      </div>

      <div style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
        <div style={{ borderRadius: 22, background: '#111827', border: '1px solid rgba(148,163,184,0.12)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, display: 'grid', placeItems: 'center', background: '#1d4ed8', color: '#fff', fontSize: 28, fontWeight: 700 }}>{admin?.name.split(' ').map((part) => part[0]).slice(-2).join('').toUpperCase()}</div>
            <div>
              <h3 style={{ margin: 0, color: '#f8fafc' }}>{admin?.name}</h3>
              <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>{admin?.role}</p>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
            <div style={{ color: '#cbd5e1' }}><strong>Email:</strong> {admin?.email}</div>
            <div style={{ color: '#cbd5e1' }}><strong>ID:</strong> {admin?.id}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
