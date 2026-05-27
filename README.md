# Sportsync

Sports e-commerce platform — React storefront + Express API + MongoDB.

## Quick start

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Configure environment variables (see **[DOCUMENTATION.md](./DOCUMENTATION.md)** §5).

- Frontend: typically `http://localhost:5173`
- API: typically `http://localhost:5000`
- Set `VITE_PORT=http://localhost:5000` in `frontend/.env`

## Documentation

**[DOCUMENTATION.md](./DOCUMENTATION.md)** — full technical reference:

- Architecture & stack
- API endpoints
- Data models
- Auth, payments, orders, returns
- Admin dashboard
- Deployment & environment variables

Payment production setup: **[backend/PAYMENTS.md](./backend/PAYMENTS.md)**
