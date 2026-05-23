import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Icon } from '../components/Icon'

const COLORS = ['#F59E0B','#3B82F6','#16A34A','#9333EA','#EA580C','#0891B2','#EC4899','#DC2626']
const ICONS  = ['⭐','🏆','🚀','💡','🎯','🔥','💎','🌟','🎓','🤝','🦁','🏅','💪','🌈','⚡','🎪']

export function BadgesAdminPage() {
  const [badges, setBadges]   = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState<'create'|'award'|null>(null)
  const [selBadge, setSelBadge] = useState<any>(null)
  const [saving, setSaving]   = useState(false)
  const [badgeForm, setBadgeForm] = useState({ name:'', description:'', icon:'⭐', color:'#F59E0B' })
  const [awardForm, setAwardForm] = useState({ member_id:'', note:'' })

  useEffect(() => {
    Promise.all([api<any[]>('/badges'), api<any[]>('/members')])
      .then(([b,m]) => { setBadges(Array.isArray(b)?b:[]); setMembers(Array.isArray(m)?m:[]) })
      .catch(console.error).finally(()=>setLoading(false))
  }, [])

  const createBadge = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await api('/badges', { method:'POST', body:badgeForm })
      setModal(null)
      const b = await api<any[]>('/badges'); setBadges(Array.isArray(b)?b:[])
    } catch(e:any) { alert(e.message) } finally { setSaving(false) }
  }

  const award = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await api(`/badges/${selBadge.id}/award`, { method:'POST', body:awardForm })
      setModal(null); alert('Đã cấp huy hiệu thành công!')
    } catch(e:any) { alert(e.message) } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Xoá huy hiệu?')) return
    await api(`/badges/${id}`, { method:'DELETE' })
    setBadges(bs=>bs.filter(b=>b.id!==id))
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="row-between" style={{ marginBottom:20 }}>
        <span style={{ color:'var(--text-4)', fontSize:13.5 }}>{badges.length} huy hiệu</span>
        <button className="btn btn-primary" onClick={()=>{ setBadgeForm({name:'',description:'',icon:'⭐',color:'#F59E0B'}); setModal('create') }}>
          <Icon name="Plus" size={16} /> Tạo huy hiệu
        </button>
      </div>

      {badges.length===0
        ? <div className="empty"><Icon name="Medal" size={40} color="var(--stone-300)" /><span>Chưa có huy hiệu nào</span></div>
        : <div className="g3">
          {badges.map(badge=>(
            <div key={badge.id} className="card" style={{ textAlign:'center' }}>
              <div style={{ width:60, height:60, borderRadius:'50%', margin:'0 auto 14px', background:badge.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, border:`2px solid ${badge.color}35` }}>
                {badge.icon}
              </div>
              <h3 style={{ fontSize:14.5, fontWeight:700, marginBottom:4 }}>{badge.name}</h3>
              {badge.description && <p style={{ fontSize:12.5, color:'var(--text-4)', marginBottom:14, lineHeight:1.5 }}>{badge.description}</p>}
              {badge.awarded_count != null && (
                <p style={{ fontSize:12, color:'var(--text-4)', marginBottom:14 }}>Đã cấp: {badge.awarded_count} lần</p>
              )}
              <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                <button className="btn btn-secondary btn-sm" onClick={()=>{ setSelBadge(badge); setAwardForm({member_id:'',note:''}); setModal('award') }}>
                  <Icon name="Award" size={14} /> Cấp cho TV
                </button>
                <button className="btn btn-danger btn-sm" onClick={()=>del(badge.id)}><Icon name="Trash2" size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      }

      {/* Create badge modal */}
      {modal==='create' && (
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal modal-sm" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>Tạo huy hiệu mới</h3>
              <button className="close-btn" onClick={()=>setModal(null)}><Icon name="X" size={16} /></button>
            </div>
            <form onSubmit={createBadge}>
              <div className="modal-body">
                {/* Preview */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:16, background:'var(--stone-50)', borderRadius:'var(--r-lg)', marginBottom:18 }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', fontSize:26, background:badgeForm.color+'18', border:`2px solid ${badgeForm.color}35`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {badgeForm.icon}
                  </div>
                  <span style={{ fontWeight:600, fontSize:13 }}>{badgeForm.name||'Tên huy hiệu'}</span>
                </div>

                <div className="form-group"><label className="label">Tên *</label><input className="input" required value={badgeForm.name} onChange={e=>setBadgeForm(f=>({...f,name:e.target.value}))} /></div>
                <div className="form-group"><label className="label">Mô tả</label><textarea className="textarea" rows={2} value={badgeForm.description} onChange={e=>setBadgeForm(f=>({...f,description:e.target.value}))} style={{ resize:'vertical' }} /></div>

                <div className="form-group">
                  <label className="label">Icon</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {ICONS.map(icon=>(
                      <button key={icon} type="button" onClick={()=>setBadgeForm(f=>({...f,icon}))} style={{
                        width:36, height:36, fontSize:18, border:'1.5px solid',
                        borderColor: badgeForm.icon===icon ? 'var(--gold-500)' : 'var(--border)',
                        borderRadius:'var(--r-sm)',
                        background: badgeForm.icon===icon ? 'var(--gold-50)' : 'var(--stone-50)',
                        cursor:'pointer',
                      }}>{icon}</button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Màu sắc</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {COLORS.map(c=>(
                      <button key={c} type="button" onClick={()=>setBadgeForm(f=>({...f,color:c}))} style={{
                        width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer',
                        border: badgeForm.color===c ? '3px solid var(--stone-800)' : '3px solid transparent',
                        outline: badgeForm.color===c ? `2px solid ${c}` : 'none',
                        outlineOffset:2,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving?<><div className="spinner" style={{width:15,height:15,borderWidth:2}} />Lưu...</>:<><Icon name="Save" size={15} />Tạo</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Award modal */}
      {modal==='award' && selBadge && (
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal modal-sm" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>Cấp huy hiệu: {selBadge.name}</h3>
              <button className="close-btn" onClick={()=>setModal(null)}><Icon name="X" size={16} /></button>
            </div>
            <form onSubmit={award}>
              <div className="modal-body">
                <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', fontSize:26, background:selBadge.color+'18', border:`2px solid ${selBadge.color}35`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {selBadge.icon}
                  </div>
                </div>
                <div className="form-group"><label className="label">Thành viên *</label>
                  <select className="select" required value={awardForm.member_id} onChange={e=>setAwardForm(f=>({...f,member_id:e.target.value}))}>
                    <option value="">Chọn thành viên...</option>
                    {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="label">Lý do cấp huy hiệu</label><textarea className="textarea" rows={2} placeholder="Ghi lý do cấp huy hiệu..." value={awardForm.note} onChange={e=>setAwardForm(f=>({...f,note:e.target.value}))} style={{ resize:'vertical' }} /></div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving?<><div className="spinner" style={{width:15,height:15,borderWidth:2}} />Lưu...</>:<><Icon name="Award" size={15} />Cấp huy hiệu</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
