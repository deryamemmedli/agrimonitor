# Sentinel 2 Real Data Setup Guide

Bu təlimat real Sentinel 2 məlumatlarını əldə etmək üçün lazımi konfiqurasiyanı izah edir.

## Seçimlər (Prioritet sırası ilə)

### 1. Microsoft Planetary Computer (Ən Asan - Pulsuz, Auth Lazım Deyil) ✅

**Üstünlükləri:**
- Pulsuz
- Authentication lazım deyil
- STAC API ilə asan istifadə
- Yüksək performans

**Quraşdırma:**
```bash
pip install pystac-client planetary-computer
```

**Konfiqurasiya:**
`.env` faylında heç bir şey yazmağa ehtiyac yoxdur - avtomatik işləyir!

**Qeyd:** Bu variant avtomatik olaraq istifadə olunur.

---

### 2. Copernicus SciHub (Pulsuz, Rəsmi ESA Mənbəsi) ✅

**Üstünlükləri:**
- Pulsuz
- Rəsmi ESA mənbəsi
- Tam Sentinel 2 məlumatları

**Qeydiyyat:**
1. https://scihub.copernicus.eu/dhus/#/self-registration
2. Email ilə qeydiyyatdan keçin
3. Username və password alın

**Konfiqurasiya:**
`.env` faylına əlavə edin:
```
SCIHUB_USERNAME=your-username
SCIHUB_PASSWORD=your-password
```

---

### 3. Sentinel Hub API (Pullu, Amma Yaxşı Performans)

**Üstünlükləri:**
- Yüksək performans
- Real-time processing
- Yaxşı dokumentasiya

**Qeydiyyat:**
1. https://www.sentinel-hub.com/
2. Account yaradın
3. API credentials alın

**Konfiqurasiya:**
```bash
pip install sentinelhub
```

`.env` faylına əlavə edin:
```
SENTINEL_HUB_CLIENT_ID=your-client-id
SENTINEL_HUB_CLIENT_SECRET=your-client-secret
SENTINEL_HUB_INSTANCE_ID=your-instance-id
```

---

## İstifadə

1. **Planetary Computer** (tövsiyə olunur) - heç bir konfiqurasiya lazım deyil
2. **SciHub** - `.env` faylında credentials əlavə edin
3. **Sentinel Hub** - pullu, amma ən yaxşı performans

Sistem avtomatik olaraq mövcud olan ən yaxşı variantı seçəcək.

## Test

Backend-i işə salın və "Fetch NDVI" buttonuna klikləyin. Real məlumatlar gələcək!

