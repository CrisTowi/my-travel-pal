# Backend API Reference

This document explains the backend API structure and how to get it running. All backend files have already been created in the `backend/` directory.

## Quick Start

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your MongoDB connection string and JWT secret.

3. **Run locally**:
   ```bash
   npm run dev    # Development mode with auto-restart
   npm start      # Production mode
   ```

## Project Structure

```
backend/
├── package.json          # Dependencies and scripts
├── .gitignore           # Git ignore rules
├── .env.example         # Environment variable template
├── server.js            # Main server file (works for both local & Vercel)
├── config/
│   └── database.js      # MongoDB connection (optimized for serverless)
├── models/
│   └── User.js          # User model with password hashing
├── controllers/
│   └── authController.js # Register, login, getMe logic
├── routes/
│   └── auth.js          # Auth routes
└── middleware/
    └── auth.js          # JWT authentication middleware
```

## Environment Variables

Create a `.env` file in the `backend/` directory with:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mytravelpal?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-change-this-in-production
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

See `MONGODB_SETUP.md` for MongoDB Atlas setup instructions.

## API Endpoints

- `POST /api/auth/register` - Register new user
  - Body: `{ email, password, name? }`
  - Returns: `{ success, token, user }`

- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ success, token, user }`

- `GET /api/auth/me` - Get current user (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ success, user }`

- `GET /api/health` - Health check
  - Returns: `{ status: 'OK', message, timestamp }`

## How It Works

### Authentication Flow

1. **Registration/Login**: User provides email and password
2. **Password Hashing**: Password is hashed using bcrypt before storage
3. **JWT Token**: Server generates a JWT token containing user ID
4. **Token Storage**: Frontend stores token in localStorage
5. **Authenticated Requests**: Frontend sends token in `Authorization` header
6. **Token Verification**: Middleware verifies token and extracts user ID

### Database Connection

The `config/database.js` uses connection caching optimized for serverless environments (Vercel). This ensures:
- Connections are reused when possible
- New connections are created efficiently
- Works well with both traditional servers and serverless functions

### Security Features

- **Password Hashing**: Passwords are hashed with bcrypt (10 rounds)
- **JWT Tokens**: Secure token-based authentication
- **CORS Protection**: Configured to allow only specified origins
- **Input Validation**: Email and password validation on registration/login

## Testing the API

### Using curl:

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (requires token)
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Deployment

### Vercel

See `VERCEL_DEPLOYMENT.md` for complete Vercel deployment instructions. The backend is already configured to work with Vercel serverless functions.

### Other Platforms

This Express app can be deployed to:
- Heroku
- Railway
- Render
- DigitalOcean App Platform
- AWS Lambda (with serverless-http)
- Any Node.js hosting platform

## Troubleshooting

### Database Connection Issues

- Verify `MONGODB_URI` is correct in `.env`
- Check MongoDB Atlas network access allows your IP (or 0.0.0.0/0 for development)
- Ensure database user credentials are correct

### CORS Errors

- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Check CORS configuration in `server.js`
- For development, the server allows localhost by default

### Authentication Not Working

- Check JWT_SECRET is set and consistent
- Verify token is being sent in Authorization header
- Check token expiration (default: 7 days)

### Server Won't Start

- Ensure all dependencies are installed: `npm install`
- Check `.env` file exists and has all required variables
- Verify PORT is not already in use
- Check console for specific error messages

## Future Enhancements

- Email verification
- Password reset functionality
- Rate limiting
- Refresh tokens
- Social authentication (Google, GitHub, etc.)
- User profile updates
- Account deletion
