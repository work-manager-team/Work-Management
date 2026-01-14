# 🚀 Deploy Guide - 3 Bước Đơn Giản

## ❌ VẤN ĐỀ HIỆN TẠI

Vercel đang lỗi 500 vì database thiếu column `avatar_public_id`.

---

## ✅ BƯỚC 1: Fix Database (5 phút) ⭐ **LÀM NGAY**

### Vào Neon Dashboard:
1. https://console.neon.tech
2. Chọn project database
3. Click "SQL Editor"

### Chạy SQL này:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_public_id varchar(255);
```

### Verify:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'avatar_public_id';
```

Nếu thấy kết quả → ✅ Done!

**Chi tiết**: Xem file `FIX_DATABASE_SCHEMA.md`

---

## ✅ BƯỚC 2: Thêm ENV Vars Vào Vercel (5 phút)

### Vào Vercel Dashboard:
1. https://vercel.com/dashboard
2. Chọn project backend
3. Settings → Environment Variables

### Thêm các biến sau (Environment: ALL):

```bash
# Database
DATABASE_URL=<your-neon-database-url>

# JWT Secrets (đã generate sẵn)
JWT_SECRET=b3de2c99dd39178eea4dfdf5e1e36f7a4d7864f9262fbec8a52a2b0b3f6a1271765da0f2715110646660d7a97d8a369c8fbd66ecc829a54d34031836da3b7521

JWT_EMAIL_SECRET=b60e21b0cf4d40b99520757a3cf5d868ede4c4beae32fc4d2317cfa3e22a435f04b159f4864dbd7f180eca9bd3d2702a213b22291d120ca902a6d35bd1afef10

# Frontend
FRONTEND_URL=https://jira-frontend-roan.vercel.app

# Cloudinary (TÙY CHỌN - nếu dùng)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# SMTP (TÙY CHỌN - nếu dùng email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email@gmail.com>
SMTP_PASS=<your-app-password>
EMAIL_FROM=<your-email@gmail.com>
```

**Chi tiết**: Xem file `VERCEL_ENV_VARS.md`

---

## ✅ BƯỚC 3: Push Code & Test (2 phút)

### Commit và Push:
```bash
cd D:\Work-Management\my-nestjs-backend

git add .
git commit -m "Add WebSocket trigger service and fix schema"
git push origin ngocminh
```

Vercel tự động deploy (2-3 phút).

### Test API:
```bash
curl -X POST https://work-management-chi.vercel.app/users/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"dongocminh1210@gmail.com","password":"Password123!"}'
```

Nếu trả về JWT token → ✅ **THÀNH CÔNG!**

---

## 🎯 Kiến Trúc

```
Frontend (jira-frontend-roan.vercel.app)
    │
    └─► REST APIs (Vercel Backend) ──► Database (Neon)
          - /users/login
          - /tasks (CRUD)
          - /projects (CRUD)
          - /notifications (CRUD)
          - TẤT CẢ APIs
```

**WebSocket là OPTIONAL** - Chưa cần deploy ngay! Backend hoạt động bình thường không có WebSocket.

---

## ⏳ SAU NÀY (Optional)

### Deploy WebSocket Server (Nếu Muốn Real-time Notifications):

1. Push websocket-server lên GitHub
2. Deploy lên Render.com (free)
3. Thêm `WEBSOCKET_SERVER_URL` vào Vercel
4. Cập nhật frontend WebSocket URL

**Chi tiết**: Có trong các file guides (đã xóa phần lớn, giữ lại essentials)

---

## 📂 Files Quan Trọng

```
D:\Work-Management\
├── DEPLOY_GUIDE.md           ← File này (Overview)
├── FIX_DATABASE_SCHEMA.md    ← Chi tiết fix database
├── VERCEL_ENV_VARS.md        ← ENV vars với secrets
├── NEXT_STEPS.md             ← Roadmap sau khi deploy
│
├── my-nestjs-backend/        ← Backend code
│   └── src/notifications/
│       ├── websocket-trigger.service.ts    [Đã cập nhật]
│       ├── notifications.module.ts         [Đã cập nhật]
│       └── notification-helper.service.ts  [Đã cập nhật]
│
└── websocket-server/         ← Chưa cần deploy ngay
```

---

## ✅ Checklist

### Bước 1: Database
- [ ] Vào Neon Dashboard
- [ ] Chạy SQL: `ALTER TABLE users ADD COLUMN...`
- [ ] Verify column đã được thêm

### Bước 2: Vercel ENV
- [ ] Thêm `DATABASE_URL`
- [ ] Thêm `JWT_SECRET` và `JWT_EMAIL_SECRET`
- [ ] Thêm `FRONTEND_URL`
- [ ] Thêm `CLOUDINARY_*` (nếu dùng)
- [ ] Thêm `SMTP_*` (nếu dùng email)
- [ ] Chọn Environment: ALL (Production + Preview + Development)

### Bước 3: Deploy
- [ ] Commit và push code
- [ ] Đợi Vercel auto-deploy
- [ ] Test login API
- [ ] Verify trả về JWT token
- [ ] Check Vercel logs - không còn errors

---

## 🚨 Lưu Ý

1. **Ưu tiên**: Fix database trước → Thêm ENV vars → Push code
2. **WebSocket không bắt buộc**: Backend hoạt động tốt không có WebSocket
3. **JWT Secrets đã generate**: Copy từ `VERCEL_ENV_VARS.md`
4. **Frontend URL đã set**: `https://jira-frontend-roan.vercel.app`

---

## 💡 Tips

- **Nếu vẫn lỗi 500**: Check Vercel logs để xem error message cụ thể
- **Nếu database không connect**: Verify `DATABASE_URL` có đúng format không
- **Nếu thiếu column khác**: Xem `FIX_DATABASE_SCHEMA.md` để add thêm

---

**BẮT ĐẦU: Mở file `FIX_DATABASE_SCHEMA.md` để fix database ngay! 🚀**
