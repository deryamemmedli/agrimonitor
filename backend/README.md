# AgriMonitor Backend

Backend API for the AgriMonitor application built with FastAPI.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your database URL and Hugging Face API token.

4. Run the application:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## Database

The application uses SQLAlchemy with PostgreSQL (or SQLite for development).

To initialize the database, the tables are created automatically on first run.

## API Endpoints

- `/api/auth/register` - Register a new user
- `/api/auth/login` - Login and get access token
- `/api/auth/me` - Get current user info
- `/api/farmers/me` - Get farmer profile
- `/api/fields/` - Manage fields
- `/api/requests/` - Manage treatment requests
- `/api/treatments/` - Manage treatments
- `/api/ndvi/` - Get NDVI data

