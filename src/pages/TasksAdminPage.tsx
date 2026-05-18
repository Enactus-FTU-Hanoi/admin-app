import { useState, useEffect } from 'react'
import { api } from '../lib/api'

type Task = {
  id: string; title: string; description?: string
  assigned_to: string; assignee_name?: string
  project?: string; priority: string; points: number
  status: string; due_date?: string; note?: string
  created_at: string
}
type Member = { id: string; name: string }

const PRIORITY_OPTS = ['low','medium','high','urgent']
const STATUS_OPTS   = ['todo','in_progress','done','cancelled']
const STATUS_LABEL: Record<string,string> = { todo:'Chưa làm', in_progress:'Đang làm', done:'Hoàn thành', cancelled:'Huỷ' }
const PRI_LABEL:    Record<string,string> = { low:'Thấp', medium:'Vừa', high:'Cao', urgent:'Khẩn' }
const PRI_BADGE:    Record<string,string> = { low:'b-gray', medium:'b-blue', high:'b-amber', urgent:'b-red' }

const EMPTY = { title:'', description:'', assigned_to:'', project:'', priority:'medium', points:10, status:'todo', due_date:'', note:'' }

export function TasksAdminPage() {
  const [tasks, setTasks]     = useState<Task[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm]       = useState({ ...EMPTY })
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    Promise.all([
      api<Task[]>('/tasks/all'),
      api<Member[]>('/members'),
    ]).then(([t, m]) => { setTasks(t); setMembers(m) }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = tasks.filter(t => {
    const ms = !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.assignee_name||'').toLowerCase().includes(search.toLowerCase())
    const ss = filterStatus === 'all' || t.status === filterStatus
    return ms && ss
  })

  const openCreate = () => { setForm({ ...EMPTY }); setEditing(null); setModal(true) }
  const openEdit   = (t: Task) => {
    setEditing(t)
    setForm({ title:t.title, description:t.description||'', assigned_to:t.assigned_to, project:t.project||'', priority:t.priority, points:t.points, status:t.status, due_date:t.due_date||'', note:t.note||'' })
    setModal(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await api(`/tasks/${editing.id}`, { method: 'PATCH', body: form })
      else await api('/tasks', { method: 'POST', body: form })
      setModal(false)
      const t = await api<Task[]>('/tasks/all')
      setTasks(t)
    } catch(e:any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Xoá task này?')) return
    await api(`/tasks/${id}`, { method: 'DELETE' })
    setTasks(ts => ts.filter(t => t.id !== id))
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="search-box" style={{ maxWidth: 260 }}>
            <span className="search-ic">🔍</span>
            <input className="input" placeholder="Tìm task..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Giao task</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr>
            <th>Task</th><th>Người thực hiện</th><th>Project</th>
            <th>Độ ưu tiên</th><th>Điểm</th><th>Hạn</th><th>Trạng thái</th><th>Hành động</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--text-4)' }}>Không có task</td></tr>
              : filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight:600, maxWidth:220 }}>{t.title}</td>
                  <td>{t.assignee_name || t.assigned_to}</td>
                  <td>{t.project || <span style={{color:'var(--text-4)'}}>—</span>}</td>
                  <td><span className={`badge ${PRI_BADGE[t.priority]||'b-gray'}`}>{PRI_LABEL[t.priority]||t.priority}</span></td>
                  <td style={{ fontWeight:700, color:'var(--amber)' }}>{t.points}</td>
                  <td style={{ color:'var(--text-3)', fontSize:13 }}>{t.due_date ? new Date(t.due_date).toLocaleDateString('vi-VN') : '—'}</td>
                  <td><span className={`badge ${t.status==='done'?'b-green':t.status==='in_progress'?'b-blue':t.status==='cancelled'?'b-red':'b-gray'}`}>{STATUS_LABEL[t.status]||t.status}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>Sửa</button>
                      <button className="btn btn-sm" style={{background:'#FEF2F2',color:'#B91C1C',border:'1px solid #FECACA'}} onClick={() => del(t.id)}>Xoá</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="overlay" onClick={() => setModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{editing ? 'Cập nhật task' : 'Giao task mới'}</h3>
              <button className="close-btn" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="g2">
                  <div className="form-group" style={{ gridColumn:'span 2' }}>
                    <label className="label">Tiêu đề task *</label>
                    <input className="input" required value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="label">Giao cho *</label>
                    <select className="select" required value={form.assigned_to} onChange={e => setForm(f=>({...f,assigned_to:e.target.value}))}>
                      <option value="">Chọn thành viên...</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Project</label>
                    <input className="input" value={form.project} onChange={e => setForm(f=>({...f,project:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="label">Độ ưu tiên</label>
                    <select className="select" value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}>
                      {PRIORITY_OPTS.map(p => <option key={p} value={p}>{PRI_LABEL[p]}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Điểm</label>
                    <input className="input" type="number" min={0} value={form.points} onChange={e => setForm(f=>({...f,points:+e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="label">Hạn chót</label>
                    <input className="input" type="date" value={form.due_date} onChange={e => setForm(f=>({...f,due_date:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="label">Trạng thái</label>
                    <select className="select" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                      {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn:'span 2' }}>
                    <label className="label">Mô tả</label>
                    <textarea className="textarea" rows={3} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} style={{ resize:'vertical' }} />
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" style={{width:15,height:15,borderWidth:2}} /> Lưu...</> : 'Lưu task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
