import { useState, useEffect } from 'react'
import { api } from '../lib/api'

type FormField = { id: string; type: string; label: string; required?: boolean; options?: string[]; placeholder?: string }
type AdminForm = { id: string; title: string; description?: string; access: string; deadline?: string; status: string; creator_name?: string; response_count?: number; fields: FormField[]; created_at: string }

const FIELD_TYPES = [
  { value:'text',     label:'Văn bản ngắn' },
  { value:'textarea', label:'Văn bản dài' },
  { value:'select',   label:'Dropdown' },
  { value:'radio',    label:'Radio (1 lựa chọn)' },
  { value:'checkbox', label:'Checkbox (nhiều lựa chọn)' },
  { value:'date',     label:'Ngày' },
  { value:'number',   label:'Số' },
]

function makeId() { return Math.random().toString(36).slice(2, 8) }

export function FormsAdminPage() {
  const [forms, setForms]   = useState<AdminForm[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState<'create'|'view'|null>(null)
  const [selected, setSelected] = useState<AdminForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [formMeta, setFormMeta] = useState({ title:'', description:'', access:'all', deadline:'' })
  const [fields, setFields] = useState<FormField[]>([{ id: makeId(), type:'text', label:'', required:true }])

  useEffect(() => {
    api<AdminForm[]>('/forms').then(setForms).catch(console.error).finally(() => setLoading(false))
  }, [])

  const addField = () => setFields(fs => [...fs, { id:makeId(), type:'text', label:'', required:false }])
  const removeField = (id: string) => setFields(fs => fs.filter(f => f.id !== id))
  const updateField = (id: string, key: string, val: any) => setFields(fs => fs.map(f => f.id===id ? {...f, [key]:val} : f))

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await api('/forms', { method:'POST', body: { ...formMeta, fields } })
      setModal(null)
      const f = await api<AdminForm[]>('/forms')
      setForms(f)
      setFormMeta({ title:'', description:'', access:'all', deadline:'' })
      setFields([{ id:makeId(), type:'text', label:'', required:true }])
    } catch(e:any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Xoá form này?')) return
    await api(`/forms/${id}`, { method:'DELETE' })
    setForms(fs => fs.filter(f => f.id !== id))
  }

  const toggleStatus = async (form: AdminForm) => {
    const newStatus = form.status === 'open' ? 'closed' : 'open'
    await api(`/forms/${form.id}`, { method:'PATCH', body:{ status:newStatus } })
    setForms(fs => fs.map(f => f.id===form.id ? {...f, status:newStatus} : f))
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 18 }}>
        <span style={{ color:'var(--text-3)', fontSize:13.5 }}>{forms.length} form</span>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('create')}>+ Tạo form</button>
      </div>

      {forms.length === 0 ? (
        <div className="empty">
          <span style={{ fontSize:36 }}>▤</span>
          <span>Chưa có form nào</span>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {forms.map(form => (
            <div key={form.id} className="card" style={{ padding:'14px 18px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <h3 style={{ fontSize:14.5, fontWeight:700 }}>{form.title}</h3>
                    <span className={`badge ${form.status==='open'?'b-green':'b-gray'}`}>{form.status==='open'?'● Mở':'Đóng'}</span>
                    <span className="badge b-blue">{form.access==='all'?'Toàn CLB':'Giới hạn'}</span>
                  </div>
                  {form.description && <p style={{ fontSize:13, color:'var(--text-3)' }}>{form.description}</p>}
                  <p style={{ fontSize:12, color:'var(--text-4)', marginTop:4 }}>
                    {(form.fields||[]).length} câu hỏi · {form.response_count||0} phản hồi
                    {form.deadline && ` · Hạn: ${new Date(form.deadline).toLocaleDateString('vi-VN')}`}
                  </p>
                </div>
                <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => { setSelected(form); setModal('view') }}>Xem</button>
                  <button className={`btn btn-sm ${form.status==='open'?'btn-outline':'btn-primary'}`} onClick={() => toggleStatus(form)}>
                    {form.status==='open'?'Đóng':'Mở lại'}
                  </button>
                  <button className="btn btn-sm" style={{background:'#FEF2F2',color:'#B91C1C',border:'1px solid #FECACA'}} onClick={() => del(form.id)}>Xoá</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {modal === 'create' && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxHeight:'92vh', overflowY:'auto' }}>
            <div className="modal-head">
              <h3>Tạo form mới</h3>
              <button className="close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Tiêu đề form *</label>
                  <input className="input" required value={formMeta.title} onChange={e => setFormMeta(f=>({...f,title:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="label">Mô tả</label>
                  <textarea className="textarea" rows={2} value={formMeta.description} onChange={e => setFormMeta(f=>({...f,description:e.target.value}))} style={{resize:'vertical'}} />
                </div>
                <div className="g2">
                  <div className="form-group">
                    <label className="label">Quyền truy cập</label>
                    <select className="select" value={formMeta.access} onChange={e => setFormMeta(f=>({...f,access:e.target.value}))}>
                      <option value="all">Toàn CLB</option>
                      <option value="admin">Chỉ Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Hạn chót</label>
                    <input className="input" type="datetime-local" value={formMeta.deadline} onChange={e => setFormMeta(f=>({...f,deadline:e.target.value}))} />
                  </div>
                </div>

                <div className="divider" />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <span style={{ fontWeight:700, fontSize:14 }}>Câu hỏi ({fields.length})</span>
                  <button type="button" className="btn btn-outline btn-sm" onClick={addField}>+ Thêm câu hỏi</button>
                </div>

                {fields.map((field, idx) => (
                  <div key={field.id} style={{ background:'var(--surface)', borderRadius:'var(--r-md)', padding:14, marginBottom:10, border:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text-4)', padding:'7px 0', minWidth:20 }}>{idx+1}.</span>
                      <input className="input" placeholder="Nhãn câu hỏi..." value={field.label} onChange={e => updateField(field.id,'label',e.target.value)} style={{ flex:1 }} />
                      <select className="select" style={{ width:160 }} value={field.type} onChange={e => updateField(field.id,'type',e.target.value)}>
                        {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <button type="button" style={{ background:'#FEF2F2',color:'#B91C1C',border:'1px solid #FECACA',borderRadius:'var(--r-sm)',padding:'0 10px',cursor:'pointer' }} onClick={() => removeField(field.id)}>✕</button>
                    </div>
                    {['select','radio','checkbox'].includes(field.type) && (
                      <div style={{ paddingLeft:30 }}>
                        <label className="label">Các lựa chọn (mỗi dòng 1 lựa chọn)</label>
                        <textarea className="textarea" rows={3} placeholder={"Lựa chọn 1\nLựa chọn 2\nLựa chọn 3"} value={(field.options||[]).join('\n')} onChange={e => updateField(field.id,'options',e.target.value.split('\n'))} style={{resize:'vertical'}} />
                      </div>
                    )}
                    <div style={{ paddingLeft:30, marginTop:6 }}>
                      <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:13, color:'var(--text-3)' }}>
                        <input type="checkbox" checked={!!field.required} onChange={e => updateField(field.id,'required',e.target.checked)} />
                        Bắt buộc
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" style={{width:15,height:15,borderWidth:2}} /> Lưu...</> : 'Tạo form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
