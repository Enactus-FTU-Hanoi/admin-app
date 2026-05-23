import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Icon } from '../components/Icon'

export function ScheduleAdminPage() {
  const [polls, setPolls]       = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState<'create'|'results'|null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [results, setResults]   = useState<any[]>([])
  const [form, setForm]         = useState({ title:'', description:'', deadline:'', slotsRaw:'' })
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    api<any[]>('/schedule/polls/all').then(d=>setPolls(Array.isArray(d)?d:[]))
      .catch(console.error).finally(()=>setLoading(false))
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const slots = form.slotsRaw.split('\n').map(s=>s.trim()).filter(Boolean)
      await api('/schedule/polls', { method:'POST', body:{ title:form.title, description:form.description, deadline:form.deadline||undefined, time_slots:JSON.stringify(slots) }})
      setModal(null)
      const p = await api<any[]>('/schedule/polls/all'); setPolls(Array.isArray(p)?p:[])
    } catch(e:any) { alert(e.message) } finally { setSaving(false) }
  }

  const viewResults = async (poll: any) => {
    setSelected(poll)
    try { const r = await api<any[]>(`/schedule/polls/${poll.id}/results`); setResults(Array.isArray(r)?r:[]) }
    catch { setResults([]) }
    setModal('results')
  }

  const toggleStatus = async (poll: any) => {
    const s = poll.status==='open'?'closed':'open'
    await api(`/schedule/polls/${poll.id}`, { method:'PATCH', body:{ status:s } })
    setPolls(ps=>ps.map(p=>p.id===poll.id?{...p,status:s}:p))
  }

  const del = async (id: string) => {
    if (!confirm('Xoá poll?')) return
    await api(`/schedule/polls/${id}`, { method:'DELETE' })
    setPolls(ps=>ps.filter(p=>p.id!==id))
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="row-between" style={{ marginBottom:18 }}>
        <span style={{ color:'var(--text-4)', fontSize:13.5 }}>{polls.length} poll tổng cộng</span>
        <button className="btn btn-primary" onClick={()=>{ setForm({title:'',description:'',deadline:'',slotsRaw:''}); setModal('create') }}>
          <Icon name="Plus" size={16} /> Tạo poll
        </button>
      </div>

      {polls.length===0
        ? <div className="empty"><Icon name="Calendar" size={40} color="var(--stone-300)" /><span>Chưa có poll nào</span></div>
        : <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {polls.map(poll => {
            let slots: string[] = []
            try { slots = JSON.parse(poll.time_slots||'[]') } catch {}
            if (!Array.isArray(slots)) slots = []
            return (
              <div key={poll.id} className="card">
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <h3 style={{ fontSize:15, fontWeight:700 }}>{poll.title}</h3>
                      <span className={`badge ${poll.status==='open'?'badge-green':'badge-gray'}`}>
                        {poll.status==='open'?'Đang mở':'Đã đóng'}
                      </span>
                    </div>
                    {poll.description && <p style={{ color:'var(--text-4)', fontSize:13, marginBottom:8 }}>{poll.description}</p>}
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {slots.map(s=><span key={s} className="badge badge-blue" style={{ fontSize:11.5 }}>{s}</span>)}
                    </div>
                    {poll.deadline && (
                      <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12.5, color:'var(--text-4)', marginTop:8 }}>
                        <Icon name="Clock" size={12} /> Hạn: {new Date(poll.deadline).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button className="btn btn-secondary btn-sm" onClick={()=>viewResults(poll)}>
                      <Icon name="BarChart3" size={14} /> Kết quả
                    </button>
                    <button className={`btn btn-sm ${poll.status==='open'?'btn-secondary':'btn-primary'}`} onClick={()=>toggleStatus(poll)}>
                      {poll.status==='open'?'Đóng':'Mở lại'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={()=>del(poll.id)}><Icon name="Trash2" size={14} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      }

      {modal==='create' && (
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>Tạo poll lịch họp</h3>
              <button className="close-btn" onClick={()=>setModal(null)}><Icon name="X" size={16} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group"><label className="label">Tiêu đề *</label><input className="input" required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></div>
                <div className="form-group"><label className="label">Mô tả</label><textarea className="textarea" rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{ resize:'vertical' }} /></div>
                <div className="form-group"><label className="label">Hạn chót vote</label><input className="input" type="datetime-local" value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))} /></div>
                <div className="form-group">
                  <label className="label">Các khung giờ (mỗi dòng 1 slot) *</label>
                  <textarea className="textarea" required rows={5} placeholder={"Thứ 2, 18:00-20:00\nThứ 3, 19:00-21:00\nThứ 7, 9:00-11:00"} value={form.slotsRaw} onChange={e=>setForm(f=>({...f,slotsRaw:e.target.value}))} style={{ resize:'vertical' }} />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving?<><div className="spinner" style={{width:15,height:15,borderWidth:2}} />Lưu...</>:<><Icon name="Save" size={15} />Tạo poll</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal==='results' && selected && (
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>Kết quả: {selected.title}</h3>
              <button className="close-btn" onClick={()=>setModal(null)}><Icon name="X" size={16} /></button>
            </div>
            <div className="modal-body">
              {results.length===0
                ? <div className="empty" style={{ padding:'24px 0' }}><Icon name="BarChart3" size={32} color="var(--stone-300)" /><span>Chưa có ai vote</span></div>
                : <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {results.sort((a,b)=>b.count-a.count).map(r=>(
                    <div key={r.slot}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontWeight:600, fontSize:13.5 }}>{r.slot}</span>
                        <span className="badge badge-green">{r.count} người</span>
                      </div>
                      <div className="progress-track" style={{ marginBottom:5 }}>
                        <div className="progress-fill" style={{ width:`${results[0].count>0?(r.count/results[0].count)*100:0}%` }} />
                      </div>
                      {r.voters?.length > 0 && <div style={{ fontSize:12, color:'var(--text-4)' }}>{r.voters.join(', ')}</div>}
                    </div>
                  ))}
                </div>
              }
            </div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={()=>setModal(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
