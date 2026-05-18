import { useState } from 'react'
import { useAuth } from '../App'
import { api } from '../lib/api'

export function SettingsPage() {
  const { admin } = useAuth()
  const [pwForm, setPwForm] = useState({ current:'', newPw:'', confirm:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState<{type:'ok'|'err',text:string}|null>(null)

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPw !== pwForm.confirm) return setMsg({ type:'err', text:'Mật khẩu mới không khớp' })
    if (pwForm.newPw.length < 8) return setMsg({ type:'err', text:'Mật khẩu phải tối thiểu 8 ký tự' })
    setSaving(true); setMsg(null)
    try {
      await api('/auth/change-password', { method:'POST', body: { currentPassword: pwForm.current, newPassword: pwForm.newPw } })
      setMsg({ type:'ok', text:'Đổi mật khẩu thành công!' })
      setPwForm({ current:'', newPw:'', confirm:'' })
    } catch(e:any) {
      setMsg({ type:'err', text: e.message || 'Lỗi không xác định' })
    } finally { setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title" style={{ marginBottom: 18 }}>Thông tin tài khoản</div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[
            { label:'Họ tên',  value: admin?.name },
            { label:'Email',   value: admin?.email },
            { label:'Role',    value: admin?.role === 'super_admin' ? 'Super Admin' : 'Admin' },
          ].map(row => (
            <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:13, color:'var(--text-3)', fontWeight:500 }}>{row.label}</span>
              <span style={{ fontSize:13.5, fontWeight:600 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 18 }}>Đổi mật khẩu</div>
        <form onSubmit={changePw} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="form-group">
            <label className="label">Mật khẩu hiện tại</label>
            <input className="input" type="password" value={pwForm.current} onChange={e => setPwForm(f=>({...f,current:e.target.value}))} required />
          </div>
          <div className="form-group">
            <label className="label">Mật khẩu mới</label>
            <input className="input" type="password" value={pwForm.newPw} onChange={e => setPwForm(f=>({...f,newPw:e.target.value}))} required />
          </div>
          <div className="form-group">
            <label className="label">Xác nhận mật khẩu mới</label>
            <input className="input" type="password" value={pwForm.confirm} onChange={e => setPwForm(f=>({...f,confirm:e.target.value}))} required />
          </div>

          {msg && (
            <div style={{
              padding:'10px 14px', borderRadius:'var(--r-sm)', fontSize:13.5,
              background: msg.type==='ok' ? 'var(--green-lt)' : '#FEF2F2',
              color: msg.type==='ok' ? 'var(--green)' : '#B91C1C',
              border: `1px solid ${msg.type==='ok' ? '#BBF7D0' : '#FECACA'}`,
            }}>
              {msg.type==='ok' ? '✓ ' : '⚠ '}{msg.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf:'flex-start' }}>
            {saving ? <><div className="spinner" style={{width:15,height:15,borderWidth:2}} /> Đang lưu...</> : 'Cập nhật mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  )
}
