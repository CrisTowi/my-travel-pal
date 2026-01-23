# Vercel Deployment Guide

This guide covers deploying both the frontend and backend to Vercel.

## Overview

- **Frontend**: Deploys as a static site (Vite build)
- **Backend**: Deploys as serverless functions (Express API)
- **Database**: MongoDB Atlas (works the same way)

## Option 1: Monorepo Setup (Recommended)

Deploy both frontend and backend from the same repository.

### Project Structure

```
my-travel-pal/
├── my-travel-pal/          # Frontend (Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/                # Backend (Express)
│   ├── server.js
│   ├── package.json
│   └── ...
└── vercel.json             # Vercel configuration
```

### Step 1: Create `vercel.json` in Project Root

Create a `vercel.json` file in the root of your project:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "my-travel-pal/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "my-travel-pal/$1"
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "backend/server.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 2: Update Backend for Vercel

Modify `backend/server.js` to work with Vercel's serverless functions:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Export for Vercel serverless
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

### Step 3: Update Frontend Build Script

Update `my-travel-pal/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "vercel-build": "vite build"
  }
}
```

### Step 4: Update Frontend Environment Variable

In your frontend `.env` or `.env.production`:

```env
# For production, this will be set in Vercel dashboard
VITE_API_BASE_URL=/api
```

Or use the full URL if deploying backend separately:
```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

### Step 5: Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set root directory (leave as `.` for monorepo)
   - Override settings? No (use defaults)

5. **Set Environment Variables in Vercel Dashboard**:
   - Go to your project in Vercel dashboard
   - Settings → Environment Variables
   - Add these variables:

   **For Production:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mytravelpal?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```

   **For Preview/Development:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mytravelpal?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   FRONTEND_URL=https://your-preview-url.vercel.app
   ```

6. **Redeploy** after setting environment variables:
   ```bash
   vercel --prod
   ```

## Option 2: Separate Deployments (Alternative)

Deploy frontend and backend as separate Vercel projects.

### Backend Deployment

1. **Create `vercel.json` in `backend/` directory**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

2. **Deploy backend**:
   ```bash
   cd backend
   vercel
   ```

3. **Note the backend URL** (e.g., `https://my-travel-pal-backend.vercel.app`)

### Frontend Deployment

1. **Update frontend `.env.production`**:
   ```env
   VITE_API_BASE_URL=https://my-travel-pal-backend.vercel.app/api
   ```

2. **Create `vercel.json` in `my-travel-pal/` directory**:
   ```json
   {
     "version": 2,
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

3. **Deploy frontend**:
   ```bash
   cd my-travel-pal
   vercel
   ```

## Important Vercel-Specific Considerations

### 1. Serverless Function Timeout

Vercel serverless functions have execution time limits:
- **Hobby plan**: 10 seconds
- **Pro plan**: 60 seconds
- **Enterprise**: 300 seconds

Your auth endpoints should be fast, but if you add heavy operations later, consider:
- Using Vercel Edge Functions for faster responses
- Optimizing database queries
- Using background jobs for heavy tasks

### 2. Database Connection

MongoDB Atlas connection works the same way. However, with serverless functions:
- Each function invocation creates a new connection
- Consider connection pooling or using MongoDB's connection string with connection pooling enabled
- Vercel functions are stateless, so connections don't persist between invocations

**Update `config/database.js` for better serverless handling**:

```javascript
const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
```

### 3. CORS Configuration

Update CORS in `backend/server.js` to allow your Vercel frontend URL:

```javascript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000', // For local development
    'http://localhost:5173', // Vite default (if using Vite)
  ],
  credentials: true,
}));
```

### 4. Environment Variables

- Set all environment variables in Vercel dashboard
- Use different values for Production, Preview, and Development
- Never commit `.env` files
- Vercel automatically injects environment variables at build/runtime

### 5. Build Settings

For monorepo setup, you may need to configure build settings in Vercel:

- **Root Directory**: Leave as `.` (root)
- **Build Command**: 
  - Frontend: `cd my-travel-pal && npm run build`
  - Backend: Not needed (serverless)
- **Output Directory**: `my-travel-pal/dist`
- **Install Command**: `npm install` (runs in root)

## Testing Deployment

1. **Test backend health endpoint**:
   ```
   https://your-app.vercel.app/api/health
   ```

2. **Test registration**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```

3. **Test frontend**:
   - Visit your Vercel URL
   - Try registering a new account
   - Try logging in

## Troubleshooting

### Backend not working
- Check Vercel function logs in dashboard
- Verify environment variables are set
- Check MongoDB Atlas network access allows Vercel IPs (or use 0.0.0.0/0 for development)

### CORS errors
- Verify `FRONTEND_URL` environment variable matches your frontend URL
- Check CORS configuration in backend

### Database connection issues
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access
- Review connection pooling implementation

### Build failures
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure build commands are correct

## MongoDB Atlas Network Access for Vercel

Since Vercel uses dynamic IPs, you have two options:

1. **Allow all IPs** (for development/testing):
   - In MongoDB Atlas → Network Access
   - Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

2. **Use MongoDB Atlas IP Access List** (for production):
   - Vercel provides static IPs for Enterprise plans
   - Or use MongoDB Atlas VPC peering (advanced)

For most cases, allowing all IPs is fine since you're using authentication.

## Next Steps After Deployment

1. Update frontend environment variable to use production API URL
2. Test all authentication flows
3. Set up custom domain (optional)
4. Configure analytics (optional)
5. Set up monitoring and error tracking

## Cost Considerations

- **Vercel Hobby Plan**: Free for personal projects
  - 100GB bandwidth/month
  - Unlimited serverless function executions
  - Perfect for development and small projects

- **Vercel Pro Plan**: $20/month
  - More bandwidth
  - Team collaboration
  - Better performance

- **MongoDB Atlas**: Free M0 tier
  - 512MB storage
  - Shared cluster
  - Perfect for development
