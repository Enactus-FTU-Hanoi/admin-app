import { useState } from 'react'
import { useAuth } from '../App'
import { api } from '../lib/api'
import { Icon } from '../components/Icon'

export function SettingsPage() {
  const { admin } = useAuth()
  const [pwForm, setPwForm] = useState({ current:'', newPw:'', confirm:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState<{ type:'ok'|'err'; text:string }|null>(null)

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPw !== pwForm.confirm) return setMsg({ type:'err', text:'Mật khẩu mới không khớp' })
    if (pwForm.newPw.length < 8) return setMsg({ type:'err', text:'Mật khẩu phải tối thiểu 8 ký tự' })
    setSaving(true); setMsg(null)
    try {
      await api('/auth/change-password', { method:'POST', body:{ currentPassword:pwForm.current, newPassword:pwForm.newPw } })
      setMsg({ type:'ok', text:'Đổi mật khẩu thành công!' })
      setPwForm({ current:'', newPw:'', confirm:'' })
    } catch(e:any) { setMsg({ type:'err', text:e.message || 'Lỗi không xác định' }) }
    finally { setSaving(false) }
  }

  const INFO_ROWS = [
    { label:'Họ tên', value:admin?.name },
    { label:'Email',  value:admin?.email },
    { label:'Role',   value:admin?.role==='super_admin'?'Super Admin':'Admin' },
  ]

  return (
    <div style={{ maxWidth:600 }}>
      {/* Account info */}
      <div className="card" style={{ marginBottom:20 }}>
        <div className="card-head">
          <div className="card-title">Thông tin tài khoản</div>
          <div className="avatar avatar-md">{admin?.name?.split(' ').map((w:string)=>w[0]).slice(-2).join('').toUpperCase()}</div>
        </div>
        <div>
          {INFO_ROWS.map((row,i) => (
            <div key={row.label} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'11px 0',
              borderBottom: i < INFO_ROWS.length-1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize:13, color:'var(--text-4)', fontWeight:500 }}>{row.label}</span>
              <span style={{ fontSize:13.5, fontWeight:600 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Đổi mật khẩu</div>
          <Icon name="ShieldCheck" size={18} color="var(--text-4)" />
        </div>
        <form onSubmit={changePw}>
          <div className="form-group">
            <label className="label">Mật khẩu hiện tại</label>
            <input className="input" type="password" required value={pwForm.current} onChange={e=>setPwForm(f=>({...f,current:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="label">Mật khẩu mới</label>
            <input className="input" type="password" required value={pwForm.newPw} onChange={e=>setPwForm(f=>({...f,newPw:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="label">Xác nhận mật khẩu mới</label>
            <input className="input" type="password" required value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))} />
          </div>

          {msg && (
            <div style={{
              padding:'10px 14px', borderRadius:'var(--r-md)', fontSize:13.5,
              background: msg.type==='ok' ? 'var(--green-50)' : 'var(--red-50)',
              color: msg.type==='ok' ? 'var(--green-600)' : 'var(--red-600)',
              border: `1px solid ${msg.type==='ok' ? '#BBF7D0' : '#FECACA'}`,
              display:'flex', alignItems:'center', gap:8, marginBottom:14,
            }}>
              <Icon name={msg.type==='ok'?'Check':'AlertCircle'} size={15} color={msg.type==='ok'?'var(--green-600)':'var(--red-600)'} />
              {msg.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            {saving
              ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}} /> Đang lưu...</>
              : <><Icon name="Save" size={14} /> Cập nhật mật khẩu</>
            }
          </button>
        </form>
      </div>
    </div>
  )
}
