# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Admin Authentication (Sessions or JWT) — No UI Changes Needed

This project now supports an Admin Panel behind role-based access control while keeping the existing login UI unchanged.

### Features
- Single common login form for all users
- If credentials match `ADMIN_EMAIL`/`ADMIN_PASSWORD` (or `ADMIN_PASSWORD_HASH`), a server session is created with `role: 'admin'` and the response includes `redirect: '/admin/dashboard'`.
- Normal users are authenticated from MongoDB and receive a regular session.
- Admin-only routes: `GET /admin/dashboard`, `GET /admin/users` protected by middleware.
- Security middleware added: `helmet`, rate limiting on auth routes, secure cookies in production.
- Optional JWT endpoints provided: `POST /api/login-jwt`, `GET /admin-jwt/dashboard`.

### .env example
Create a `.env` in the project root (never commit it):

```
NODE_ENV=development
PORT=5001
SESSION_SECRET=replace_with_strong_random
JWT_SECRET=replace_with_strong_random
ADMIN_EMAIL=admin@gmail.com
# Use either plain password (dev only) or a bcrypt hash (preferred for prod):
ADMIN_PASSWORD=admin123
# ADMIN_PASSWORD_HASH=$2a$10$examplehashgeneratedwithbcrypt
```

To generate a bcrypt hash:

```bash
node -e "require('bcryptjs').hash(process.argv[1], 10).then(h=>console.log(h))" "your_admin_password"
```

### Run locally

```bash
npm install
npm run dev
```

Vite dev server proxies `/api` to `http://localhost:5001` as configured in `vite.config.js`.

### Backend endpoints
- `POST /api/login` (rate limited):
  - Admin: matches env credentials; creates session `{ role: 'admin' }`; returns `{ role: 'admin', redirect: '/admin/dashboard' }`.
  - User: validates against MongoDB; creates session `{ role: 'user', id, email }`; returns user JSON.
- `POST /api/register` (rate limited): creates a user with hashed password.
- `PUT /api/profile` (session required): updates profile fields.
- `GET /admin/dashboard` (admin session required): sample protected admin route.
- `GET /admin/users` (admin session required): list users (password omitted).

Optional JWT flow (no UI changes required):
- `POST /api/login-jwt` → returns `{ token, role }`.
- `GET /admin-jwt/dashboard` with `Authorization: Bearer <token>` and `role=admin` in token.

### Frontend integration notes (no visual changes)
- The existing login UI posts to `/api/login`. No changes needed.
- If you want to programmatically redirect admins on the client, check `res.redirect === '/admin/dashboard'` in the login response and then navigate. Otherwise, keep client behavior unchanged.

### Security recommendations
- Use `ADMIN_PASSWORD_HASH` in production, not plaintext.
- Enable HTTPS and set `NODE_ENV=production` to force secure cookies.
- Consider CSRF protection for mutating routes (e.g., `csurf`) when using cookies.
- Keep rate limiting on `/api/login` and `/api/register`.
- Consider adding 2FA for the admin account.
