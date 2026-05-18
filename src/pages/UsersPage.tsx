import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'

type Member = {
  id: string; name: string; email: string; phone?: string
  role: string; status: string; department?: string
  generation?: string; student_id?: string; dob?: string
  photo_url?: string; joined_at: string
}

const STATUSES = ['ACTIVE','INACTIVE','ALUMNI','FORMER_MEMBER','SUSPENDED']
const ROLES    = ['member','admin','super_admin']
const STATUS_LABEL: Record<string,string> = {
  ACTIVE:'Đang hoạt động', INACTIVE:'Không hoạt động',
  ALUMNI:'Cựu TV', FORMER_MEMBER:'Thành viên cũ', SUSPENDED:'Đình chỉ',
}
const ROLE_LABEL: Record<string,string> = { member:'Thành viên', admin:'Admin', super_admin:'Super Admin' }

function initials(name: string) {
  return name.split(' ').map(w=>w[0]).slice(-2).join('').toUpperCase()
}

const EMPTY_FORM = {
  name:'', email:'', phone:'', role:'member', status:'ACTIVE',
  department:'', generation:'', student_id:'', dob:'', password:'',
}

export function UsersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRole, setFilterRole]     = useState('all')
  const [modal, setModal] = useState<'create'|'edit'|null>(null)
  const [selected, setSelected] = useState<Member | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string|null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = () => {
    setLoading(true)
    api<Member[]>('/members').then(setMembers).catch(console.error).finally(() => setLoading(false))
  }

  const filtered = members.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || m.status === filterStatus
    const matchRole   = filterRole   === 'all' || m.role   === filterRole
    return matchSearch && matchStatus && matchRole
  })

  const openCreate = () => { setForm({ ...EMPTY_FORM }); setSelected(null); setModal('create') }
  const openEdit   = (m: Member) => {
    setSelected(m)
    setForm({ name:m.name, email:m.email, phone:m.phone||'', role:m.role, status:m.status, department:m.department||'', generation:m.generation||'', student_id:m.student_id||'', dob:m.dob||'', password:'' })
    setModal('edit')
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body = { ...form }
      if (!body.password) delete (body as any).password
      if (modal === 'create') {
        await api('/members', { method: 'POST', body })
      } else {
        await api(`/members/${selected!.id}`, { method: 'PATCH', body })
      }
      setModal(null); load()
    } catch(e:any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Xoá thành viên này?')) return
    setDeleting(id)
    try { await api(`/members/${id}`, { method: 'DELETE' }); load() }
    catch(e:any) { alert(e.message) }
    finally { setDeleting(null) }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="row-between" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flex: 1 }}>
          <div className="search-box" style={{ maxWidth: 280 }}>
            <span className="search-ic">🔍</span>
            <input className="input" placeholder="Tìm tên hoặc email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <select className="select" style={{ width: 140 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="all">Tất cả role</option>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Thêm thành viên</button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Thành viên</th>
                <th>Email</th>
                <th>Department</th>
                <th>Khoá</th>
                <th>Trạng thái</th>
                <th>Role</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-4)' }}>Không có kết quả</td></tr>
              ) : filtered.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="av av-sm">{initials(m.name)}</div>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-3)' }}>{m.email}</td>
                  <td>{m.department || <span style={{ color: 'var(--text-4)' }}>—</span>}</td>
                  <td>{m.generation || <span style={{ color: 'var(--text-4)' }}>—</span>}</td>
                  <td><span className={`badge status-${m.status}`}>{STATUS_LABEL[m.status] || m.status}</span></td>
                  <td><span className={`badge ${m.role === 'super_admin' ? 'b-red' : m.role === 'admin' ? 'b-purple' : 'b-gray'}`}>{ROLE_LABEL[m.role] || m.role}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(m)}>Sửa</button>
                      <button className="btn btn-sm" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}
                        onClick={() => del(m.id)} disabled={deleting === m.id}>
                        {deleting === m.id ? '...' : 'Xoá'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal create/edit */}
      {modal && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{modal === 'create' ? 'Thêm thành viên mới' : 'Chỉnh sửa thành viên'}</h3>
              <button className="close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="g2">
                  <div className="form-group">
                    <label className="label">Họ và tên *</label>
                    <input className="input" required value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="label">Email *</label>
                    <input className="input" type="email" required value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="label">Số điện thoại</label>
                    <input className="input" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="label">Ngày sinh</label>
                    <input className="input" type="date" value={form.dob} onChange={e => setForm(f=>({...f,dob:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="label">Department</label>
                    <input className="input" value={form.department} onChange={e => setForm(f=>({...f,department:e.target.value}))} placeholder="HR, Marketing, Project..." />
                  </div>
                  <div className="form-group">
                    <label className="label">Năm khoá</label>
                    <input className="input" value={form.generation} onChange={e => setForm(f=>({...f,generation:e.target.value}))} placeholder="K24, K25..." />
                  </div>
                  <div className="form-group">
                    <label className="label">MSSV</label>
                    <input className="input" value={form.student_id} onChange={e => setForm(f=>({...f,student_id:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="label">{modal === 'create' ? 'Mật khẩu *' : 'Mật khẩu mới (để trống = không đổi)'}</label>
                    <input className="input" type="password" required={modal === 'create'} value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="label">Trạng thái</label>
                    <select className="select" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Phân quyền</label>
                    <select className="select" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>
                      {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" style={{width:15,height:15,borderWidth:2}} /> Đang lưu...</> : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
