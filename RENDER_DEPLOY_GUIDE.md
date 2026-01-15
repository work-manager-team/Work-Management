# 🚀 Deploy WebSocket Server lên Render.com

## 📋 Tình Huống Hiện Tại

- ✅ Backend Vercel: Đã deploy OK (build từ `my-nestjs-backend/`)
- ✅ WebSocket code: Đã commit lên Git (thư mục `websocket-server/`)
- ⏳ WebSocket server: Chưa deploy → Cần deploy lên Render

---

## 🎯 BƯỚC 1: Tách WebSocket Server Thành Repository Riêng

### Tại Sao Cần Tách?

Render sẽ build từ root của repository. Hiện tại Git của bạn có cấu trúc:
```
your-repo/
├── my-nestjs-backend/    ← Vercel build từ đây
└── websocket-server/     ← Render cần build từ đây
```

**2 Cách giải quyết:**

---

### **CÁCH 1: Tạo Repository Mới (KHUYÊN DÙNG)** ⭐

#### Bước 1.1: Tạo repo mới trên GitHub

1. Vào: https://github.com/new
2. Repository name: `work-management-websocket`
3. Description: `WebSocket server for real-time notifications`
4. Visibility: Public hoặc Private (tùy bạn)
5. **KHÔNG tích** "Add README" hay bất kỳ file nào
6. Click **"Create repository"**

#### Bước 1.2: Push websocket-server lên repo mới

```bash
# Di chuyển vào thư mục websocket-server
cd D:\Work-Management\websocket-server

# Khởi tạo git (nếu chưa có)
git init

# Add tất cả files
git add .

# Commit
git commit -m "Initial commit: WebSocket server for real-time notifications"

# Add remote (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/work-management-websocket.git

# Push lên GitHub
git branch -M main
git push -u origin main
```

✅ **Xong! Bạn có repository mới cho WebSocket server**

---

### **CÁCH 2: Dùng Monorepo với Root Directory (Phức Tạp Hơn)**

Nếu muốn giữ nguyên 1 repo, cấu hình Render với Root Directory.

**Không khuyên dùng** vì:
- Phức tạp hơn
- Render có thể build cả 2 projects (lãng phí)
- Khó maintain

---

## 🎯 BƯỚC 2: Deploy lên Render.com

### Bước 2.1: Đăng ký/Đăng nhập Render

1. Truy cập: https://render.com
2. Click **"Get Started for Free"**
3. Chọn **"Sign up with GitHub"**
4. Authorize Render truy cập GitHub của bạn

### Bước 2.2: Tạo Web Service

1. Sau khi đăng nhập, click **"New +"** ở góc trên phải
2. Chọn **"Web Service"**

### Bước 2.3: Connect Repository

1. Tìm repository `work-management-websocket` trong danh sách
   - Nếu không thấy: Click **"Configure account"** → Grant access
2. Click **"Connect"** bên cạnh repository

### Bước 2.4: Cấu hình Web Service

**Basic Settings:**
```
Name: work-management-websocket
Region: Singapore (gần Việt Nam nhất)
Branch: main
Root Directory: (để trống nếu dùng cách 1, hoặc "websocket-server" nếu dùng cách 2)
```

**Build & Deploy:**
```
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm run start:prod
```

**Instance Type:**
```
Plan: Free (hoàn toàn miễn phí)
```

### Bước 2.5: Thêm Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Thêm 3 biến sau:

```bash
# Port (bắt buộc)
PORT=3001

# JWT Secret (PHẢI GIỐNG VERCEL!)
JWT_SECRET=b3de2c99dd39178eea4dfdf5e1e36f7a4d7864f9262fbec8a52a2b0b3f6a1271765da0f2715110646660d7a97d8a369c8fbd66ecc829a54d34031836da3b7521

# Environment
NODE_ENV=production
```

**⚠️ LƯU Ý**: `JWT_SECRET` phải **GIỐNG HỆT** với JWT_SECRET trên Vercel!

**Lấy JWT_SECRET từ đâu?**
- Đã có sẵn trong file `VERCEL_ENV_VARS.md`
- Hoặc vào Vercel Dashboard → Settings → Environment Variables → Copy giá trị `JWT_SECRET`

### Bước 2.6: Deploy!

1. Click **"Create Web Service"**
2. Đợi Render build và deploy (khoảng 3-5 phút)
3. Theo dõi logs để xem quá trình build

**Khi deploy xong**, bạn sẽ thấy:
- Status: **"Live"** (màu xanh)
- URL: `https://work-management-websocket.onrender.com`

---

## 🎯 BƯỚC 3: Test WebSocket Server

