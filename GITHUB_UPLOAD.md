# GitHub-a Yükləmə Təlimatları

## 1. GitHub-da Repository Yaradın

1. https://github.com saytına daxil olun
2. Sağ üstdə "+" işarəsinə klikləyin → "New repository"
3. Repository məlumatlarını doldurun:
   - **Repository name**: `agrimonitor`
   - **Description**: `🌾 Agricultural monitoring platform using Sentinel-2 satellite imagery and NDVI analysis for real-time crop health assessment`
   - **Visibility**: Public (və ya Private)
   - **⚠️ ÖNƏMLİ**: "Add a README file" seçimini QEYD ETMƏYİN (bizim artıq var)
   - "Add .gitignore" və "Choose a license" seçimlərini də QEYD ETMƏYİN
4. "Create repository" düyməsinə basın

## 2. Terminal-də Git Əmrləri

Aşağıdakı əmrləri terminal-də yerinə yetirin:

```bash
cd /Users/admin/Documents/agrimonitorlast

# Bütün dəyişiklikləri əlavə et
git add .

# Commit yarat
git commit -m "Initial commit: AgriMonitor - Agricultural Health Monitoring System"

# GitHub repository URL-ni əlavə et (YOUR_USERNAME-i öz GitHub username-inizlə dəyişdirin)
git remote add origin https://github.com/YOUR_USERNAME/agrimonitor.git

# Main branch-ə keç (GitHub artıq main istifadə edir)
git branch -M main

# Kodu GitHub-a yüklə
git push -u origin main
```

## 3. GitHub Username və Password

Əgər GitHub username və password soruşarsa:
- **Username**: GitHub username-iniz
- **Password**: GitHub Personal Access Token (artıq password işləmir)

### Personal Access Token yaratmaq:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → "Generate new token (classic)"
3. Note: `agrimonitor-upload`
4. Expiration: istədiyiniz müddət
5. Scopes: `repo` seçin
6. "Generate token" → token-i kopyalayın və saxlayın
7. Git push zamanı password yerinə bu token-i istifadə edin

## 4. Alternativ: SSH Key istifadəsi (Tövsiyə olunur)

SSH key daha təhlükəsizdir və hər dəfə password/token soruşmur:

```bash
# SSH key yoxla
ls -al ~/.ssh

# Əgər yoxdursa, yeni SSH key yarat
ssh-keygen -t ed25519 -C "your_email@example.com"

# SSH key-i GitHub-a əlavə et
cat ~/.ssh/id_ed25519.pub
# Bu çıxışı kopyalayın və GitHub → Settings → SSH and GPG keys → New SSH key-ə əlavə edin

# Remote URL-i SSH-ə dəyişdir
git remote set-url origin git@github.com:YOUR_USERNAME/agrimonitor.git

# Push et
git push -u origin main
```

## 5. Yoxlama

GitHub-da repository-nizə baxın:
- `https://github.com/YOUR_USERNAME/agrimonitor`

Bütün fayllar görünməlidir!

## 6. Topics Əlavə Etmək

Repository settings → Topics → aşağıdakıları əlavə edin:
- `agriculture`
- `precision-farming`
- `satellite-imagery`
- `ndvi`
- `sentinel-2`
- `fastapi`
- `react`
- `python`
- `geospatial-analysis`
- `crop-health`
- `agtech`
- `remote-sensing`
- `planetary-computer`

---

**Qeyd**: Əgər hər hansı xəta alarsınız, mənə bildirin!

