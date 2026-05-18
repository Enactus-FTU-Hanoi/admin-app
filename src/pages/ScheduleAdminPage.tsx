import { useState, useEffect } from 'react'
import { api } from '../lib/api'

type Poll = { id: string; title: string; description?: string; time_slots: string; deadline?: string; status: string; created_at: string; response_count?: number }
type VoteResult = { slot: string; count: number; voters: string[] }

export function ScheduleAdminPage() {
  const [polls, setPolls]     = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState<'create'|'results'|null>(null)
  const [selected, setSelected] = useState<Poll | null>(null)
  const [results, setResults]   = useState<VoteResult[]>([])
  const [form, setForm] = useState({ title:'', description:'', deadline:'', slotsRaw:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api<Poll[]>('/schedule/polls/all').then(setPolls).catch(console.error).finally(() => setLoading(false))
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const slots = form.slotsRaw.split('\n').map(s => s.trim()).filter(Boolean)
      await api('/schedule/polls', { method:'POST', body: {
        title: form.title, description: form.description,
        deadline: form.deadline || undefined,
        time_slots: JSON.stringify(slots),
      }})
      setModal(null)
      const p = await api<Poll[]>('/schedule/polls/all')
      setPolls(p)
    } catch(e:any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const viewResults = async (poll: Poll) => {
    setSelected(poll)
    try {
      const r = await api<VoteResult[]>(`/schedule/polls/${poll.id}/results`)
      setResults(r)
    } catch { setResults([]) }
    setModal('results')
  }

  const toggleStatus = async (poll: Poll) => {
    const newStatus = poll.status === 'open' ? 'closed' : 'open'
    await api(`/schedule/polls/${poll.id}`, { method:'PATCH', body: { status: newStatus } })
    setPolls(ps => ps.map(p => p.id === poll.id ? { ...p, status: newStatus } : p))
  }

  const del = async (id: string) => {
    if (!confirm('Xoá poll này?')) return
    await api(`/schedule/polls/${id}`, { method: 'DELETE' })
    setPolls(ps => ps.filter(p => p.id !== id))
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 18 }}>
        <span style={{ color:'var(--text-3)', fontSize:13.5 }}>{polls.length} poll tổng cộng</span>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({title:'',description:'',deadline:'',slotsRaw:''}); setModal('create') }}>+ Tạo poll</button>
      </div>

      {polls.length === 0 ? (
        <div className="empty">
          <span style={{fontSize:36}}>📅</span>
          <span>Chưa có poll nào</span>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {polls.map(poll => {
            const slots: string[] = (() => { try { return JSON.parse(poll.time_slots||'[]') } catch { return [] } })()
            return (
              <div key={poll.id} className="card">
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <h3 style={{ fontSize:15, fontWeight:700 }}>{poll.title}</h3>
                      <span className={`badge ${poll.status==='open'?'b-green':'b-gray'}`}>
                        {poll.status==='open'?'● Đang mở':'Đã đóng'}
                      </span>
                    </div>
                    {poll.description && <p style={{ color:'var(--text-3)', fontSize:13.5, marginBottom:8 }}>{poll.description}</p>}
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {slots.map(s => (
                        <span key={s} className="badge b-blue" style={{ fontSize:12 }}>{s}</span>
                      ))}
                    </div>
                    {poll.deadline && (
                      <p style={{ fontSize:12, color:'var(--text-4)', marginTop:8 }}>
                        ⏰ Hạn: {new Date(poll.deadline).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => viewResults(poll)}>Xem kết quả</button>
                    <button
                      className={`btn btn-sm ${poll.status==='open'?'btn-outline':'btn-primary'}`}
                      onClick={() => toggleStatus(poll)}
                    >
                      {poll.status==='open'?'Đóng poll':'Mở lại'}
                    </button>
                    <button className="btn btn-sm" style={{background:'#FEF2F2',color:'#B91C1C',border:'1px solid #FECACA'}} onClick={() => del(poll.id)}>Xoá</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create modal */}
      {modal === 'create' && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Tạo poll lịch họp</h3>
              <button className="close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Tiêu đề *</label>
                  <input className="input" required value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="label">Mô tả</label>
                  <textarea className="textarea" rows={2} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} style={{resize:'vertical'}} />
                </div>
                <div className="form-group">
                  <label className="label">Hạn chót vote</label>
                  <input className="input" type="datetime-local" value={form.deadline} onChange={e => setForm(f=>({...f,deadline:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="label">Các khung giờ (mỗi dòng 1 slot) *</label>
                  <textarea className="textarea" required rows={5} placeholder={"Thứ 2, 18:00-20:00\nThứ 3, 19:00-21:00\nThứ 7, 9:00-11:00"} value={form.slotsRaw} onChange={e => setForm(f=>({...f,slotsRaw:e.target.value}))} style={{resize:'vertical'}} />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" style={{width:15,height:15,borderWidth:2}} /> Lưu...</> : 'Tạo poll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results modal */}
      {modal === 'results' && selected && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Kết quả: {selected.title}</h3>
              <button className="close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {results.length === 0 ? (
                <div className="empty" style={{padding:'24px 0'}}>Chưa có ai vote</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {results.sort((a,b) => b.count - a.count).map(r => (
                    <div key={r.slot}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontWeight:600 }}>{r.slot}</span>
                        <span className="badge b-green">{r.count} người</span>
                      </div>
                      <div className="progress-track" style={{ marginBottom:6 }}>
                        <div className="progress-fill" style={{
                          width: `${results[0].count > 0 ? (r.count/results[0].count)*100 : 0}%`,
                          background: 'var(--amber)',
                        }} />
                      </div>
                      <div style={{ fontSize:12, color:'var(--text-4)' }}>{r.voters?.join(', ')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
