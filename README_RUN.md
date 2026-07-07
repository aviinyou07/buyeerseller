# Buyer-seller admin restructured

Folder structure is now:

```
Buyer-seller admin/
  ADMIN_B_S/        # Admin panel frontend
  backend/          # Buyer/seller API + admin backend module
    src/modules/admin/  # Admin backend moved from root src/
  frontend/         # Buyer/seller frontend
```

## Run

Open VS Code at `Buyer-seller admin`.

### Backend
```bash
cd backend
npm install
npm run dev
```

Backend default port: `4000`. Admin APIs are mounted at `/api/admin`. Buyer/seller APIs are mounted at `/api`. Uploaded files are served from `/uploads`.

### Buyer/Seller frontend
```bash
cd frontend
npm install
npm run dev
```

### Admin frontend
```bash
cd ADMIN_B_S
npm install
npm run dev
```

Notes:
- `node_modules`, `dist`, and log files were removed from the zip to keep the project clean. Run `npm install` in each app folder.
- Root admin backend code was moved into `backend/src/modules/admin` and CommonJS support was preserved with a local `package.json`.
