# Backend API

This is the backend API for My Travel Pal, built with Node.js, Express, and MongoDB.

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create `.env` file**:
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string (at least 32 characters)
   - `JWT_EXPIRES_IN`: Token expiration (e.g., "7d")
   - `PORT`: Server port (default: 3001)
   - `NODE_ENV`: Environment (development/production)
   - `FRONTEND_URL`: Your frontend URL for CORS

## Running Locally

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires authentication)
- `GET /api/health` - Health check

## Deployment

See `../VERCEL_DEPLOYMENT.md` for Vercel deployment instructions.
