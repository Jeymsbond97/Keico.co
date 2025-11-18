# KEICO PLUS Admin Panel

Modern admin panel for managing news articles.

## Features

- 🔐 Secure login (Keicoplus_admin / admin1111)
- 📰 News management (Create, Read, Update, Delete)
- 🎨 Modern UI with Material-UI
- 📊 Status management (ACTIVE, PAUSE, DELETE)
- 🔍 Filtering and sorting
- 📄 Pagination
- 🖼️ Image and video upload support

## Setup

1. Install dependencies:
```bash
cd admin
npm install
```

2. Build admin panel:
```bash
npm run build
```

3. The built files will be in `admin/dist/` and will be served by NestJS at `/admin` route.

## Development

To develop the admin panel:

```bash
cd admin
npm run dev
```

The admin panel will be available at `http://localhost:5173` (Vite dev server).

## Production

When building for production, the admin panel is automatically built when you run:

```bash
npm run build
```

This builds both the NestJS backend and the admin frontend.

## Access

- **URL**: `http://localhost:3000/admin` (or your server URL)
- **Username**: `Keicoplus_admin`
- **Password**: `admin1111`

## Notes

- The admin panel is served as static files from the NestJS backend
- All GraphQL queries/mutations are handled through the existing backend API
- File uploads (images/videos) are supported through GraphQL mutations
