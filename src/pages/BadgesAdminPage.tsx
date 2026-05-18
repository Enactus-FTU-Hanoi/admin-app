import { useState, useEffect } from 'react'
import { api } from '../lib/api'

type Badge  = { id: string; name: string; description?: string; icon: string; color: string; created_at: string; awarded_count?: number }
type Member = { id: string; name: string }

const COLORS = ['#FFC107','#E8192C','#2563EB','#16A34A','#7C3AED','#EA580C','#0891B2','#DB2777']
const ICONS  = ['🏆','⭐','🚀','💡','🎯','🔥','💎','🌟','🎓','🤝','🦁','🏅']

export function BadgesAdminPage() {
  const [badges, setBadges]   = useState<Badge[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState<'create'|'award'|null>(null)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [saving, setSaving]   = useState(false)
  const [badgeForm, setBadgeForm] = useState({ name:'', description:'', icon:'🏆', color:'#FFC107' })
  const [awardForm, setAwardForm] = useState({ member_id:'', note:'' })

  useEffect(() => {
    Promise.all([api<Badge[]>('/badges'), api<Member[]>('/members')])
      .then(([b, m]) => { setBadges(b); setMembers(m) }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const createBadge = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await api('/badges', { method:'POST', body: badgeForm })
      setModal(null)
      const b = await api<Badge[]>('/badges')
      setBadges(b)
    } catch(e:any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const award = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await api(`/badges/${selectedBadge!.id}/award`, { method:'POST', body: awardForm })
      setModal(null)
      alert('Đã cấp huy hiệu thành công!')
    } catch(e:any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Xoá huy hiệu này?')) return
    await api(`/badges/${id}`, { method:'DELETE' })
    setBadges(bs => bs.filter(b => b.id !== id))
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 20 }}>
        <span style={{ color:'var(--text-3)', fontSize:13.5 }}>{badges.length} huy hiệu</span>
        <button className="btn btn-primary btn-sm" onClick={() => { setBadgeForm({name:'',description:'',icon:'🏆',color:'#FFC107'}); setModal('create') }}>+ Tạo huy hiệu</button>
      </div>

      {badges.length === 0 ? (
        <div className="empty">
          <span style={{ fontSize:40 }}>⬡</span>
          <span>Chưa có huy hiệu nào</span>
        </div>
      ) : (
        <div className="g3">
          {badges.map(badge => (
            <div key={badge.id} className="card" style={{ textAlign:'center', position:'relative' }}>
              <div style={{
                width:64, height:64, borderRadius:'50%', margin:'0 auto 12px',
                background: badge.color + '20',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:28,
                border: `2px solid ${badge.color}40`,
              }}>
                {badge.icon}
              </div>
              <h3 style={{ fontSize:14.5, fontWeight:700, marginBottom:4 }}>{badge.name}</h3>
              {badge.description && <p style={{ fontSize:12.5, color:'var(--text-3)', marginBottom:10, lineHeight:1.5 }}>{badge.description}</p>}
              {badge.awarded_count !== undefined && (
                <p style={{ fontSize:12, color:'var(--text-4)', marginBottom:12 }}>Đã cấp: {badge.awarded_count} lần</p>
              )}
              <div style={{ display:'flex', gap:6, justifyContent:'center' }}>
                <button className="btn btn-outline btn-sm" onClick={() => { setSelectedBadge(badge); setAwardForm({member_id:'',note:''}); setModal('award') }}>
                  Cấp cho TV
                </button>
                <button className="btn btn-sm" style={{background:'#FEF2F2',color:'#B91C1C',border:'1px solid #FECACA'}} onClick={() => del(badge.id)}>Xoá</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create badge modal */}
      {modal === 'create' && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Tạo huy hiệu mới</h3>
              <button className="close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={createBadge}>
              <div className="modal-body">
                {/* Preview */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:16, background:'var(--surface)', borderRadius:'var(--r-md)', marginBottom:16 }}>
                  <div style={{
                    width:56, height:56, borderRadius:'50%', fontSize:24,
                    background: badgeForm.color + '20', border: `2px solid ${badgeForm.color}50`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>{badgeForm.icon}</div>
                  <span style={{ fontWeight:600, fontSize:14 }}>{badgeForm.name || 'Tên huy hiệu'}</span>
                </div>

                <div className="form-group">
                  <label className="label">Tên *</label>
                  <input className="input" required value={badgeForm.name} onChange={e => setBadgeForm(f=>({...f,name:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="label">Mô tả</label>
                  <textarea className="textarea" rows={2} value={badgeForm.description} onChange={e => setBadgeForm(f=>({...f,description:e.target.value}))} style={{resize:'vertical'}} />
                </div>
                <div className="form-group">
                  <label className="label">Icon</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {ICONS.map(icon => (
                      <button key={icon} type="button"
                        onClick={() => setBadgeForm(f=>({...f,icon}))}
                        style={{
                          width:36, height:36, fontSize:18, border:'1.5px solid',
                          borderColor: badgeForm.icon===icon ? 'var(--amber)' : 'var(--border)',
                          borderRadius:'var(--r-sm)', background: badgeForm.icon===icon ? 'var(--amber-soft)' : 'var(--surface)',
                          cursor:'pointer',
                        }}>{icon}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Màu</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setBadgeForm(f=>({...f,color:c}))}
                        style={{ width:28, height:28, borderRadius:'50%', background:c, border: badgeForm.color===c ? '3px solid #111' : '3px solid transparent', cursor:'pointer' }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '...' : 'Tạo huy hiệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Award modal */}
      {modal === 'award' && selectedBadge && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Cấp huy hiệu: {selectedBadge.name}</h3>
              <button className="close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={award}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Thành viên *</label>
                  <select className="select" required value={awardForm.member_id} onChange={e => setAwardForm(f=>({...f,member_id:e.target.value}))}>
                    <option value="">Chọn thành viên...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Ghi chú</label>
                  <textarea className="textarea" rows={2} placeholder="Lý do cấp huy hiệu..." value={awardForm.note} onChange={e => setAwardForm(f=>({...f,note:e.target.value}))} style={{resize:'vertical'}} />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '...' : '🏆 Cấp huy hiệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
