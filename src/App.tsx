import { useEffect, useState, createContext, useContext } from 'react'
import { AdminLayout, type AdminPage } from './components/AdminLayout'
import { api } from './lib/api'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage'
import { TasksAdminPage } from './pages/TasksAdminPage'
import { ScoresAdminPage } from './pages/ScoresAdminPage'
import { ScheduleAdminPage } from './pages/ScheduleAdminPage'
import { CnbAdminPage } from './pages/CnbAdminPage'
import { FormsAdminPage } from './pages/FormsAdminPage'
import { BadgesAdminPage } from './pages/BadgesAdminPage'
import { SettingsPage } from './pages/SettingsPage'

type Admin = { id: string; name: string; email: string; role: string }
type AuthCtx = {
  admin: Admin | null; token: string | null
  login: (t: string, r: string, a: Admin) => void
  logout: () => void
}

export const AuthContext = createContext<AuthCtx>({ admin: null, token: null, login: () => {}, logout: () => {} })
export const useAuth = () => useContext(AuthContext)

export default function App() {
  const [admin, setAdmin]   = useState<Admin | null>(null)
  const [token, setToken]   = useState<string | null>(null)
  const [page, setPage]     = useState<AdminPage>('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('access_token')
    const a = localStorage.getItem('admin')
    if (t && a) { setToken(t); setAdmin(JSON.parse(a)) }
    setLoading(false)
  }, [])

  const login = (accessToken: string, refreshToken: string, a: Admin) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('admin', JSON.stringify(a))
    setToken(accessToken); setAdmin(a)
  }

  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST', body: { refreshToken: localStorage.getItem('refresh_token') } }) } catch {}
    localStorage.clear(); setToken(null); setAdmin(null)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div className="spinner" />
    </div>
  )

  if (!admin || !token) return (
    <AuthContext.Provider value={{ admin, token, login, logout }}>
      <LoginPage />
    </AuthContext.Provider>
  )

  const pages: Record<AdminPage, JSX.Element> = {
    dashboard: <DashboardPage />,
    users:     <UsersPage />,
    tasks:     <TasksAdminPage />,
    scores:    <ScoresAdminPage />,
    schedule:  <ScheduleAdminPage />,
    cnb:       <CnbAdminPage />,
    forms:     <FormsAdminPage />,
    badges:    <BadgesAdminPage />,
    settings:  <SettingsPage />,
  }

  return (
    <AuthContext.Provider value={{ admin, token, login, logout }}>
      <AdminLayout page={page} onNavigate={setPage}>
        {pages[page]}
      </AdminLayout>
    </AuthContext.Provider>
  )
}
