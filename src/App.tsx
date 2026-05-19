import { useEffect, useState, createContext, useContext } from 'react'
import { AdminLayout, type AdminPage } from './components/AdminLayout'
import { api } from './lib/api'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage'
import { ClubsPage } from './pages/ClubsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'
import { TasksAdminPage } from './pages/TasksAdminPage'
import { ScoresAdminPage } from './pages/ScoresAdminPage'
import { ScheduleAdminPage } from './pages/ScheduleAdminPage'
import { CnbAdminPage } from './pages/CnbAdminPage'
import { FormsAdminPage } from './pages/FormsAdminPage'
import { BadgesAdminPage } from './pages/BadgesAdminPage'

type Admin = {
  id: string
  name: string
  email: string
  role: string
}

type AuthCtx = {
  admin: Admin | null
  token: string | null
  login: (token: string, refreshToken: string, admin: Admin) => void
  logout: () => void
}

const AuthContext = createContext<AuthCtx>({
  admin: null,
  token: null,
  login: () => {},
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export default function App() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [page, setPage] = useState<AdminPage>('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    const storedAdmin = localStorage.getItem('admin')
    if (storedToken && storedAdmin) {
      setToken(storedToken)
      setAdmin(JSON.parse(storedAdmin))
    }
    setLoading(false)
  }, [])

  const login = (accessToken: string, refreshToken: string, admin: Admin) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('admin', JSON.stringify(admin))
    setToken(accessToken)
    setAdmin(admin)
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    try {
      await api('/auth/logout', { method: 'POST', body: { refreshToken }, token: token || '' })
    } catch {
      // ignore logout error
    }
    localStorage.clear()
    setToken(null)
    setAdmin(null)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#08111f', color: '#f7fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 50, height: 50, margin: '0 auto', border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#60a5fa', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 16, fontSize: 16 }}>Đang khởi tạo admin app...</p>
        </div>
      </div>
    )
  }

  if (!admin || !token) {
    return (
      <AuthContext.Provider value={{ admin, token, login, logout }}>
        <LoginPage />
      </AuthContext.Provider>
    )
  }

  const pages: Record<AdminPage, JSX.Element> = {
    dashboard: <DashboardPage />,
    users: <UsersPage />,
    clubs: <ClubsPage />,
    tasks: <TasksAdminPage />,
    scores: <ScoresAdminPage />,
    schedule: <ScheduleAdminPage />,
    cnb: <CnbAdminPage />,
    forms: <FormsAdminPage />,
    badges: <BadgesAdminPage />,
    settings: <SettingsPage />,
    profile: <ProfilePage />,
  }

  return (
    <AuthContext.Provider value={{ admin, token, login, logout }}>
      <AdminLayout page={page} onNavigate={setPage}>
        {pages[page]}
      </AdminLayout>
    </AuthContext.Provider>
  )
}