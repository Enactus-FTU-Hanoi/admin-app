import { useAuth } from '../App'

// THÊM 'clubs' VÀ 'profile' VÀO TYPE
export type AdminPage = 'dashboard' | 'users' | 'tasks' | 'scores' | 'schedule' | 'cnb' | 'forms' | 'badges' | 'settings' | 'clubs' | 'profile'

const NAV: { id: AdminPage; label: string; icon: string; section?: string }[] = [
  { id: 'dashboard', label: 'Dashboard',        icon: '📊', section: 'Tổng quan' },
  { id: 'users',     label: 'Thành viên',        icon: '👥' },
  { id: 'tasks',     label: 'Tasks & Giao việc', icon: '✅', section: 'Quản lý' },
  { id: 'scores',    label: 'Chấm điểm KPI',     icon: '🏅' },
  { id: 'schedule',  label: 'Lịch & Vote',       icon: '📅' },
  { id: 'cnb',       label: 'C&B',               icon: '💰' },
  { id: 'forms',     label: 'Form đăng ký',      icon: '📋' },
  { id: 'badges',    label: 'Huy hiệu',          icon: '🏆', section: 'Hệ thống' },
  { id: 'settings',  label: 'Cài đặt',           icon: '⚙️' },
  { id: 'profile',   label: 'Hồ sơ',             icon: '👤' },  // THÊM MỚI
]

const PAGE_META: Record<AdminPage, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard',           sub: 'Tổng quan hệ thống' },
  users:     { title: 'Quản lý thành viên',  sub: 'CRUD, phân quyền, trạng thái' },
  clubs:     { title: 'Quản lý CLB',         sub: 'Danh sách và hoạt động CLB' },  // THÊM MỚI
  tasks:     { title: 'Tasks & Giao việc',   sub: 'Tạo và theo dõi task' },
  scores:    { title: 'Chấm điểm KPI',       sub: 'Ghi nhận điểm theo kỳ' },
  schedule:  { title: 'Lịch & Vote',         sub: 'Tạo poll và xem kết quả' },
  cnb:       { title: 'C&B Management',      sub: 'Phúc lợi và khấu trừ' },
  forms:     { title: 'Form đăng ký',        sub: 'Tạo và quản lý form' },
  badges:    { title: 'Huy hiệu',            sub: 'Cấp và quản lý huy hiệu' },
  settings:  { title: 'Cài đặt hệ thống',   sub: 'Cấu hình chung' },
  profile:   { title: 'Hồ sơ cá nhân',      sub: 'Thông tin tài khoản' },  // THÊM MỚI
}

function initials(name: string) {
  return name.split(' ').map((w: string) => w[0]).slice(-2).join('').toUpperCase()
}

type Props = { page: AdminPage; onNavigate: (p: AdminPage) => void; children: React.ReactNode }

export function AdminLayout({ page, onNavigate, children }: Props) {
  const { admin, logout } = useAuth()
  const meta = PAGE_META[page]

  let lastSection = ''
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-img">E</div>
          <div>
            <div className="logo-name">Enactus FTU</div>
            <div className="logo-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(item => {
            const showSection = item.section && item.section !== lastSection
            if (item.section) lastSection = item.section
            return (
              <div key={item.id}>
                {showSection && <div className="nav-section">{item.section}</div>}
                <button
                  className={`nav-item${page === item.id ? ' active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              </div>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="user-chip">
            <div className="av av-sm">{admin ? initials(admin.name) : '?'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-chip-name">{admin?.name}</div>
              <div className="user-chip-role">{admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</div>
            </div>
          </button>
          <button className="logout-btn" onClick={logout}>
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{meta.title}</div>
            <div className="topbar-sub">{meta.sub}</div>
          </div>
          <div className="topbar-right">
            <button className="icon-btn">🔔<span className="notif-dot" /></button>
            <div className="av av-md">{admin ? initials(admin.name) : '?'}</div>
          </div>
        </header>
        <div className="page">
          <div className="page-enter">{children}</div>
        </div>
      </div>
    </div>
  )
}