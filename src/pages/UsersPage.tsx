import { useState, useEffect } from 'react'
import { api } from '../lib/api'

const STATUS_OPTS = ['ACTIVE','INACTIVE','ALUMNI','FORMER_MEMBER','SUSPENDED']
const STATUS_LABEL: Record<string,string> = { ACTIVE:'Hoạt động', INACTIVE:'Không HĐ', ALUMNI:'Cựu TV', FORMER_MEMBER:'TV cũ', SUSPENDED:'Đình chỉ' }
const STATUS_BADGE: Record<string,string> = { ACTIVE:'b-green', INACTIVE:'b-gray', ALUMNI:'b-blue', FORMER_MEMBER:'b-amber', SUSPENDED:'b-red' }
const ROLE_LABEL: Record<string,string> = { member:'Thành viên', admin:'Admin', super_admin:'Super Admin' }
const ROLE_BADGE: Record<string,string> = { member:'b-gray', admin:'b-purple', super_admin:'b-red' }

function initials(name: string) { return name.split(' ').map(w=>w[0]).slice(-2).join('').toUpperCase() }

const EMPTY = { name:'', email:'', password:'', role:'member', generation:'', department:'', student_id:'', phone:'', dob:'', status:'ACTIVE' }

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

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await api<any>('/members')
      setMembers(Array.isArray(data) ? data : (data?.results || []))
    } catch(e) { console.error(e); setMembers([]) }
    finally { setLoading(false) }
  }

  const filtered = members.filter(m => {
    const ms = !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase())
    const ss = filterStatus === 'all' || m.status === filterStatus
    return ms && ss
  })

  const openCreate = () => { setForm({...EMPTY}); setEditing(null); setError(''); setModal('create') }
  const openEdit   = (m: any) => {
    setEditing(m)
    setForm({ name:m.name, email:m.email, password:'', role:m.role, generation:m.generation||'', department:m.department||'', student_id:m.student_id||'', phone:m.phone||'', dob:m.dob||'', status:m.status })
    setError(''); setModal('edit')
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const body: any = { ...form }
      if (!body.password) delete body.password
      if (modal === 'create') {
        await api('/members', { method:'POST', body })
      } else {
        await api(`/members/${editing.id}`, { method:'PATCH', body })
      }
      setModal(null); load()
    } catch(e: any) {
      setError(e.message || 'Có lỗi xảy ra')
    } finally { setSaving(false) }
  }

  const del = async (id: string, name: string) => {
    if (!confirm(`Xoá thành viên "${name}"?`)) return
    try { await api(`/members/${id}`, { method:'DELETE' }); load() }
    catch(e: any) { alert(e.message) }
  }

  const toggleStatus = async (m: any) => {
    const newStatus = m.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await api(`/members/${m.id}`, { method:'PATCH', body:{ status: newStatus } })
    load()
  }

  const counts = members.reduce((acc, m) => { acc[m.status] = (acc[m.status]||0)+1; return acc }, {} as Record<string,number>)

  return (
    <div>
      {/* Stats strip */}
      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        {[
          { label:'Tổng', value:members.length, color:'var(--blue)', bg:'var(--blue-lt)' },
          { label:'Hoạt động', value:counts['ACTIVE']||0, color:'var(--green)', bg:'var(--green-lt)' },
          { label:'Cựu TV', value:counts['ALUMNI']||0, color:'#B45309', bg:'var(--amber-light)' },
          { label:'Đình chỉ', value:counts['SUSPENDED']||0, color:'var(--red)', bg:'var(--red-lt)' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.color}20`, borderRadius:'var(--r-md)', padding:'12px 20px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:s.color, fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="row-between" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', gap:10, flex:1 }}>
          <div className="search-box" style={{ maxWidth:300 }}>
            <span className="search-ic">🔍</span>
            <input className="input" placeholder="Tìm tên hoặc email..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="select" style={{ width:160 }} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {STATUS_OPTS.map(s=><option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm thành viên</button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty"><span style={{fontSize:36}}>👥</span><span>Không có kết quả</span></div>
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
              {filtered.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className="av av-sm">{initials(m.name)}</div>
                      <div>
                        <div style={{ fontWeight:600 }}>{m.name}</div>
                        <div style={{ fontSize:11, color:'var(--text-4)' }}>{m.student_id||'—'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color:'var(--text-3)', fontSize:13 }}>{m.email}</td>
                  <td style={{ fontSize:13 }}>{m.department||<span style={{color:'var(--text-4)'}}>—</span>}</td>
                  <td style={{ fontSize:13 }}>{m.generation||<span style={{color:'var(--text-4)'}}>—</span>}</td>
                  <td><span className={`badge ${STATUS_BADGE[m.status]||'b-gray'}`}>{STATUS_LABEL[m.status]||m.status}</span></td>
                  <td><span className={`badge ${ROLE_BADGE[m.role]||'b-gray'}`}>{ROLE_LABEL[m.role]||m.role}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-outline btn-sm" onClick={()=>openEdit(m)}>Sửa</button>
                      <button className="btn btn-sm" style={{ background:'var(--amber-light)', color:'#B45309', border:'1px solid #FCD34D' }}
                        onClick={()=>toggleStatus(m)}>
                        {m.status==='ACTIVE'?'Vô hiệu':'Kích hoạt'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={()=>del(m.id, m.name)}>Xoá</button>
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
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>{modal==='create'?'Thêm thành viên mới':'Chỉnh sửa thành viên'}</h3>
              <button className="close-btn" onClick={()=>setModal(null)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                {error && (
                  <div style={{ background:'var(--red-lt)', border:'1px solid #FECACA', borderRadius:'var(--r-sm)', padding:'10px 14px', color:'var(--red)', fontSize:13.5, marginBottom:14 }}>
                    ⚠ {error}
                  </div>
                )}
                <div className="g2">
                  <div className="form-group"><label className="label">Họ và tên *</label>
                    <input className="input" required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Email *</label>
                    <input className="input" type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">{modal==='create'?'Mật khẩu *':'Mật khẩu mới (để trống = không đổi)'}</label>
                    <input className="input" type="password" required={modal==='create'} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Số điện thoại</label>
                    <input className="input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="0912 345 678" /></div>
                  <div className="form-group"><label className="label">Department</label>
                    <input className="input" value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))} placeholder="HR, Marketing, Project..." /></div>
                  <div className="form-group"><label className="label">Năm khoá</label>
                    <input className="input" value={form.generation} onChange={e=>setForm(f=>({...f,generation:e.target.value}))} placeholder="Gen 7, K24..." /></div>
                  <div className="form-group"><label className="label">MSSV</label>
                    <input className="input" value={form.student_id} onChange={e=>setForm(f=>({...f,student_id:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Ngày sinh</label>
                    <input className="input" type="date" value={form.dob} onChange={e=>setForm(f=>({...f,dob:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Trạng thái</label>
                    <select className="select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                      {STATUS_OPTS.map(s=><option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></div>
                  <div className="form-group"><label className="label">Phân quyền</label>
                    <select className="select" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                      <option value="member">Thành viên</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select></div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={()=>setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving?<><div className="spinner" style={{width:15,height:15,borderWidth:2}} /> Đang lưu...</>:'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
