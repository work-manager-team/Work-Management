# 🔑 Vercel Environment Variables - Đầy Đủ

## 📋 Environment Variables Cho Vercel

Copy các biến dưới đây vào Vercel Dashboard → Project Settings → Environment Variables

**LƯU Ý**: Environment phải chọn **ALL** (Production + Preview + Development)

---

## ✅ BẮT BUỘC - JWT Secrets

```bash
JWT_SECRET=b3de2c99dd39178eea4dfdf5e1e36f7a4d7864f9262fbec8a52a2b0b3f6a1271765da0f2715110646660d7a97d8a369c8fbd66ecc829a54d34031836da3b7521

JWT_EMAIL_SECRET=b60e21b0cf4d40b99520757a3cf5d868ede4c4beae32fc4d2317cfa3e22a435f04b159f4864dbd7f180eca9bd3d2702a213b22291d120ca902a6d35bd1afef10
```

---

## ✅ BẮT BUỘC - Frontend URL

```bash
FRONTEND_URL=https://jira-frontend-roan.vercel.app
```

---

## ✅ BẮT BUỘC - Database

```bash
DATABASE_URL=<your-postgresql-connection-string>
```

**Ví dụ format**:
```
postgresql://username:password@host.region.provider.com:5432/database?sslmode=require
```

**Nếu dùng Neon.tech**:
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
```

**Nếu dùng Supabase**:
```
postgresql://postgres.xxx:password@aws-0-xxx.pooler.supabase.com:5432/postgres
```

---

## ⚠️ TÙY CHỌN - Cloudinary (Nếu Dùng Upload Files)

**CHỈ THÊM NẾU BẠN ĐÃ ĐĂNG KÝ CLOUDINARY!**

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Lấy thông tin Cloudinary**:
1. Đăng ký: https://cloudinary.com/users/register_free
2. Vào Dashboard: https://console.cloudinary.com/
3. Copy Cloud name, API Key, API Secret

**NẾU CHƯA DÙNG**: Bỏ qua 3 biến này. Backend vẫn chạy bình thường!

---

## ⚠️ TÙY CHỌN - Email SMTP (Nếu Dùng Email Features)

**CHỈ THÊM NẾU BẠN MUỐN GỬI EMAIL (reset password, verify email, etc.)**

### Dùng Gmail SMTP:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
```

**Lấy Gmail App Password**:
1. Vào: https://myaccount.google.com/security
2. Bật "2-Step Verification"
3. Vào: https://myaccount.google.com/apppasswords
4. Chọn "Mail" và "Other (Custom name)"
5. Copy 16-character password (dạng: xxxx xxxx xxxx xxxx)
6. Paste vào `SMTP_PASS` (không cần spaces)

**NẾU CHƯA DÙNG**: Bỏ qua 5 biến này. Backend vẫn chạy bình thường!

---

## ⚠️ TÙY CHỌN - Google OAuth (Nếu Dùng Login with Google)

**CHỈ THÊM NẾU BẠN MUỐN ĐĂNG NHẬP BẰNG GOOGLE**

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://work-management-chi.vercel.app/auth/google/callback
```

**Lấy Google OAuth Credentials**:
1. Vào: https://console.cloud.google.com/
2. Tạo project mới hoặc chọn project có sẵn
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: Web application
5. Authorized redirect URIs: `https://work-management-chi.vercel.app/auth/google/callback`
6. Copy Client ID và Client Secret

**NẾU CHƯA DÙNG**: Bỏ qua 3 biến này. Backend vẫn chạy bình thường!

---

## ⚠️ CHỜ SAU - WebSocket Server URL

**CHỈ THÊM SAU KHI ĐÃ DEPLOY WEBSOCKET SERVER LÊN RENDER!**

```bash
WEBSOCKET_SERVER_URL=https://work-management-websocket.onrender.com
```

**CHƯA CẦN THÊM NGAY!** Chỉ thêm khi:
1. Đã deploy WebSocket server lên Render
2. Có URL của Render server

**NẾU CHƯA DEPLOY**: Bỏ qua biến này. Backend vẫn chạy bình thường!

---

## 📝 Tổng Hợp - Minimum Required

**TỐI THIỂU bạn cần 4 biến này để backend hoạt động**:

```bash
# 1. Database
DATABASE_URL=<your-database-url>

# 2. JWT Secrets
JWT_SECRET=b3de2c99dd39178eea4dfdf5e1e36f7a4d7864f9262fbec8a52a2b0b3f6a1271765da0f2715110646660d7a97d8a369c8fbd66ecc829a54d34031836da3b7521
JWT_EMAIL_SECRET=b60e21b0cf4d40b99520757a3cf5d868ede4c4beae32fc4d2317cfa3e22a435f04b159f4864dbd7f180eca9bd3d2702a213b22291d120ca902a6d35bd1afef10

# 3. Frontend URL
FRONTEND_URL=https://jira-frontend-roan.vercel.app
```

**Các biến khác (Cloudinary, SMTP, Google OAuth, WebSocket) đều TÙY CHỌN!**

---

## 🚀 Cách Thêm Vào Vercel

### Bước 1: Vào Vercel Dashboard
1. Truy cập: https://vercel.com/dashboard
2. Chọn project backend của bạn

### Bước 2: Vào Settings
1. Click tab **"Settings"**
2. Sidebar bên trái, click **"Environment Variables"**

### Bước 3: Thêm Từng Biến
Với mỗi biến:

1. Click **"Add New"** hoặc **"Add Variable"**
2. **Name**: Copy tên biến (VD: `JWT_SECRET`)
3. **Value**: Copy giá trị (VD: `b3de2c99dd3917...`)
4. **Environments**: ✅ Chọn **ALL 3** (Production, Preview, Development)
5. Click **"Save"**

### Bước 4: Repeat
Lặp lại bước 3 cho tất cả các biến cần thiết.

---

## ✅ Checklist

- [ ] `DATABASE_URL` - Có từ Neon/Supabase/Railway
- [ ] `JWT_SECRET` - Đã copy từ file này
- [ ] `JWT_EMAIL_SECRET` - Đã copy từ file này
- [ ] `FRONTEND_URL` - Đã copy: `https://jira-frontend-roan.vercel.app`
- [ ] `CLOUDINARY_*` - Nếu dùng Cloudinary, đã thêm 3 biến
- [ ] `SMTP_*` - Nếu dùng Email, đã thêm 5 biến
- [ ] `GOOGLE_*` - Nếu dùng Google OAuth, đã thêm 3 biến
- [ ] `WEBSOCKET_SERVER_URL` - CHỜ sau khi deploy Render (chưa cần)

---

## 🔧 Sau Khi Thêm Xong

### Redeploy Vercel
1. Vào tab **"Deployments"**
2. Chọn deployment gần nhất
3. Click menu **"..."** → **"Redeploy"**
4. Hoặc đơn giản push code mới lên GitHub để trigger auto-deploy

### Kiểm Tra Logs
1. Sau khi deploy xong, vào tab **"Logs"**
2. Click vào deployment mới nhất
3. Xem có errors không

### Test API
```bash
curl -X POST https://work-management-chi.vercel.app/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "dongocminh1210@gmail.com",
    "password": "Password123!"
  }'
```

Nếu trả về JWT token → ✅ Success!

---

## 🚨 Lưu Ý Bảo Mật

1. **KHÔNG BAO GIỜ commit file .env lên Git**
2. **JWT_SECRET phải giữ bí mật tuyệt đối**
3. **SMTP_PASS là App Password, không phải password Gmail thường**
4. **Không share credentials với ai**
5. **Nếu lộ secret, generate lại ngay**

---

## 📞 Nếu Gặp Lỗi

### Lỗi "DATABASE_URL is not defined"
→ Chưa thêm biến `DATABASE_URL` hoặc chưa redeploy

### Lỗi "JWT_SECRET is not defined"
→ Chưa thêm biến `JWT_SECRET` hoặc chưa redeploy

### Lỗi về Cloudinary
→ Nếu không dùng Cloudinary, bỏ qua (backend vẫn chạy)
→ Nếu dùng, kiểm tra lại 3 biến `CLOUDINARY_*`

### API vẫn lỗi 500
→ Check Vercel logs để xem lỗi cụ thể
→ Đọc `VERCEL_FIX_GUIDE.md`

---

## 🎯 Next Steps

1. ✅ Thêm env vars vào Vercel (file này)
2. ✅ Commit và push code backend
3. ✅ Vercel auto-deploy
4. ✅ Test login API
5. ⏳ Deploy WebSocket server (optional, sau)

**Bắt đầu từ bước 1: Thêm env vars vào Vercel ngay bây giờ! 🚀**