### Test 3.1: Health Check

```bash
curl https://work-management-websocket.onrender.com/notifications/health
```

**Kết quả mong đợi:**
```json
{"status":"ok"}
```

### Test 3.2: Stats Endpoint

```bash
curl https://work-management-websocket.onrender.com/notifications/stats
```

**Kết quả mong đợi:**
```json
{
  "totalUsers": 0,
  "totalSockets": 0,
  "users": []
}
```

### Test 3.3: Test Trigger (Optional)

```bash
curl -X POST https://work-management-websocket.onrender.com/notifications/trigger \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"notification":{"type":"test","title":"Test","message":"Hello"}}'
```

**Kết quả mong đợi:**
```json
{"success":true}
```

✅ **Nếu tất cả test pass → WebSocket server đã hoạt động!**

---

## 🎯 BƯỚC 4: Kết Nối Vercel với Render

### Bước 4.1: Lấy URL từ Render

Sau khi deploy xong, copy URL:
```
https://work-management-websocket.onrender.com
```

### Bước 4.2: Thêm ENV Variable vào Vercel

1. Vào Vercel Dashboard: https://vercel.com/dashboard
2. Chọn project backend của bạn
3. **Settings** → **Environment Variables**
4. Click **"Add New"**

**Thêm biến mới:**
```
Name: WEBSOCKET_SERVER_URL
Value: https://work-management-websocket.onrender.com
Environment: ✅ Production, ✅ Preview, ✅ Development (chọn cả 3)
```

5. Click **"Save"**

### Bước 4.3: Redeploy Vercel

**Cách 1: Trigger redeploy từ Git**
```bash
cd D:\Work-Management\my-nestjs-backend

# Commit nhỏ để trigger redeploy
git commit --allow-empty -m "Add WEBSOCKET_SERVER_URL env var"
git push
```

**Cách 2: Manual redeploy**
1. Vào Vercel Dashboard
2. Tab **"Deployments"**
3. Chọn deployment gần nhất
4. Click menu **"..."** → **"Redeploy"**

### Bước 4.4: Verify Vercel Logs

Sau khi redeploy xong:
1. Vào Vercel Dashboard → Logs
2. Tìm log message:
```
✅ WebSocket trigger enabled. Server: https://work-management-websocket.onrender.com
```

Nếu thấy message này → ✅ **Kết nối thành công!**

---

## 🎯 BƯỚC 5: Cập Nhật Frontend

### Bước 5.1: Tìm File Kết Nối WebSocket

Tìm trong frontend code file có chứa Socket.IO connection:

**Vị trí thường gặp:**
- `src/services/socket.js` hoặc `socket.ts`
- `src/hooks/useNotifications.js` hoặc `useNotifications.tsx`
- `src/contexts/NotificationContext.js`
- `src/App.js` hoặc `App.tsx`

### Bước 5.2: Đổi WebSocket URL

**TRƯỚC (cũ):**
```javascript
const socket = io('https://work-management-chi.vercel.app/notifications', {
  auth: { token }
});
```

**SAU (mới):**
```javascript
const socket = io('https://work-management-websocket.onrender.com/notifications', {
  auth: { token },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});
```

**⚠️ QUAN TRỌNG:**
- **CHỈ đổi WebSocket URL** (chuyển từ Vercel → Render)
- **TẤT CẢ REST API URLs vẫn trỏ Vercel** (không đổi)

### Bước 5.3: Giữ Nguyên REST APIs

```javascript
// REST APIs - KHÔNG THAY ĐỔI, vẫn gọi Vercel
fetch('https://work-management-chi.vercel.app/tasks', {
  headers: { Authorization: `Bearer ${token}` }
});

fetch('https://work-management-chi.vercel.app/projects', {
  headers: { Authorization: `Bearer ${token}` }
});

fetch('https://work-management-chi.vercel.app/notifications', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Bước 5.4: Deploy Frontend

```bash
cd <your-frontend-folder>

