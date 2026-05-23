import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Icon } from '../components/Icon'

const STATUS_LABEL: Record<string,string> = { todo:'Chưa làm', in_progress:'Đang làm', done:'Hoàn thành', cancelled:'Huỷ' }
const PRI_LABEL: Record<string,string>    = { low:'Thấp', medium:'Vừa', high:'Cao', urgent:'Khẩn' }
const PRI_BADGE: Record<string,string>    = { low:'badge-gray', medium:'badge-blue', high:'badge-gold', urgent:'badge-red' }
const EMPTY = { title:'', description:'', assigned_to:'', project:'', priority:'medium', points:10, status:'todo', due_date:'', note:'' }

export function TasksAdminPage() {
  const [tasks, setTasks]     = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm]       = useState({...EMPTY})
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    Promise.all([api<any[]>('/tasks/all'), api<any[]>('/members')])
      .then(([t,m]) => { setTasks(Array.isArray(t)?t:[]); setMembers(Array.isArray(m)?m:[]) })
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = tasks.filter(t => {
    const ms = !search || t.title?.toLowerCase().includes(search.toLowerCase()) || (t.assignee_name||'').toLowerCase().includes(search.toLowerCase())
    return ms && (filterStatus==='all' || t.status===filterStatus)
  })

  const openCreate = () => { setForm({...EMPTY}); setEditing(null); setModal(true) }
  const openEdit   = (t: any) => { setEditing(t); setForm({ title:t.title, description:t.description||'', assigned_to:t.assigned_to, project:t.project||'', priority:t.priority, points:t.points, status:t.status, due_date:t.due_date||'', note:t.note||'' }); setModal(true) }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      editing ? await api(`/tasks/${editing.id}`, {method:'PATCH',body:form}) : await api('/tasks', {method:'POST',body:form})
      setModal(false)
      const t = await api<any[]>('/tasks/all'); setTasks(Array.isArray(t)?t:[])
    } catch(e:any) { alert(e.message) } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Xoá task?')) return
    await api(`/tasks/${id}`, {method:'DELETE'})
    setTasks(ts=>ts.filter(t=>t.id!==id))
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="row-between" style={{ marginBottom:18 }}>
        <div style={{ display:'flex', gap:10 }}>
          <div className="search-wrap" style={{ maxWidth:260 }}>
            <span className="search-icon"><Icon name="Search" size={14} /></span>
            <input className="input" placeholder="Tìm task..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="select" style={{ width:160 }} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Icon name="Plus" size={16} /> Giao task</button>
      </div>

      {filtered.length===0
        ? <div className="empty"><Icon name="CheckSquare" size={40} color="var(--stone-300)" /><span>Không có task</span></div>
        : <div className="table-wrap">
          <table>
            <thead><tr><th>Task</th><th>Người thực hiện</th><th>Độ ưu tiên</th><th>Điểm</th><th>Hạn</th><th>Trạng thái</th><th></th></tr></thead>
            <tbody>
              {filtered.map(t=>(
                <tr key={t.id}>
                  <td style={{ fontWeight:600, maxWidth:220 }}>{t.title}</td>
                  <td style={{ fontSize:13 }}>{t.assignee_name||t.assigned_to}</td>
                  <td><span className={`badge ${PRI_BADGE[t.priority]||'badge-gray'}`}>{PRI_LABEL[t.priority]||t.priority}</span></td>
                  <td><span style={{ fontWeight:700, color:'var(--gold-600)' }}>{t.points}</span></td>
                  <td style={{ color:'var(--text-4)', fontSize:13 }}>{t.due_date ? new Date(t.due_date).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>
                    <span className={`badge ${t.status==='done'?'badge-green':t.status==='in_progress'?'badge-blue':t.status==='cancelled'?'badge-red':'badge-gray'}`}>
                      {STATUS_LABEL[t.status]||t.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(t)}><Icon name="Pencil" size={13} /></button>
                      <button className="btn btn-danger btn-sm" onClick={()=>del(t.id)}><Icon name="Trash2" size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }

      {modal && (
        <div className="overlay" onClick={()=>setModal(false)}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>{editing?'Cập nhật task':'Giao task mới'}</h3>
              <button className="close-btn" onClick={()=>setModal(false)}><Icon name="X" size={16} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="g2">
                  <div className="form-group" style={{ gridColumn:'span 2' }}><label className="label">Tiêu đề *</label><input className="input" required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Giao cho *</label>
                    <select className="select" required value={form.assigned_to} onChange={e=>setForm(f=>({...f,assigned_to:e.target.value}))}>
                      <option value="">Chọn thành viên...</option>
                      {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="label">Project</label><input className="input" value={form.project} onChange={e=>setForm(f=>({...f,project:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Độ ưu tiên</label>
                    <select className="select" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>
                      {Object.entries(PRI_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="label">Điểm</label><input className="input" type="number" min={0} value={form.points} onChange={e=>setForm(f=>({...f,points:+e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Hạn chót</label><input className="input" type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Trạng thái</label>
                    <select className="select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                      {Object.entries(STATUS_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn:'span 2' }}><label className="label">Mô tả</label><textarea className="textarea" rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{ resize:'vertical' }} /></div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving?<><div className="spinner" style={{width:15,height:15,borderWidth:2}} />Lưu...</>:<><Icon name="Save" size={15} />Lưu task</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
