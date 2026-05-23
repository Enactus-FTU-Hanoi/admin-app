import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Icon } from '../components/Icon'

export function CnbAdminPage() {
  const [records, setRecords] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState({ member_id:'', period:'', type:'benefit', amount:0, note:'' })
  const [saving, setSaving]   = useState(false)
  const [filterPeriod, setFilterPeriod] = useState('all')

  useEffect(() => {
    Promise.all([api<any[]>('/cnb/all'), api<any[]>('/members')])
      .then(([r,m]) => { setRecords(Array.isArray(r)?r:[]); setMembers(Array.isArray(m)?m:[]) })
      .catch(console.error).finally(()=>setLoading(false))
  }, [])

  const periods  = ['all', ...Array.from(new Set(records.map(r=>r.period))).sort().reverse()]
  const filtered = filterPeriod==='all' ? records : records.filter(r=>r.period===filterPeriod)
  const fmt      = (n: number) => n.toLocaleString('vi-VN') + ' đ'
  const totalB   = filtered.filter(r=>r.type==='benefit').reduce((s,r)=>s+r.amount, 0)
  const totalD   = filtered.filter(r=>r.type==='deduction').reduce((s,r)=>s+r.amount, 0)

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await api('/cnb', { method:'POST', body:form })
      setModal(false)
      const r = await api<any[]>('/cnb/all'); setRecords(Array.isArray(r)?r:[])
    } catch(e:any) { alert(e.message) } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Xoá bản ghi?')) return
    await api(`/cnb/${id}`, { method:'DELETE' })
    setRecords(rs=>rs.filter(r=>r.id!==id))
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="g3" style={{ marginBottom:20 }}>
        {[
          { label:'Tổng phúc lợi',  value:fmt(totalB), icon:'TrendingUp' as const, bg:'var(--green-50)',  color:'var(--green-600)' },
          { label:'Tổng khấu trừ', value:fmt(totalD), icon:'CreditCard' as const,  bg:'var(--red-50)',    color:'var(--red-600)' },
          { label:'Số giao dịch',  value:filtered.length, icon:'BarChart3' as const, bg:'var(--blue-50)', color:'var(--blue-600)' },
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background:s.bg }}><Icon name={s.icon} size={20} color={s.color} /></div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color:s.color, fontSize:18 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="row-between" style={{ marginBottom:18 }}>
        <div className="tabs">
          {periods.map(p=>(
            <button key={p} className={`tab-item${filterPeriod===p?' active':''}`} onClick={()=>setFilterPeriod(p)}>
              {p==='all'?'Tất cả':p}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}>
          <Icon name="Plus" size={16} /> Thêm giao dịch
        </button>
      </div>

      {filtered.length===0
        ? <div className="empty"><Icon name="CreditCard" size={40} color="var(--stone-300)" /><span>Chưa có dữ liệu</span></div>
        : <div className="table-wrap">
          <table>
            <thead><tr><th>Thành viên</th><th>Kỳ</th><th>Loại</th><th>Số tiền</th><th>Ghi chú</th><th>Ngày</th><th></th></tr></thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={r.id}>
                  <td style={{ fontWeight:600 }}>{r.member_name||r.member_id}</td>
                  <td><span className="badge badge-gray">{r.period}</span></td>
                  <td><span className={`badge ${r.type==='benefit'?'badge-green':'badge-red'}`}>{r.type==='benefit'?'↑ Phúc lợi':'↓ Khấu trừ'}</span></td>
                  <td style={{ fontWeight:700, color:r.type==='benefit'?'var(--green-600)':'var(--red-600)' }}>{r.type==='benefit'?'+':'-'}{fmt(r.amount)}</td>
                  <td style={{ color:'var(--text-4)', fontSize:13 }}>{r.note||'—'}</td>
                  <td style={{ color:'var(--text-4)', fontSize:13 }}>{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={()=>del(r.id)}><Icon name="Trash2" size={13} /></button></td>
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
              <h3>Thêm giao dịch C&B</h3>
              <button className="close-btn" onClick={()=>setModal(false)}><Icon name="X" size={16} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group"><label className="label">Thành viên *</label>
                  <select className="select" required value={form.member_id} onChange={e=>setForm(f=>({...f,member_id:e.target.value}))}>
                    <option value="">Chọn thành viên...</option>
                    {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="g2">
                  <div className="form-group"><label className="label">Kỳ *</label><input className="input" required placeholder="2024-Q1" value={form.period} onChange={e=>setForm(f=>({...f,period:e.target.value}))} /></div>
                  <div className="form-group"><label className="label">Loại *</label>
                    <select className="select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                      <option value="benefit">↑ Phúc lợi</option>
                      <option value="deduction">↓ Khấu trừ</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="label">Số tiền (VNĐ) *</label><input className="input" type="number" required min={0} value={form.amount} onChange={e=>setForm(f=>({...f,amount:+e.target.value}))} /></div>
                <div className="form-group"><label className="label">Ghi chú</label><textarea className="textarea" rows={2} value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} style={{ resize:'vertical' }} /></div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving?<><div className="spinner" style={{width:15,height:15,borderWidth:2}} />Lưu...</>:<><Icon name="Save" size={15} />Lưu</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
