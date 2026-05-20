import { useState } from 'react'
import { api } from '../lib/api'
import { Icon } from '../components/Icon'

type ImportResult = {
  success: number
  failed: number
  errors: string[]
}

export function SettingsPage() {
  const [sheetUrl, setSheetUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleImport = async () => {
    if (!sheetUrl.trim()) {
      alert('Vui lòng nhập Google Sheet URL')
      return
    }

    setLoading(true)
    setResult(null)
    
    try {
      const res = await api<ImportResult>('/admin/import-members', {
        method: 'POST',
        body: { sheetUrl }
      })
      setResult(res)
      if (res.success > 0) {
        alert(`✅ Import thành công ${res.success} thành viên`)
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="page-title">Cài đặt hệ thống</h2>
      <p className="page-subtitle">Quản lý cấu hình và dữ liệu</p>

      <div className="g2">
        {/* Import Members Card */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <Icon name="Users" size={18} />
              <span style={{ marginLeft: 8 }}>Import thành viên từ Google Sheet</span>
            </div>
          </div>
          
          <div className="form-group">
            <label className="label">Google Sheet URL</label>
            <input
              type="text"
              className="input"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Sheet cần có các cột: name, email, department, generation, role (member/admin), phone, student_id
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? <Icon name="Loader2" size={16} /> : <Icon name="Upload" size={16} />}
            {loading ? ' Đang import...' : ' Import từ Google Sheet'}
          </button>

          {result && (
            <div className="mt-4 p-3 rounded-lg" style={{ background: result.failed === 0 ? '#F0FDF4' : '#FEF2F2' }}>
              <p className="font-semibold">Kết quả import:</p>
              <p>✅ Thành công: {result.success}</p>
              {result.failed > 0 && (
                <>
                  <p>❌ Thất bại: {result.failed}</p>
                  {result.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-sm cursor-pointer">Xem chi tiết lỗi</summary>
                      <ul className="mt-2 text-sm list-disc list-inside">
                        {result.errors.slice(0, 10).map((err, i) => (
                          <li key={i} className="text-red-600">{err}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Export Card */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <Icon name="Download" size={18} />
              <span style={{ marginLeft: 8 }}>Export dữ liệu</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-4">Xuất danh sách thành viên ra file Excel</p>
          <button
            className="btn btn-outline"
            onClick={() => window.open('/api/admin/export-members', '_blank')}
          >
            <Icon name="Download" size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-head">
          <div className="card-title">
            <Icon name="Info" size={18} />
            <span style={{ marginLeft: 8 }}>Hướng dẫn</span>
          </div>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. Tạo Google Sheet với các cột sau (dòng đầu là tên cột):</p>
          <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
{`| name | email | department | generation | role | phone | student_id |
|------|-------|------------|------------|------|-------|-------------|
| Nguyễn Văn A | a@example.com | Marketing | Gen 9 | member | 0912345678 | 20241234 |`}
          </pre>
          <p>2. Chia sẻ sheet ở chế độ <strong>"Anyone with the link can view"</strong></p>
          <p>3. Copy URL và dán vào ô trên, bấm Import</p>
        </div>
      </div>
    </div>
  )
}