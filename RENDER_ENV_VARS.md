# 🔑 Render Environment Variables - WebSocket Server

## 📋 Environment Variables Cho Render WebSocket Server

Vào Render Dashboard → WebSocket Service → **Environment** tab → Add new variables

---

## ✅ BẮT BUỘC - JWT Secret

**LƯU Ý**: JWT_EMAIL_SECRET **PHẢI GIỐNG** với JWT_EMAIL_SECRET trên Vercel

```
JWT_EMAIL_SECRET=b60e21b0cf4d40b99520757a3cf5d868ede4c4beae32fc4d2317cfa3e22a435f04b159f4864dbd7f180eca9bd3d2702a213b22291d120ca902a6d35bd1afef10
```

### Tại sao cần JWT_EMAIL_SECRET?

Khi frontend connect WebSocket:
1. Frontend đã login vào Vercel backend → nhận JWT token (signed với `JWT_EMAIL_SECRET` từ Vercel)
2. Frontend gửi token này khi connect WebSocket
3. **Render WebSocket server cần verify token** → cần **CÙNG** `JWT_EMAIL_SECRET` để verify

**Nếu không có hoặc JWT_EMAIL_SECRET khác nhau:**
```
❌ invalid signature
❌ Client xxx disconnected (unauthenticated)
```

---

## 🚀 Cách Thêm Environment Variable

### Bước 1: Vào Render Dashboard
1. Truy cập: https://dashboard.render.com/
2. Chọn WebSocket service (work-management-websocket hoặc tên bạn đặt)

### Bước 2: Vào Environment Tab
1. Click tab **"Environment"** (bên trái sidebar)
2. Scroll xuống phần **"Environment Variables"**

### Bước 3: Thêm JWT_EMAIL_SECRET
1. Click **"Add Environment Variable"**
2. **Key**: `JWT_EMAIL_SECRET`
3. **Value**: `b60e21b0cf4d40b99520757a3cf5d868ede4c4beae32fc4d2317cfa3e22a435f04b159f4864dbd7f180eca9bd3d2702a213b22291d120ca902a6d35bd1afef10`
4. Click **"Save Changes"**

### Bước 4: Auto Redeploy
Render sẽ tự động redeploy service khi bạn thêm environment variable.

**Thời gian redeploy**: ~2-5 phút

---

## ✅ Verify Sau Khi Deploy

### 1. Check Render Logs

Sau khi redeploy xong, vào tab **"Logs"**.

**Trước khi thêm JWT_EMAIL_SECRET:**
```
[Nest] xxx - ERROR [NotificationsGateway] Connection error for client xxx:
invalid signature
[Nest] xxx - LOG [NotificationsGateway] ❌ Client xxx disconnected (unauthenticated)
```

**Sau khi thêm JWT_EMAIL_SECRET:**
```
[Nest] xxx - LOG [NotificationsGateway] ✅ Client xxx connected as User 32
[Nest] xxx - DEBUG [NotificationsGateway] 📤 Sent notification to User 32: task_created
```

### 2. Check Frontend Console

**Trước khi fix:**
```
✅ Connected to Socket.IO server
❌ Disconnected from Socket.IO: io server disconnect
```

**Sau khi fix:**
```
✅ Connected to Socket.IO server
✅ Authenticated successfully as User 32
🔔 Received notification: task_created
```

---

## 🎯 Complete Environment Variables List

Hiện tại Render WebSocket server chỉ cần **1 biến duy nhất**:

```
JWT_EMAIL_SECRET=b60e21b0cf4d40b99520757a3cf5d868ede4c4beae32fc4d2317cfa3e22a435f04b159f4864dbd7f180eca9bd3d2702a213b22291d120ca902a6d35bd1afef10
```

**Database không cần** vì WebSocket server không trực tiếp truy cập database. Nó chỉ:
1. Nhận trigger từ Vercel backend (HTTP POST)
2. Verify JWT token từ frontend
3. Broadcast notifications qua WebSocket

---

## 🚨 Common Issues

### Issue 1: "invalid signature"
**Nguyên nhân**: JWT_EMAIL_SECRET chưa được thêm hoặc khác với Vercel
**Giải pháp**: Thêm JWT_EMAIL_SECRET **GIỐNG HỆT** với Vercel

### Issue 2: "io server disconnect" ngay sau khi connect
**Nguyên nhân**: Server reject connection vì JWT verify failed
**Giải pháp**: Thêm JWT_EMAIL_SECRET và redeploy

### Issue 3: "JsonWebTokenError: jwt malformed"
**Nguyên nhân**: Token format không đúng từ frontend
**Giải pháp**: Check frontend code, đảm bảo gửi token qua query param `?token=...`

---

## 📝 Checklist

- [ ] Vào Render Dashboard → WebSocket service
- [ ] Vào tab **Environment**
- [ ] Thêm `JWT_EMAIL_SECRET` với value từ file này
- [ ] Click **Save Changes**
- [ ] Đợi Render auto redeploy (~2-5 phút)
- [ ] Check Render logs: Phải thấy `✅ Client xxx connected as User Y`
- [ ] Test frontend: Phải connect thành công và nhận notifications

---

## 🔧 Next Steps Sau Khi JWT_EMAIL_SECRET Hoạt Động

### 1. Thêm WEBSOCKET_SERVER_URL vào Vercel

Để Vercel backend có thể trigger notifications tới Render:

**Vercel Environment Variables:**
```
WEBSOCKET_SERVER_URL=https://work-management-4c6a.onrender.com
```

### 2. Test End-to-End Flow

1. Assign task cho user
2. Check Vercel logs: `✅ Triggered notification for user X`
3. Check Render logs: `📤 Sent notification to User X`
4. Frontend: Nhận notification real-time

---

## 🎉 Expected Result

Sau khi thêm JWT_EMAIL_SECRET và WEBSOCKET_SERVER_URL:

**Complete Flow:**
```
User assigns task
  ↓
Vercel backend saves to DB
  ↓
Vercel calls Render WebSocket (HTTP POST)
  ↓
Render broadcasts to frontend (WebSocket)
  ↓
Frontend receives real-time notification
  ↓
User sees notification bell 🔔
```

**Bắt đầu ngay: Thêm JWT_EMAIL_SECRET vào Render! 🚀**
