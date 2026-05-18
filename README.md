# admin-app

A React + Vite admin dashboard for Enactus FTU Hanoi.

## Setup

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy environment file
   ```bash
   cp .env.example .env
   ```
3. Start development server
   ```bash
   npm run dev
   ```

## API configuration

Set `VITE_API_URL` in `.env` to your backend URL, for example:

```env
VITE_API_URL=https://api.enactusftuhanoi.id.vn
```

## Seed super admin account

Run the local seed script to create the first admin account:

```bash
npm run seed-admin
```

Default credentials in the seed script:

- Email: `superadmin@enactusftuhanoi.id.vn`
- Password: `SuperAdmin123!`

> If the backend is protected by Cloudflare or other security, you may need to run the script from a machine/network that passes the challenge, or create the admin user directly in the backend database.
