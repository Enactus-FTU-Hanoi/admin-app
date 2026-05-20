import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Icon } from '../components/Icon'

type Poll = { 
  id: string; title: string; description?: string; 
  time_slots: string; deadline?: string; status: string; 
  created_at: string; response_count?: number; 
  type?: 'list' | 'range'
  start_date?: string; end_date?: string
  start_hour?: number; end_hour?: number
}
type VoteResult = { slot: string; count: number; voters: string[] }

export function ScheduleAdminPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create'|'results'|null>(null)
  const [selected, setSelected] = useState<Poll | null>(null)
  const [results, setResults] = useState<VoteResult[]>([])
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [pollType, setPollType] = useState<'list' | 'range'>('list')
  const [form, setForm] = useState({ title:'', description:'', deadline:'', slotsRaw:'' })
  const [rangeForm, setRangeForm] = useState({
    startDate: '', endDate: '', startHour: 8, endHour: 20, slotDuration: 30
  })

  useEffect(() => {
    api<any>('/schedule/polls/all')
      .then(data => {
        let pollsData: Poll[] = []
        if (Array.isArray(data)) {
          pollsData = data
        } else if (data && typeof data === 'object' && Array.isArray(data.polls)) {
          pollsData = data.polls
        } else if (data && typeof data === 'object' && Array.isArray(data.results)) {
          pollsData = data.results
        }
        setPolls(pollsData)
      })
      .catch(() => setPolls([]))
      .finally(() => setLoading(false))
  }, [])

  const saveListPoll = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const slots = form.slotsRaw.split('\n').map(s => s.trim()).filter(Boolean)
      await api('/schedule/polls', { method:'POST', body: {
        title: form.title, description: form.description,
        deadline: form.deadline || undefined,
        time_slots: JSON.stringify(slots),
      }})
      setModal(null)
      resetForm()
      const p = await api<any>('/schedule/polls/all')
      let pollsData: Poll[] = []
      if (Array.isArray(p)) pollsData = p
      else if (p?.polls) pollsData = p.polls
      setPolls(pollsData)
    } catch(e:any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const saveRangePoll = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await api('/schedule/polls/range', { method:'POST', body: {
        title: form.title, description: form.description,
        deadline: form.deadline || undefined,
        startDate: rangeForm.startDate,
        endDate: rangeForm.endDate,
        startHour: rangeForm.startHour,
        endHour: rangeForm.endHour,
        slotDuration: rangeForm.slotDuration
      }})
      setModal(null)
      resetForm()
      const p = await api<any>('/schedule/polls/all')
      let pollsData: Poll[] = []
      if (Array.isArray(p)) pollsData = p
      else if (p?.polls) pollsData = p.polls
      setPolls(pollsData)
    } catch(e:any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const resetForm = () => {
    setForm({ title:'', description:'', deadline:'', slotsRaw:'' })
    setRangeForm({ startDate: '', endDate: '', startHour: 8, endHour: 20, slotDuration: 30 })
    setPollType('list')
  }

  const viewResults = async (poll: Poll) => {
    setSelected(poll)
    try {
      const r = await api<VoteResult[]>(`/schedule/polls/${poll.id}/results`)
      setResults(Array.isArray(r) ? r : [])
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
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setModal('create') }}>
          <Icon name="Plus" size={16} /> Tạo poll
        </button>
      </div>

      {polls.length === 0 ? (
        <div className="empty"><Icon name="Calendar" size={36} /><span>Chưa có poll nào</span></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {polls.map(poll => {
            let slots: string[] = []
            try {
              if (typeof poll.time_slots === 'string') {
                slots = JSON.parse(poll.time_slots || '[]')
              } else if (Array.isArray(poll.time_slots)) {
                slots = poll.time_slots
              }
            } catch { slots = [] }
            return (
              <div key={poll.id} className="card">
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <h3 style={{ fontSize:15, fontWeight:700 }}>{poll.title}</h3>
                      {poll.type === 'range' && <span className="badge b-amber">When2meet</span>}
                      <span className={`badge ${poll.status==='open'?'b-green':'b-gray'}`}>
                        {poll.status==='open'?'● Đang mở':'Đã đóng'}
                      </span>
                    </div>
                    {poll.description && <p style={{ color:'var(--text-3)', fontSize:13.5, marginBottom:8 }}>{poll.description}</p>}
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {slots.slice(0, 10).map(s => (
                        <span key={s} className="badge b-blue" style={{ fontSize:12 }}>{s}</span>
                      ))}
                      {slots.length > 10 && <span className="badge b-gray">+{slots.length - 10} slots</span>}
                    </div>
                    {poll.deadline && (
                      <p style={{ fontSize:12, color:'var(--text-4)', marginTop:8 }}>
                        ⏰ Hạn: {new Date(poll.deadline).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => viewResults(poll)}>Kết quả</button>
                    <button className={`btn btn-sm ${poll.status==='open'?'btn-outline':'btn-primary'}`} onClick={() => toggleStatus(poll)}>
                      {poll.status==='open'?'Đóng poll':'Mở lại'}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => del(poll.id)}>Xoá</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      {modal === 'create' && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Tạo poll lịch họp</h3>
              <button className="close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={pollType === 'list' ? saveListPoll : saveRangePoll}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Tiêu đề *</label>
                  <input className="input" required value={form.title} onChange={e => setForm(f=>({...f, title:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="label">Mô tả</label>
                  <textarea className="textarea" rows={2} value={form.description} onChange={e => setForm(f=>({...f, description:e.target.value}))} />
                </div>

                {/* Chọn kiểu tạo poll */}
                <div className="form-group">
                  <label className="label">Kiểu tạo lịch</label>
                  <div className="row" style={{ gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="radio" value="list" checked={pollType === 'list'} onChange={() => setPollType('list')} />
                      Danh sách slot (nhập từng khung)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="radio" value="range" checked={pollType === 'range'} onChange={() => setPollType('range')} />
                      Khoảng thời gian (When2meet)
                    </label>
                  </div>
                </div>

                {pollType === 'list' ? (
                  <div className="form-group">
                    <label className="label">Các khung giờ (mỗi dòng 1 slot) *</label>
                    <textarea className="textarea" required rows={5} 
                      placeholder={"Thứ 2, 18:00-20:00\nThứ 3, 19:00-21:00\nThứ 7, 9:00-11:00"} 
                      value={form.slotsRaw} onChange={e => setForm(f=>({...f, slotsRaw:e.target.value}))} />
                  </div>
                ) : (
                  <>
                    <div className="g2">
                      <div className="form-group">
                        <label className="label">Ngày bắt đầu *</label>
                        <input type="date" className="input" required 
                          value={rangeForm.startDate} 
                          onChange={e => setRangeForm(f=>({...f, startDate:e.target.value}))} />
                      </div>
                      <div className="form-group">
                        <label className="label">Ngày kết thúc *</label>
                        <input type="date" className="input" required 
                          value={rangeForm.endDate} 
                          onChange={e => setRangeForm(f=>({...f, endDate:e.target.value}))} />
                      </div>
                    </div>
                    <div className="g2">
                      <div className="form-group">
                        <label className="label">Giờ bắt đầu *</label>
                        <input type="number" className="input" required min={0} max={23}
                          value={rangeForm.startHour} 
                          onChange={e => setRangeForm(f=>({...f, startHour:parseInt(e.target.value)}))} />
                      </div>
                      <div className="form-group">
                        <label className="label">Giờ kết thúc *</label>
                        <input type="number" className="input" required min={0} max={23}
                          value={rangeForm.endHour} 
                          onChange={e => setRangeForm(f=>({...f, endHour:parseInt(e.target.value)}))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="label">Độ dài mỗi slot (phút)</label>
                      <select className="select" value={rangeForm.slotDuration} 
                        onChange={e => setRangeForm(f=>({...f, slotDuration:parseInt(e.target.value)}))}>
                        <option value={15}>15 phút</option>
                        <option value={30}>30 phút</option>
                        <option value={60}>1 giờ</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="label">Hạn chót vote (không bắt buộc)</label>
                  <input type="datetime-local" className="input" value={form.deadline} 
                    onChange={e => setForm(f=>({...f, deadline:e.target.value}))} />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Icon name="Loader2" size={16} className="spin" /> : <Icon name="Plus" size={16} />}
                  {saving ? ' Đang tạo...' : ' Tạo poll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {modal === 'results' && selected && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Kết quả: {selected.title}</h3>
              <button className="close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {!results || results.length === 0 ? (
                <div className="empty">Chưa có ai vote</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {[...results].sort((a,b) => b.count - a.count).map(r => (
                    <div key={r.slot}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontWeight:600 }}>{r.slot}</span>
                        <span className="badge b-green">{r.count} người</span>
                      </div>
                      <div className="progress-track" style={{ marginBottom:6 }}>
                        <div className="progress-fill" style={{
                          width: `${results[0]?.count > 0 ? (r.count/results[0].count)*100 : 0}%`,
                          background: 'var(--amber)',
                        }} />
                      </div>
                      <div style={{ fontSize:12, color:'var(--text-4)' }}>{r.voters?.join(', ') || ''}</div>
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