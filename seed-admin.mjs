const API_BASE = process.env.API_BASE || 'https://api.enactusftuhanoi.id.vn'
const payload = {
  email: 'superadmin@enactusftuhanoi.id.vn',
  password: 'SuperAdmin123!',
  name: 'Super Admin',
  role: 'super-admin',
}

console.log(`Seeding super admin to ${API_BASE}`)

const response = await fetch(`${API_BASE}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})

if (!response.ok) {
  const errorText = await response.text()
  console.error('Tạo tài khoản admin thất bại:', response.status, errorText)
  process.exit(1)
}

const result = await response.json()
console.log('Super admin đã được tạo thành công:')
console.log(JSON.stringify(result, null, 2))
