export function ClubsPage() {
  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 22 }}>
        <div>
          <p style={{ margin: 0, color: '#94a3b8' }}>Quản lý CLB</p>
          <h2 style={{ margin: '8px 0 0', color: '#f8fafc' }}>Danh sách CLB</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {[
          { name: 'Enactus FTU', category: 'Khởi nghiệp', members: 38 },
          { name: 'Club Xanh', category: 'Môi trường', members: 21 },
          { name: 'Youth Impact', category: 'Xã hội', members: 17 },
        ].map((club) => (
          <div key={club.name} style={{ borderRadius: 22, background: '#111827', padding: 22, border: '1px solid rgba(148,163,184,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f8fafc' }}>{club.name}</h3>
                <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>{club.category}</p>
              </div>
              <div style={{ color: '#60a5fa', fontWeight: 700 }}>{club.members} thành viên</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
