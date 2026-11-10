# CROP COOP — Monorepo

> Hệ thống truy xuất nguồn gốc nông sản hợp tác xã

## Cấu trúc dự án

```
cropcoop/
├── apps/
│   ├── api/          # NestJS REST API (Bước 2+)
│   └── web/          # React + Vite PWA — Dashboard + E-Diary (Bước 3)
├── packages/
│   └── database/     # Prisma schema + migrations + seed
│       ├── prisma/
│       │   ├── schema.prisma   ← 17 bảng, 10 enum
│       │   ├── seed.ts
│       │   └── migrations/
│       └── src/
│           └── index.ts        ← Re-export Prisma client & types
└── README.md
```

## Khởi động dự án

### Cách nhanh nhất: Docker Compose

Yêu cầu: Docker Desktop/Engine có Docker Compose và Node.js ≥ 20 nếu chạy lệnh npm ngoài container.

```bash
cp .env.example .env
docker compose up --build
```

Compose khởi động PostgreSQL, đồng bộ schema Prisma và chạy API cùng web.

- Web: `http://localhost:5173`
- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/docs`

Dừng bằng `Ctrl+C` hoặc `docker compose down`. Dữ liệu PostgreSQL được giữ trong volume `postgres_data`.

### Chạy API và web trực tiếp

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run db:push
npm run dev
```

`npm run dev` chạy API và web đồng thời. `npm run db:studio` mở Prisma Studio.

## Bước 3: Frontend Dashboard & E-Diary

```bash
cd apps/web
cp .env.example .env.local
pnpm install
pnpm dev
```

Frontend chạy tại `http://localhost:5173`. PWA cache app shell; nhật ký nháp được lưu trong
LocalStorage và gửi theo batch `POST /diary/sync` khi kết nối trở lại. Dashboard hiện dùng dữ liệu
demo cho đến khi các endpoint báo cáo được triển khai. Ảnh chọn trong form được giữ offline dạng
data URL; cần endpoint upload phía API để lưu ảnh lâu dài và trả URL CDN.

## Schema Overview — 17 bảng, 10 nhóm

| Nhóm | Bảng | Mô tả |
|------|------|-------|
| 1 — Auth | roles, users, user_roles | RBAC với JSON permissions |
| 2 — Land | zones, lots, farmer_lots | Vùng trồng + RLS nông dân |
| 3 — Season | seasons, season_lots | Kế hoạch + Quarantine Engine |
| 4 — Diary | diary_entries, diary_attachments | E-Diary + Offline Sync |
| 5 — Inventory | materials, inventory_transactions, material_usages | Kho vật tư + Ledger |
| 6 — Harvest | harvest_records, quality_tests | Thu hoạch + Kiểm nghiệm |
| 7 — QR | qr_codes | QR Engine (3 điều kiện) |
| 8 — Orders | orders | Đơn hàng Public Portal |
| 9 — Audit | audit_logs | Immutable BigInt ledger |
| 10 — Config | system_configs | Key-value config store |

