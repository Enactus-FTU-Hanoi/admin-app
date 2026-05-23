import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Icon } from '../components/Icon'

const FIELD_TYPES = [
  { value:'text', label:'Văn bản ngắn' },{ value:'textarea', label:'Văn bản dài' },
  { value:'select', label:'Dropdown' },{ value:'radio', label:'Radio' },
  { value:'checkbox', label:'Checkbox' },{ value:'date', label:'Ngày' },{ value:'number', label:'Số' },
]
const makeId = () => Math.random().toString(36).slice(2,8)

export function FormsAdminPage() {
  const [forms, setForms]     = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState<'create'|null>(null)
  const [saving, setSaving]   = useState(false)
  const [meta, setMeta]       = useState({ title:'', description:'', access:'all', deadline:'' })
  const [fields, setFields]   = useState<any[]>([{ id:makeId(), type:'text', label:'', required:true }])

  useEffect(() => {
    api<any[]>('/forms').then(d=>setForms(Array.isArray(d)?d:[]))
      .catch(console.error).finally(()=>setLoading(false))
  }, [])

  const addField    = () => setFields(fs=>[...fs,{ id:makeId(), type:'text', label:'', required:false }])
  const removeField = (id: string) => setFields(fs=>fs.filter(f=>f.id!==id))
  const updateField = (id: string, key: string, val: any) => setFields(fs=>fs.map(f=>f.id===id?{...f,[key]:val}:f))

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await api('/forms', { method:'POST', body:{ ...meta, fields } })
      setModal(null)
      const f = await api<any[]>('/forms'); setForms(Array.isArray(f)?f:[])
      setMeta({ title:'', description:'', access:'all', deadline:'' })
      setFields([{ id:makeId(), type:'text', label:'', required:true }])
    } catch(e:any) { alert(e.message) } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Xoá form?')) return
    await api(`/forms/${id}`, { method:'DELETE' })
    setForms(fs=>fs.filter(f=>f.id!==id))
  }

  const toggleStatus = async (form: any) => {
    const s = form.status==='open'?'closed':'open'
    await api(`/forms/${form.id}`, { method:'PATCH', body:{ status:s } })
    setForms(fs=>fs.map(f=>f.id===form.id?{...f,status:s}:f))
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="row-between" style={{ marginBottom:18 }}>
        <span style={{ color:'var(--text-4)', fontSize:13.5 }}>{forms.length} form</span>
        <button className="btn btn-primary" onClick={()=>{ setMeta({title:'',description:'',access:'all',deadline:''}); setFields([{id:makeId(),type:'text',label:'',required:true}]); setModal('create') }}>
          <Icon name="Plus" size={16} /> Tạo form
        </button>
      </div>

      {forms.length===0
        ? <div className="empty"><Icon name="FileText" size={40} color="var(--stone-300)" /><span>Chưa có form nào</span></div>
        : <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {forms.map(form=>(
            <div key={form.id} className="card" style={{ padding:'14px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <h3 style={{ fontSize:14.5, fontWeight:700 }}>{form.title}</h3>
                    <span className={`badge ${form.status==='open'?'badge-green':'badge-gray'}`}>{form.status==='open'?'Mở':'Đóng'}</span>
                    <span className="badge badge-blue">{form.access==='all'?'Toàn CLB':'Giới hạn'}</span>
                  </div>
                  <p style={{ fontSize:12.5, color:'var(--text-4)' }}>
                    {(form.fields||[]).length} câu hỏi · {form.response_count||0} phản hồi
                    {form.deadline && ` · Hạn: ${new Date(form.deadline).toLocaleDateString('vi-VN')}`}
                  </p>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className={`btn btn-sm ${form.status==='open'?'btn-secondary':'btn-primary'}`} onClick={()=>toggleStatus(form)}>
                    {form.status==='open'?'Đóng':'Mở lại'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={()=>del(form.id)}><Icon name="Trash2" size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      }

      {modal==='create' && (
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()} style={{ maxHeight:'92vh', overflowY:'auto' }}>
            <div className="modal-head">
              <h3>Tạo form mới</h3>
              <button className="close-btn" onClick={()=>setModal(null)}><Icon name="X" size={16} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group"><label className="label">Tiêu đề *</label><input className="input" required value={meta.title} onChange={e=>setMeta(f=>({...f,title:e.target.value}))} /></div>
                <div className="form-group"><label className="label">Mô tả</label><textarea className="textarea" rows={2} value={meta.description} onChange={e=>setMeta(f=>({...f,description:e.target.value}))} style={{ resize:'vertical' }} /></div>
                <div className="g2">
                  <div className="form-group"><label className="label">Quyền truy cập</label>
                    <select className="select" value={meta.access} onChange={e=>setMeta(f=>({...f,access:e.target.value}))}>
                      <option value="all">Toàn CLB</option><option value="admin">Chỉ Admin</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="label">Hạn chót</label><input className="input" type="datetime-local" value={meta.deadline} onChange={e=>setMeta(f=>({...f,deadline:e.target.value}))} /></div>
                </div>
                <div className="divider" />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <span style={{ fontWeight:700, fontSize:14 }}>Câu hỏi ({fields.length})</span>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addField}><Icon name="Plus" size={14} /> Thêm câu hỏi</button>
                </div>
                {fields.map((field,idx)=>(
                  <div key={field.id} style={{ background:'var(--stone-50)', borderRadius:'var(--r-lg)', padding:14, marginBottom:10, border:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text-4)', padding:'9px 0', minWidth:20 }}>{idx+1}.</span>
                      <input className="input" placeholder="Nhãn câu hỏi..." value={field.label} onChange={e=>updateField(field.id,'label',e.target.value)} style={{ flex:1 }} />
                      <select className="select" style={{ width:160 }} value={field.type} onChange={e=>updateField(field.id,'type',e.target.value)}>
                        {FIELD_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <button type="button" className="btn btn-danger btn-sm" onClick={()=>removeField(field.id)}><Icon name="X" size={14} /></button>
                    </div>
                    <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:13, color:'var(--text-3)', paddingLeft:30 }}>
                      <input type="checkbox" checked={!!field.required} onChange={e=>updateField(field.id,'required',e.target.checked)} /> Bắt buộc
                    </label>
                  </div>
                ))}
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving?<><div className="spinner" style={{width:15,height:15,borderWidth:2}} />Lưu...</>:<><Icon name="Save" size={15} />Tạo form</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
