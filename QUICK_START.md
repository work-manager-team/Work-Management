# 🚀 Quick Start - Deploy WebSocket lên Render

## ✅ Tình Trạng Hiện Tại

- ✅ Backend Vercel: Đã chạy OK
- ✅ Database: Đã fix schema OK
- ✅ WebSocket code: Đã có trong `websocket-server/`
- ⏳ **Cần làm**: Deploy WebSocket lên Render

---

## 📋 3 BƯỚC NHANH (15 phút)

### BƯỚC 1: Tạo Repo Mới cho WebSocket (5 phút)

```bash
# 1. Tạo repo mới trên GitHub: work-management-websocket

# 2. Push code
cd D:\Work-Management\websocket-server
git init
git add .
git commit -m "Initial WebSocket server"
git remote add origin https://github.com/YOUR_USERNAME/work-management-websocket.git
git push -u origin main
```

---

### BƯỚC 2: Deploy lên Render (5 phút)

1. **Vào**: https://render.com (sign up with GitHub)
2. **New +** → **Web Service**
3. **Connect** repo: `work-management-websocket`
4. **Settings**:
   - Build: `npm install && npm run build`
   - Start: `npm run start:prod`
   - Plan: **Free**
5. **ENV vars**:
   ```
   PORT=3001
   JWT_SECRET=b3de2c99dd39178eea4dfdf5e1e36f7a4d7864f9262fbec8a52a2b0b3f6a1271765da0f2715110646660d7a97d8a369c8fbd66ecc829a54d34031836da3b7521
   NODE_ENV=production
   ```
6. **Deploy** → Lấy URL

---

### BƯỚC 3: Connect Vercel với Render (3 phút)

1. **Vào Vercel** → Settings → Environment Variables
2. **Add**:
   ```
   WEBSOCKET_SERVER_URL=https://work-management-websocket.onrender.com
   ```
3. **Redeploy** Vercel

---

## 🧪 Test

```bash
# Health check
curl https://work-management-websocket.onrender.com/notifications/health

# Kết quả: {"status":"ok"}
```

---

## 📚 Chi Tiết

Xem file: **`RENDER_DEPLOY_GUIDE.md`** (hướng dẫn đầy đủ từng bước)

---

## 🎯 Sau Khi Deploy

**Frontend**: Đổi WebSocket URL từ Vercel → Render

**REST APIs**: GIỮ NGUYÊN (vẫn gọi Vercel)

---

**Total Time: ~15 phút** 🚀
