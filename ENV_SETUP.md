# Environment Variables Setup

## Frontend Environment Variables

Create a `.env` file in the root of your `my-travel-pal` directory:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### For Production:
```env
VITE_API_BASE_URL=https://your-backend-api.com/api
```

## Backend Environment Variables

Create a `.env` file in your `backend` directory (see `BACKEND_SETUP.md`):

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mytravelpal?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-change-this
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
```

## Important Notes

1. **Never commit `.env` files to version control**
   - Make sure `.env` is in your `.gitignore`
   
2. **Vite Environment Variables**
   - Vite requires the `VITE_` prefix for environment variables
   - Access in code: `import.meta.env.VITE_API_BASE_URL`

3. **Security**
   - Use strong, unique values for `JWT_SECRET`
   - Never expose MongoDB connection strings publicly
   - Use different values for development and production
