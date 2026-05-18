const BASE = (import.meta as any).env?.VITE_API_URL || 'https://api.enactusftuhanoi.id.vn'

export type ApiOpts = { method?: string; body?: unknown; token?: string }

export async function api<T = unknown>(path: string, opts: ApiOpts = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = opts.token || localStorage.getItem('access_token') || ''
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })

  if (res.status === 401) {
    const refresh = localStorage.getItem('refresh_token')
    if (refresh) {
      const r = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      })
      if (r.ok) {
        const { accessToken, refreshToken: newRefresh } = await r.json()
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', newRefresh)
        const retry = await fetch(`${BASE}${path}`, {
          method: opts.method || 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
          body: opts.body ? JSON.stringify(opts.body) : undefined,
        })
        if (!retry.ok) throw new Error((await retry.json() as any).error || 'Request failed')
        return retry.json() as Promise<T>
      }
    }
    localStorage.clear()
    window.location.reload()
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' })) as any
    throw new Error(err.error || `Error ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'ALUMNI' | 'FORMER_MEMBER' | 'SUSPENDED'
export type MemberRole   = 'member' | 'admin' | 'super_admin'

export type Member = {
  id: string; name: string; email: string
  role: MemberRole; status: MemberStatus
  photo_url?: string; avatar_url?: string
  department?: string; position?: string
  generation?: string; dob?: string
  phone?: string; student_id?: string
  facebook_url?: string; linkedin_url?: string; bio?: string
  joined_at: string; updated_at?: string
  badges?: Badge[]
}

export type Task = {
  id: string; title: string; description?: string
  assigned_to: string; assignee_name?: string
  created_by: string; due_date?: string
  project?: string; priority: 'low'|'medium'|'high'|'urgent'
  points: number; status: 'todo'|'in_progress'|'done'|'cancelled'
  note?: string; created_at: string
}

export type Score = {
  id: string; member_id: string; category: string
  score: number; period: string; note?: string
  graded_by?: string; created_at: string
}

export type Badge = {
  id: string; name: string; description?: string
  icon: string; color: string
  awarded_at?: string; note?: string
}

export type Poll = {
  id: string; title: string; description?: string
  time_slots: string; deadline?: string; status: string
  created_at: string
}

export type Notification = {
  id: string; title: string; body: string
  type: string; read: number; created_at: string
}

export type CnbRecord = {
  id: string; member_id: string; period: string
  type: 'benefit'|'deduction'; amount: number
  note?: string; created_at: string
}

export type Form = {
  id: string; title: string; description?: string
  fields: FormField[]; access: string
  deadline?: string; status: string
  created_by: string; creator_name?: string
  response_count?: number; created_at: string
  myResponse?: { answers: Record<string, any> } | null
}

export type FormField = {
  id: string; type: 'text'|'textarea'|'select'|'radio'|'checkbox'|'date'|'number'
  label: string; required?: boolean; options?: string[]
  placeholder?: string
}

// Helpers
export const statusLabel: Record<MemberStatus, string> = {
  ACTIVE: 'Đang hoạt động', INACTIVE: 'Không hoạt động',
  ALUMNI: 'Cựu thành viên', FORMER_MEMBER: 'Thành viên cũ',
  SUSPENDED: 'Tạm đình chỉ',
}

export const roleLabel: Record<MemberRole, string> = {
  member: 'Thành viên', admin: 'Admin', super_admin: 'Super Admin',
}

export const priorityColor: Record<string, string> = {
  low: 'b-gray', medium: 'b-blue', high: 'b-amber', urgent: 'b-red',
}

export const taskStatusLabel: Record<string, string> = {
  todo: 'Chưa làm', in_progress: 'Đang làm', done: 'Hoàn thành', cancelled: 'Đã huỷ',
}

export const taskStatusColor: Record<string, string> = {
  todo: 'b-gray', in_progress: 'b-blue', done: 'b-green', cancelled: 'b-red',
}

export function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
}

export function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })
}

export function fmtMoney(n: number) {
  return n.toLocaleString('vi-VN') + ' đ'
}

export function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Vừa xong'
  if (m < 60) return `${m} phút trước`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} giờ trước`
  return fmtDate(d)
}
