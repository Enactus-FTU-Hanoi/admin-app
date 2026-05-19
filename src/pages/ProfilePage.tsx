import { useAuth } from '../App'

export function ProfilePage() {
  const { admin } = useAuth()

  return (
    <div>
      <h2 className="page-title">Hồ sơ của tôi</h2>
      <div className="card" style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div className="av av-lg" style={{ fontSize: 24 }}>{admin?.name?.charAt(0) || 'A'}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{admin?.name}</div>
            <div style={{ color: 'var(--text-3)', fontSize: 13 }}>{admin?.email}</div>
            <span className="badge b-amber" style={{ marginTop: 6 }}>{admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <div><strong>ID:</strong> {admin?.id}</div>
          <div><strong>Vai trò:</strong> {admin?.role === 'super_admin' ? 'Super Admin' : 'Quản trị viên'}</div>
        </div>
      </div>
    </div>
  )
}