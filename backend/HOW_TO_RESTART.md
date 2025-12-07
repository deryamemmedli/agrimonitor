# Backend-i Yenidən Başlatmaq

## Metod 1: Terminalda (Ən Asan)

Backend terminalında:
1. `CTRL+C` basın (prosesi dayandırır)
2. Yenidən yazın:
```bash
uvicorn app.main:app --reload
```

## Metod 2: Script İlə

```bash
cd backend
./restart_backend.sh
```

## Metod 3: Manual

```bash
# Prosesi tapın
ps aux | grep uvicorn

# Prosesi öldürün (PID-ni əvəz edin)
kill -9 <PID>

# Yenidən başladın
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

---

# Pulsuz Sentinel 2 Məlumatları

**Qeyd:** Sistem yalnız PULSUZ servislərdən istifadə edir:

1. **Microsoft Planetary Computer** ✅ (Pulsuz, auth lazım deyil)
   - Avtomatik işləyir
   - Heç bir konfiqurasiya lazım deyil

2. **Copernicus SciHub** ✅ (Pulsuz, qeydiyyat lazımdır)
   - `.env` faylına credentials əlavə edin
   - Qeydiyyat: https://scihub.copernicus.eu/dhus/#/self-registration

**Sentinel Hub pullu servisdir və istifadə olunmur!**

