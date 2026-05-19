import { useState, useEffect } from 'react'
import { api, Member, statusLabel, roleLabel } from '../lib/api'
import { useAuth } from '../App'

interface FormData {
  name: string
  email: string
  password: string
  role: 'member' | 'admin' | 'super_admin'
  generation: string
  department: string
  student_id: string
}

export function UsersPage() {
  const { token } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormData>({
    name: '', email: '', password: '', role: 'member', generation: '', department: '', student_id: ''
  })
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState({ status: 'ACTIVE', role: '' })

  useEffect(() => {
    loadMembers()
  }, [filter])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const data = await api<Member[]>('/members?status=' + filter.status + (filter.role ? '&role=' + filter.role : ''), { token })
      setMembers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!form.name || !form.email || !form.password) return
    try {
      await api('/members', { method: 'POST', body: form, token })
      setForm({ name: '', email: '', password: '', role: 'member', generation: '', department: '', student_id: '' })
      setShowForm(false)
      loadMembers()
    } catch (e) {
      alert('Lỗi: ' + (e instanceof Error ? e.message : 'Unknown error'))
    }
  }

  const handleUpdateMember = async (memberId: string, updates: any) => {
    try {
      await api(`/members/${memberId}`, { method: 'PATCH', body: updates, token })
      loadMembers()
    } catch (e) {
      alert('Lỗi: ' + (e instanceof Error ? e.message : 'Unknown error'))
    }
  }

  const filtered = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Quản Lý Thành Viên</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Quản lý toàn bộ thành viên CLB</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          + Thêm Thành Viên
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Thêm Thành Viên Mới</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="label">Tên</label>
              <input className="input" type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="label">Mật khẩu</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="label">Vai trò</label>
              <select className="select" value={form.role} onChange={e => setForm({...form, role: e.target.value as any})}>
                <option value="member">Thành Viên</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Năm Khoá</label>
              <input className="input" type="text" placeholder="Gen 7" value={form.generation} onChange={e => setForm({...form, generation: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="label">Phòng Ban</label>
              <input className="input" type="text" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleAddMember}>Lưu</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Hủy</button>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
            <input className="input" type="text" placeholder="Tìm kiếm thành viên..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select" style={{ width: 150 }} value={filter.status} onChange={e => setFilter({...filter, status: e.target.value as any})}>
            <option value="ACTIVE">Đang Hoạt Động</option>
            <option value="INACTIVE">Không Hoạt Động</option>
            <option value="ALUMNI">Cựu Thành Viên</option>
            <option value="SUSPENDED">Tạm Đình Chỉ</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" style={{ width: 20, height: 20 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <span>Không tìm thấy thành viên</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Tên</th>
                  <th style={{ width: '25%' }}>Email</th>
                  <th style={{ width: '15%' }}>Vai Trò</th>
                  <th style={{ width: '15%' }}>Trạng Thái</th>
                  <th style={{ width: '15%' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="av av-md">{m.name[0]}</div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{m.generation}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{m.email}</td>
                    <td><span className="badge b-blue">{roleLabel[m.role]}</span></td>
                    <td><span className={`badge status-${m.status}`}>{statusLabel[m.status]}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleUpdateMember(m.id, {status: m.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'})}>
                        {m.status === 'ACTIVE' ? 'Vô hiệu' : 'Kích hoạt'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
