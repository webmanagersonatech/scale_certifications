# SonaCassa Frontend

Next.js 15 Pages Router + Tailwind CSS + TypeScript

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update `.env.local` with your real API URL:
   ```
   NEXT_PUBLIC_API_URL=https://your-real-api.com
   NEXT_PUBLIC_SECRET_KEY=sonacassecretkey@2025
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Routes

| Path | Description |
|------|-------------|
| `/` | Login page |
| `/forgot-password` | Forgot password |
| `/dashboard` | Main dashboard |
| `/dashboard/users` | User management |
| `/dashboard/courses` | Courses (stub) |
| `/dashboard/institutes` | Institutes (stub) |
| `/dashboard/reports` | Reports (stub) |
| `/dashboard/certifications` | Certifications (stub) |
| `/dashboard/notifications` | Notifications (stub) |
| `/dashboard/settings` | Settings (stub) |

## Notes
- Token stored in `localStorage` under `"token"`
- User info stored in `localStorage` under `"user"`
- Dashboard routes redirect to login if no token found
- AES password encryption via `crypto-js` before sending to API
