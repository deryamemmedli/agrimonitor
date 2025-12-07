# Quick Start Guide

## Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- PostgreSQL (optional, SQLite works for development)

## Setup Steps

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
uvicorn app.main:app --reload
```

Backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

### 3. First Steps

1. Open `http://localhost:3000`
2. Register as a Farmer or Agronomist
3. If Farmer: Add your fields
4. If Agronomist: View map and create treatment requests

## Default Configuration

- Database: SQLite (for development)
- API: http://localhost:8000
- Frontend: http://localhost:3000

## Testing the Workflow

1. **Register as Farmer**: Create account, add fields
2. **Register as Agronomist**: Create account
3. **Agronomist**: View map, identify unhealthy fields (low NDVI)
4. **Agronomist**: Create treatment request for a field
5. **Farmer**: Accept the request
6. **Agronomist**: Start and complete treatment
7. **Agronomist**: Verify treatment with after NDVI value
8. **Farmer**: Confirm treatment completion

## Notes

- NDVI data is currently mocked. For production, integrate with actual Sentinel 2 API
- Use PostgreSQL for production instead of SQLite
- Get Hugging Face API token from https://huggingface.co/settings/tokens

