import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Icon } from '../components/Icon'

const CATS = ['Tham dự họp','Hoàn thành task','Đóng góp dự án','Kỷ luật','Sáng kiến','Khác']

export function ScoresAdminPage() {
  const [scores, setScores]   = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState({ member_id:'', category:CATS[0], score:10, period:'', note:'' })
  const [saving, setSaving]   = useState(false)
  const [filterPeriod, setFilterPeriod] = useState('all')

  useEffect(() => {
    Promise.all([api<any[]>('/scores/all'), api<any[]>('/members')])
      .then(([s,m]) => { setScores(Array.isArray(s)?s:[]); setMembers(Array.isArray(m)?m:[]) })
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  const periods  = ['all', ...Array.from(new Set(scores.map(s=>s.period))).sort().reverse()]
  const filtered = filterPeriod==='all' ? scores : scores.filter(s=>s.period===filterPeriod)

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await api('/scores', { method:'POST', body:form })
      setModal(false)
      const s = await api<any[]>('/scores/all'); setScores(Array.isArray(s)?s:[])
    } catch(e:any) { alert(e.message) } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Xoá bản ghi này?')) return
    await api(`/scores/${id}`, { method:'DELETE' })
    setScores(ss=>ss.filter(s=>s.id!==id))
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="row-between" style={{ marginBottom:18 }}>
        <div className="tabs">
          {periods.map(p=>(
            <button key={p} className={`tab-item${filterPeriod===p?' active':''}`} onClick={()=>setFilterPeriod(p)}>
              {p==='all'?'Tất cả':p}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}>
          <Icon name="Plus" size={16} /> Chấm điểm
        </button>
      </div>

      {filtered.length===0
        ? <div className="empty"><Icon name="BarChart3" size={40} color="var(--stone-300)" /><span>Chưa có dữ liệu</span></div>
        : <div className="table-wrap">
          <table>
            <thead><tr><th>Thành viên</th><th>Kỳ</th><th>Hạng mục</th><th>Điểm</th><th>Ghi chú</th><th>Ngày</th><th></th></tr></thead>
            <tbody>
              {filtered.map(s=>(
                <tr key={s.id}>
                  <td style={{ fontWeight:600 }}>{s.member_name||s.member_id}</td>
                  <td><span className="badge badge-blue">{s.period}</span></td>
                  <td style={{ fontSize:13 }}>{s.category}</td>
                  <td><span style={{ fontWeight:700, color:s.score>=0?'var(--green-600)':'var(--red-600)' }}>{s.score>0?'+':''}{s.score}</span></td>
                  <td style={{ color:'var(--text-4)', fontSize:13 }}>{s.note||'—'}</td>
                  <td style={{ color:'var(--text-4)', fontSize:13 }}>{new Date(s.created_at).toLocaleDateString('vi-VN')}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={()=>del(s.id)}><Icon name="Trash2" size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }

      {modal && (
        <div className="overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>Chấm điểm KPI</h3>
              <button className="close-btn" onClick={()=>setModal(false)}><Icon name="X" size={16} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Thành viên *</label>
                  <select className="select" required value={form.member_id} onChange={e=>setForm(f=>({...f,member_id:e.target.value}))}>
                    <option value="">Chọn thành viên...</option>
                    {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="g2">
                  <div className="form-group"><label className="label">Kỳ *</label><input className="input" required placeholder="2024-Q1" value={form.period} onChange={e=>setForm(f=>({...f,period:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Điểm *</label><input className="input" type="number" required value={form.score} onChange={e=>setForm(f=>({...f,score:+e.target.value}))} /></div>
                </div>
                <div className="form-group">
                  <label className="label">Hạng mục</label>
                  <select className="select" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                    {CATS.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="label">Ghi chú</label><textarea className="textarea" rows={2} value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} style={{ resize:'vertical' }} /></div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving?<><div className="spinner" style={{width:15,height:15,borderWidth:2}} />Lưu...</>:<><Icon name="Save" size={15} />Lưu điểm</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
