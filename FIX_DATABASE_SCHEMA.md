# 🔧 Fix Database Schema - Missing Columns

## ❌ Vấn Đề

Vercel logs hiển thị lỗi:
```
column "avatar_public_id" does not exist
```

Database thiếu column `avatar_public_id` trong bảng `users`. Code đã có column này trong schema nhưng database chưa được update.

---

## ✅ Giải Pháp: Chạy Migration SQL

### Cách 1: Dùng Neon Dashboard (KHUYÊN DÙNG) ⭐

1. **Vào Neon Dashboard**:
   - Truy cập: https://console.neon.tech
   - Đăng nhập
   - Chọn project database của bạn

2. **Mở SQL Editor**:
   - Click vào database
   - Click tab **"SQL Editor"** hoặc **"Query"**

3. **Chạy SQL**:
   ```sql
   -- Add missing column to users table
   ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_public_id varchar(255);

   -- Verify column was added
   SELECT column_name, data_type, character_maximum_length
   FROM information_schema.columns
   WHERE table_name = 'users' AND column_name = 'avatar_public_id';
   ```

4. **Click "Run"** hoặc Ctrl+Enter

5. **Kiểm tra kết quả**:
   - Query thứ 2 sẽ trả về row với column_name = 'avatar_public_id'
   - Nếu thấy row → ✅ Thành công!

---

### Cách 2: Dùng psql CLI (Nếu Có)

```bash
# Connect to database
psql "your-database-connection-string"

# Run migration
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_public_id varchar(255);

# Verify
\d users
```

---

### Cách 3: Dùng Supabase Dashboard (Nếu Dùng Supabase)

1. Vào: https://supabase.com/dashboard
2. Chọn project
3. Tab "SQL Editor"
4. Chạy SQL như Cách 1

---

## 🔍 Kiểm Tra Thêm Columns Khác

Có thể còn thiếu columns khác. Chạy query này để kiểm tra:

```sql
-- Check all columns in users table
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Columns bắt buộc phải có**:
- `id`
- `email`
- `username`
- `password_hash`
- `full_name`
- `avatar_url`
- `avatar_public_id` ← **MỚI THÊM**
- `status`
- `email_verified_at`
- `last_login_at`
- `google_id`
- `provider`
- `created_at`
- `updated_at`

**Nếu thiếu column nào khác**, chạy:

```sql
-- For attachments table (if needed)
ALTER TABLE attachments ADD COLUMN IF NOT EXISTS public_id varchar(255);
ALTER TABLE attachments ADD COLUMN IF NOT EXISTS uploaded_by bigint;

-- Add foreign key if needed
ALTER TABLE attachments
ADD CONSTRAINT attachments_uploaded_by_fkey
FOREIGN KEY (uploaded_by) REFERENCES users(id);
```

---

## 🚀 Sau Khi Fix

### 1. Redeploy Vercel (Không Cần Thay Đổi Code)

Vercel sẽ tự động connect tới database mới đã có column.

HOẶC trigger manual redeploy:
1. Vào Vercel Dashboard
2. Tab "Deployments"
3. Click "Redeploy" trên deployment gần nhất

### 2. Test API

```bash
curl -X POST https://work-management-chi.vercel.app/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "dongocminh1210@gmail.com",
    "password": "Password123!"
  }'
```

**Nếu trả về JWT token** → ✅ SUCCESS!

---

## 📝 Migration File Đã Tạo

File migration đã được tạo sẵn:
```
my-nestjs-backend/drizzle/0007_add_avatar_public_id.sql
```

Content:
```sql
ALTER TABLE "users" ADD COLUMN "avatar_public_id" varchar(255);
```

**Không cần commit file này** - Chỉ cần chạy SQL trực tiếp trên database.

---

## 🔧 Troubleshooting

### Lỗi "column already exists"
→ Tốt! Column đã được thêm rồi. Chỉ cần redeploy Vercel.

### Lỗi "permission denied"
→ User database không có quyền ALTER TABLE. Contact Neon support hoặc dùng admin user.

### Vẫn lỗi 500 sau khi thêm column
→ Kiểm tra Vercel logs xem có lỗi khác không:
1. Vào Vercel Dashboard → Logs
2. Tìm lỗi mới nhất
3. Đọc error message

### Không tìm thấy Neon Dashboard SQL Editor
→ Thử:
- Click vào database name
- Tìm menu "Query" hoặc "SQL Editor" ở sidebar
- Hoặc vào Tables → chọn table → "Run SQL"

---

## ⚠️ LƯU Ý

1. **Không làm mất dữ liệu**: `ADD COLUMN IF NOT EXISTS` an toàn, không xóa data
2. **Không cần downtime**: Database vẫn chạy bình thường khi thêm column
3. **Không cần thay đổi code**: Code đã đúng, chỉ cần fix database
4. **Không ảnh hưởng users khác**: Query chỉ thêm column, không sửa data

---

## ✅ Checklist

- [ ] Vào Neon/Supabase Dashboard
- [ ] Mở SQL Editor
- [ ] Chạy `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_public_id varchar(255);`
- [ ] Verify column đã được thêm
- [ ] Redeploy Vercel (hoặc chờ auto-deploy)
- [ ] Test login API
- [ ] Verify không còn lỗi 500

---

## 🎯 Next Steps Sau Khi Fix

1. ✅ Database schema đã OK
2. ✅ Backend Vercel chạy OK
3. ⏳ Xóa các file .md và tmp không cần thiết
4. ⏳ Deploy WebSocket server (optional)
5. ⏳ Cập nhật frontend

**Ưu tiên: Fix database NGAY để Vercel hoạt động!**
