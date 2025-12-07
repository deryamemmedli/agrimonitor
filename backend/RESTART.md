# Backend-i Yenidən Başlatmaq

## 1. Köhnə prosesi dayandırın

Backend terminalında `CTRL+C` basın (və ya):

```bash
cd backend
./kill_port.sh 8000
```

## 2. Yenidən başladın

```bash
cd backend
./restart_backend.sh
```

Və ya manual olaraq:

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Vacib:** Həmişə `backend` qovluğundan işlədin!

Backend `http://localhost:8000` ünvanında işləyəcək.