git add .
git commit -m "Update WebSocket connection to Render server"
git push
```

Nếu frontend trên Vercel → Tự động deploy

---

## 🧪 BƯỚC 6: Test End-to-End

### Test 6.1: WebSocket Connection

1. Mở frontend trong browser
2. Mở DevTools (F12) → Console tab
3. Đăng nhập vào hệ thống
4. Kiểm tra console log:

**Kết quả mong đợi:**
```
✅ Connected to WebSocket server
Socket ID: abc123xyz...
```

### Test 6.2: Real-time Notifications

**Setup:**
1. Mở 2 browser windows (hoặc 1 normal + 1 incognito)
2. **Window 1**: Đăng nhập User A
3. **Window 2**: Đăng nhập User B

**Test Case:**
1. **User A**: Tạo task mới và assign cho User B
2. **Kiểm tra**: User B nên nhận notification real-time ngay lập tức

**Console log của User B:**
```
🔔 New notification: {
  type: "task_assigned",
  title: "Task được gán cho bạn",
  message: "Bạn được gán task: \"Task ABC\"",
  ...
}
```

### Test 6.3: Kiểm Tra Render Logs

1. Vào Render Dashboard
2. Chọn service `work-management-websocket`
3. Tab **"Logs"**

**Logs nên hiển thị:**
```
🚀 WebSocket Server is running on port 3001
✅ User 39 connected with socket abc123
✅ Triggered notification for user 39
```

---

## ✅ Checklist Hoàn Chỉnh

### Phase 1: Setup Repository
- [ ] Tạo repository mới `work-management-websocket` trên GitHub
- [ ] Push code từ `websocket-server/` lên repo mới
- [ ] Verify code đã lên GitHub

### Phase 2: Deploy Render
- [ ] Đăng ký/Đăng nhập Render.com
- [ ] Tạo Web Service
- [ ] Connect GitHub repository
- [ ] Cấu hình build commands
- [ ] Thêm environment variables (PORT, JWT_SECRET, NODE_ENV)
- [ ] Deploy thành công (status "Live")
- [ ] Copy URL Render

### Phase 3: Kết Nối Vercel
- [ ] Thêm `WEBSOCKET_SERVER_URL` vào Vercel
- [ ] Redeploy Vercel
- [ ] Verify logs hiển thị "WebSocket trigger enabled"

### Phase 4: Update Frontend
- [ ] Tìm file kết nối WebSocket
- [ ] Đổi URL từ Vercel → Render
- [ ] Giữ nguyên REST API URLs
- [ ] Deploy frontend

### Phase 5: Testing
- [ ] Test health check endpoint
- [ ] Test stats endpoint
- [ ] Test WebSocket connection từ frontend
- [ ] Test real-time notifications (2 users)
- [ ] Check Render logs
- [ ] Verify không có errors

---

## 🎯 Kiến Trúc Cuối Cùng

```
Frontend (jira-frontend-roan.vercel.app)
    │
    ├─► REST APIs (Vercel Backend) ──► Database (Neon)
    │     - POST /users/login
    │     - GET  /tasks
    │     - POST /tasks
    │     - GET  /notifications (CRUD)
    │     │
    │     └─► HTTP Trigger
    │              │
    └─► WebSocket (Render) ◄────┘
          - WSS /notifications
          - Real-time push only
```

**Luồng hoạt động:**
1. User A assign task → Frontend gọi REST API (Vercel)
2. Vercel lưu DB → Gọi HTTP trigger → Render
3. Render broadcast WebSocket → User B nhận real-time

---

## 💰 Chi Phí

- **Vercel**: Free tier (REST APIs)
- **Render**: Free tier (WebSocket server)
- **Neon**: Free tier (Database)

**Total**: $0/tháng 🎉

---

## 🔧 Troubleshooting

### Issue 1: Render build failed

**Triệu chứng**: Build error trên Render

**Giải pháp**:
- Check `package.json` có đúng không
- Verify build command: `npm install && npm run build`
- Verify start command: `npm run start:prod`
- Check Render logs để xem error cụ thể

### Issue 2: WebSocket không connect

**Triệu chứng**: Frontend console hiển thị connection error

**Giải pháp**:
- Check URL có đúng không (Render, không phải Vercel)
- Check JWT_SECRET giống nhau giữa Vercel và Render
- Check Render service đang chạy (status "Live")
- Check browser console xem error message

### Issue 3: Connect được nhưng không nhận notifications

**Triệu chứng**: Connect OK nhưng không có notification khi assign task

**Giải pháp**:
- Check `WEBSOCKET_SERVER_URL` trên Vercel có đúng không
- Check Vercel logs xem có gọi trigger không
- Check Render logs xem có nhận trigger không
- Test trigger manually với curl

### Issue 4: Render service sleep

**Triệu chứng**: Connection chậm lần đầu (~1-2 giây)

**Giải thích**: Render free tier tự động sleep sau 15 phút không hoạt động

**Giải pháp**:
- Chấp nhận delay nhẹ (đây là hạn chế của free tier)
- Hoặc upgrade Render plan lên Starter ($7/tháng) để always-on

---

## 📞 Support

Nếu gặp vấn đề:
1. Check Render logs
2. Check Vercel logs
3. Check browser console
4. Verify env vars match nhau

---

**GOOD LUCK! 🚀**
