import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Icon } from '../components/Icon'

const STATUS_OPTS = ['ACTIVE','INACTIVE','ALUMNI','FORMER_MEMBER','SUSPENDED']
const STATUS_LABEL: Record<string,string> = { ACTIVE:'Hoạt động', INACTIVE:'Không HĐ', ALUMNI:'Cựu TV', FORMER_MEMBER:'TV cũ', SUSPENDED:'Đình chỉ' }
const ROLE_LABEL: Record<string,string>   = { member:'Thành viên', admin:'Admin', super_admin:'Super Admin' }
const EMPTY = { name:'', email:'', password:'', role:'member', status:'ACTIVE', department:'', generation:'', student_id:'', phone:'', dob:'' }

function initials(name: string) { return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() }

export function UsersPage() {
  const [members, setMembers]   = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modal, setModal]       = useState<'create'|'edit'|null>(null)
  const [editing, setEditing]   = useState<any>(null)
  const [form, setForm]         = useState({...EMPTY})
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const d = await api<any>('/members')
      setMembers(Array.isArray(d) ? d : d?.results || [])
    } catch { setMembers([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = members.filter(m => {
    const ms = !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase())
    return ms && (filterStatus === 'all' || m.status === filterStatus)
  })

  const openCreate = () => { setForm({...EMPTY}); setEditing(null); setError(''); setModal('create') }
  const openEdit   = (m: any) => {
    setEditing(m)
    setForm({ name:m.name, email:m.email, password:'', role:m.role, status:m.status, department:m.department||'', generation:m.generation||'', student_id:m.student_id||'', phone:m.phone||'', dob:m.dob||'' })
    setError(''); setModal('edit')
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const body: any = { ...form }
      if (!body.password) delete body.password
      modal === 'create' ? await api('/members', { method:'POST', body }) : await api(`/members/${editing.id}`, { method:'PATCH', body })
      setModal(null); load()
    } catch (e: any) { setError(e.message || 'Có lỗi xảy ra') }
    finally { setSaving(false) }
  }

  const del = async (id: string, name: string) => {
    if (!confirm(`Xoá thành viên "${name}"?`)) return
    await api(`/members/${id}`, { method:'DELETE' }); load()
  }

  const counts = members.reduce((acc, m) => { acc[m.status] = (acc[m.status]||0)+1; return acc }, {} as Record<string,number>)

  return (
    <div>
      {/* Stats strip */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        {[
          { label:'Tổng', value:members.length, color:'var(--blue-600)', bg:'var(--blue-50)' },
          { label:'Hoạt động', value:counts['ACTIVE']||0, color:'var(--green-600)', bg:'var(--green-50)' },
          { label:'Alumni', value:counts['ALUMNI']||0, color:'var(--gold-700)', bg:'var(--gold-100)' },
          { label:'Đình chỉ', value:counts['SUSPENDED']||0, color:'var(--red-600)', bg:'var(--red-50)' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:'var(--r-md)', padding:'10px 18px', display:'flex', alignItems:'center', gap:10, border:`1px solid ${s.color}20` }}>
            <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:s.color, fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="row-between" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', gap:10, flex:1 }}>
          <div className="search-wrap" style={{ maxWidth:280 }}>
            <span className="search-icon"><Icon name="Search" size={14} /></span>
            <input className="input" placeholder="Tìm tên hoặc email..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="select" style={{ width:160 }} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {STATUS_OPTS.map(s=><option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Icon name="Plus" size={16} /> Thêm thành viên
        </button>
      </div>

      {loading
        ? <div className="loading-center"><div className="spinner" /></div>
        : filtered.length === 0
        ? <div className="empty"><Icon name="Users" size={40} color="var(--stone-300)" /><span>Không có kết quả</span></div>
        : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Thành viên</th><th>Email</th><th>Department</th><th>Khoá</th><th>Trạng thái</th><th>Role</th><th>Hành động</th></tr></thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="avatar avatar-sm">{initials(m.name)}</div>
                        <div>
                          <div style={{ fontWeight:600 }}>{m.name}</div>
                          <div style={{ fontSize:11, color:'var(--text-4)' }}>{m.student_id || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color:'var(--text-4)', fontSize:13 }}>{m.email}</td>
                    <td style={{ fontSize:13 }}>{m.department || '—'}</td>
                    <td style={{ fontSize:13 }}>{m.generation || '—'}</td>
                    <td><span className={`badge status-${m.status}`}>{STATUS_LABEL[m.status]||m.status}</span></td>
                    <td>
                      <span className={`badge ${m.role==='super_admin'?'badge-red':m.role==='admin'?'badge-purple':'badge-gray'}`}>
                        {ROLE_LABEL[m.role]||m.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(m)}>
                          <Icon name="Pencil" size={13} /> Sửa
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={()=>del(m.id, m.name)}>
                          <Icon name="Trash2" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      {modal && (
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>{modal==='create'?'Thêm thành viên mới':'Chỉnh sửa thành viên'}</h3>
              <button className="close-btn" onClick={()=>setModal(null)}><Icon name="X" size={16} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                {error && (
                  <div style={{ background:'var(--red-50)', border:'1px solid #FECACA', borderRadius:'var(--r-md)', padding:'10px 14px', color:'var(--red-600)', fontSize:13.5, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                    <Icon name="AlertCircle" size={14} color="var(--red-600)" />{error}
                  </div>
                )}
                <div className="g2">
                  <div className="form-group"><label className="label">Họ và tên *</label><input className="input" required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Email *</label><input className="input" type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">{modal==='create'?'Mật khẩu *':'Mật khẩu mới (để trống = không đổi)'}</label><input className="input" type="password" required={modal==='create'} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Số điện thoại</label><input className="input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="0912 345 678" /></div>
                  <div className="form-group"><label className="label">Department</label><input className="input" value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))} placeholder="HR, Marketing..." /></div>
                  <div className="form-group"><label className="label">Năm khoá</label><input className="input" value={form.generation} onChange={e=>setForm(f=>({...f,generation:e.target.value}))} placeholder="Gen 7, K24..." /></div>
                  <div className="form-group"><label className="label">MSSV</label><input className="input" value={form.student_id} onChange={e=>setForm(f=>({...f,student_id:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Ngày sinh</label><input className="input" type="date" value={form.dob} onChange={e=>setForm(f=>({...f,dob:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Trạng thái</label>
                    <select className="select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                      {STATUS_OPTS.map(s=><option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="label">Phân quyền</label>
                    <select className="select" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                      <option value="member">Thành viên</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving?<><div className="spinner" style={{width:15,height:15,borderWidth:2}} />Đang lưu...</>:<><Icon name="Save" size={15} />Lưu</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
