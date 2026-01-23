# MongoDB Atlas Setup Instructions

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account (or sign in if you already have one)
3. Create a new organization (or use existing)

## Step 2: Create a Cluster

1. Click **"Build a Database"** or **"Create"** button
2. Choose **FREE (M0)** tier (shared cluster, perfect for development)
3. Select a cloud provider and region (choose closest to you)
4. Name your cluster (e.g., "MyTravelPal-Cluster")
5. Click **"Create Cluster"** (takes 3-5 minutes)

## Step 3: Create Database User

1. In the **Security** section, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter a username (e.g., `mytravelpal-admin`)
5. Click **"Autogenerate Secure Password"** or create your own
6. **IMPORTANT:** Copy and save this password securely - you'll need it for your backend
7. Under **"Database User Privileges"**, select **"Atlas admin"** (for development) or **"Read and write to any database"**
8. Click **"Add User"**

## Step 4: Configure Network Access

1. In the **Security** section, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - **Note:** For production, restrict to specific IPs
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Click **"Connect"** button on your cluster
2. Choose **"Connect your application"**
3. Select **"Node.js"** as driver and **"6.0 or later"** as version
4. Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
5. Replace `<username>` with your database username
6. Replace `<password>` with your database password
7. Add your database name at the end: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mytravelpal?retryWrites=true&w=majority`

## Step 6: Create Database and Collections

You'll need to create these collections in your MongoDB database:

### Database Name: `mytravelpal`

### Collections to Create:

1. **`users`** - Store user profiles
   - Will contain: `_id`, `email`, `passwordHash`, `name`, `createdAt`, `updatedAt`

2. **`sessions`** (optional) - Store active sessions/tokens
   - Will contain: `_id`, `userId`, `token`, `expiresAt`, `createdAt`

### To Create Collections:

1. Click **"Browse Collections"** in your cluster
2. Click **"Add My Own Data"**
3. Enter database name: `mytravelpal`
4. Enter collection name: `users`
5. Click **"Create"**
6. Repeat for `sessions` if you want to track sessions

## Step 7: Environment Variables for Backend

You'll need these environment variables in your backend:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mytravelpal?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
PORT=3001
```

## MongoDB Schema Structure

### Users Collection Schema:
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  passwordHash: String (required),
  name: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Sessions Collection Schema (optional):
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to users._id),
  token: String,
  expiresAt: Date,
  createdAt: Date
}
```

## Next Steps

1. Set up your backend API (see `BACKEND_SETUP.md`)
2. Update your frontend to use the authentication API
3. Test the connection

## Security Notes

- Never commit your connection string or passwords to version control
- Use environment variables for all sensitive data
- In production, restrict network access to specific IPs
- Use strong, unique passwords for database users
- Enable MongoDB Atlas monitoring and alerts
