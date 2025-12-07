# Backend Başlatmaq (Port Problemi Həll Edildi)

## Problem: "Address already in use"

Port 8000 artıq istifadədədirsə, aşağıdakı addımları izləyin:

## Həll 1: Script İlə (Ən Asan) ✅

```bash
cd backend
./kill_port.sh 8000
uvicorn app.main:app --reload
```

## Həll 2: Manual

```bash
# Port 8000-dəki prosesi tapın və öldürün
lsof -ti:8000 | xargs kill -9

# Yenidən başladın
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

## Həll 3: Başqa Port İstifadə Et

```bash
uvicorn app.main:app --reload --port 8001
```

Sonra frontend-də `vite.config.js`-də proxy URL-i dəyişdirin.

## Həll 4: Avtomatik Script

```bash
cd backend
./restart_backend.sh
```

Bu script avtomatik olaraq köhnə prosesləri öldürür və yenidən başladır.

---

**Tövsiyə:** Hər dəfə başlatmazdan əvvəl `./kill_port.sh 8000` işlədin.

