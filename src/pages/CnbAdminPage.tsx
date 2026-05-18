import { useState, useEffect } from 'react'
import { api } from '../lib/api'

type CnbRecord = { id: string; member_id: string; member_name?: string; period: string; type: 'benefit'|'deduction'; amount: number; note?: string; created_at: string }
type Member = { id: string; name: string }

export function CnbAdminPage() {
  const [records, setRecords] = useState<CnbRecord[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState({ member_id:'', period:'', type:'benefit', amount:0, note:'' })
  const [saving, setSaving]   = useState(false)
  const [filterPeriod, setFilterPeriod] = useState('all')

  useEffect(() => {
    Promise.all([api<CnbRecord[]>('/cnb/all'), api<Member[]>('/members')])
      .then(([r, m]) => { setRecords(r); setMembers(m) }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const periods = ['all', ...Array.from(new Set(records.map(r => r.period))).sort().reverse()]
  const filtered = filterPeriod === 'all' ? records : records.filter(r => r.period === filterPeriod)

  const totalBenefits   = filtered.filter(r => r.type==='benefit').reduce((s,r) => s+r.amount, 0)
  const totalDeductions = filtered.filter(r => r.type==='deduction').reduce((s,r) => s+r.amount, 0)

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await api('/cnb', { method:'POST', body: form })
      setModal(false)
      const r = await api<CnbRecord[]>('/cnb/all')
      setRecords(r)
    } catch(e:any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Xoá bản ghi này?')) return
    await api(`/cnb/${id}`, { method:'DELETE' })
    setRecords(rs => rs.filter(r => r.id !== id))
  }

  const fmt = (n: number) => n.toLocaleString('vi-VN') + ' đ'

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      {/* Summary */}
      <div className="g3" style={{ marginBottom: 20 }}>
        {[
          { label:'Tổng phúc lợi',  value: fmt(totalBenefits),   color:'var(--green)' },
          { label:'Tổng khấu trừ', value: fmt(totalDeductions), color:'var(--red)' },
          { label:'Số giao dịch',  value: filtered.length,       color:'var(--blue)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-blob" style={{ background: s.color, opacity:.08 }} />
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize:20 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="row-between" style={{ marginBottom: 18 }}>
        <div className="tabs">
          {periods.map(p => (
            <button key={p} className={`tab-item${filterPeriod===p?' active':''}`} onClick={() => setFilterPeriod(p)}>
              {p === 'all' ? 'Tất cả' : p}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Thêm giao dịch</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr>
            <th>Thành viên</th><th>Kỳ</th><th>Loại</th><th>Số tiền</th><th>Ghi chú</th><th>Ngày</th><th></th>
          </tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'var(--text-4)'}}>Chưa có dữ liệu</td></tr>
              : filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight:600 }}>{r.member_name || r.member_id}</td>
                  <td><span className="badge b-gray">{r.period}</span></td>
                  <td><span className={`badge ${r.type==='benefit'?'b-green':'b-red'}`}>{r.type==='benefit'?'↑ Phúc lợi':'↓ Khấu trừ'}</span></td>
                  <td style={{ fontWeight:700, color: r.type==='benefit'?'var(--green)':'var(--red)' }}>
                    {r.type==='benefit'?'+':'-'}{fmt(r.amount)}
                  </td>
                  <td style={{ color:'var(--text-3)', fontSize:13 }}>{r.note||'—'}</td>
                  <td style={{ color:'var(--text-4)', fontSize:13 }}>{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <button className="btn btn-sm" style={{background:'#FEF2F2',color:'#B91C1C',border:'1px solid #FECACA'}} onClick={() => del(r.id)}>Xoá</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Thêm giao dịch C&B</h3>
              <button className="close-btn" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Thành viên *</label>
                  <select className="select" required value={form.member_id} onChange={e => setForm(f=>({...f,member_id:e.target.value}))}>
                    <option value="">Chọn thành viên...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="g2">
                  <div className="form-group">
                    <label className="label">Kỳ *</label>
                    <input className="input" required placeholder="2024-Q1" value={form.period} onChange={e => setForm(f=>({...f,period:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="label">Loại *</label>
                    <select className="select" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value as any}))}>
                      <option value="benefit">↑ Phúc lợi</option>
                      <option value="deduction">↓ Khấu trừ</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Số tiền (VNĐ) *</label>
                  <input className="input" type="number" required min={0} value={form.amount} onChange={e => setForm(f=>({...f,amount:+e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="label">Ghi chú</label>
                  <textarea className="textarea" rows={2} value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))} style={{resize:'vertical'}} />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" style={{width:15,height:15,borderWidth:2}} /> Lưu...</> : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
