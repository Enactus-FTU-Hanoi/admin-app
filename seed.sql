-- SQL seed sample for admin-app.
-- Create a super admin account and a few club records.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO admin_users (id, email, name, role, password_hash, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   'superadmin@enactusftuhanoi.id.vn',
   'Super Admin',
   'super-admin',
   crypt('SuperAdmin123!', gen_salt('bf')),
   NOW());

INSERT INTO clubs (id, name, short_name, category, description, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'Enactus FTU', 'Enactus', 'Khởi nghiệp', 'CLB phát triển dự án xã hội và khởi nghiệp bền vững.', NOW()),
  ('00000000-0000-0000-0000-000000000011', 'Club Xanh', 'Xanh', 'Môi trường', 'Hoạt động vì môi trường và phong trào xanh.', NOW()),
  ('00000000-0000-0000-0000-000000000012', 'Youth Impact', 'Impact', 'Xã hội', 'Hỗ trợ dự án cộng đồng và phát triển thanh niên.', NOW());
