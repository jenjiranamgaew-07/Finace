# 💰 Finance Tracker — คู่มือ Deploy บน Vercel

## วิธี Deploy ทีละขั้น (ใช้เวลา ~10 นาที)

### ขั้นที่ 1 — สมัคร GitHub (ถ้ายังไม่มี)
1. ไปที่ **github.com** → กด Sign up
2. ใส่ email + password → ยืนยัน email

### ขั้นที่ 2 — สร้าง Repository ใหม่
1. กด **"New repository"** (ปุ่มสีเขียว)
2. ตั้งชื่อ: `finance-tracker`
3. เลือก **Private** (ข้อมูลส่วนตัว)
4. กด **"Create repository"**

### ขั้นที่ 3 — อัพโหลดไฟล์
1. ใน repo ที่สร้างใหม่ กด **"uploading an existing file"**
2. อัพโหลดไฟล์ทั้งหมดในโฟลเดอร์ `finance-vercel` นี้ **ตามโครงสร้างนี้**:
   ```
   finance-tracker/
   ├── package.json
   ├── public/
   │   └── index.html
   └── src/
       ├── index.js
       └── App.js
   ```
3. กด **"Commit changes"**

### ขั้นที่ 4 — สมัคร Vercel
1. ไปที่ **vercel.com**
2. กด **"Start Deploying"** → เลือก **"Continue with GitHub"**
3. อนุญาตให้ Vercel เข้าถึง GitHub

### ขั้นที่ 5 — Deploy!
1. กด **"Add New Project"**
2. เลือก repo `finance-tracker`
3. กด **"Deploy"** — รอ ~2 นาที
4. ✅ ได้ลิ้งค์! เช่น `https://finance-tracker-xxx.vercel.app`

### ขั้นที่ 6 — Add to Home Screen (มือถือ)
**iPhone (Safari):**
1. เปิดลิ้งค์ใน Safari
2. กดปุ่ม Share → "Add to Home Screen"
3. ตั้งชื่อ "Finance" → Add

**Android (Chrome):**
1. เปิดลิ้งค์ใน Chrome
2. กดเมนู 3 จุด → "Add to Home screen"

---

## ข้อมูลสำคัญ
- **ข้อมูลเก็บใน localStorage** — อยู่ในอุปกรณ์นั้นๆ ไม่ข้ามอุปกรณ์
- **ฟรีทั้งหมด** — GitHub Free + Vercel Hobby Plan = ฿0/เดือน
- **อัพเดตแอพ** — แก้ไฟล์ใน GitHub → Vercel deploy ให้อัตโนมัติ

## อยากให้ข้อมูลข้ามอุปกรณ์ได้ (Phone + PC)?
บอกฉันได้เลย — จะเพิ่ม Firebase ให้ในขั้นถัดไป (ยังฟรีอยู่)
