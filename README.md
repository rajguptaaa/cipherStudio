# CipherStudio

A web-based code editor with project management capabilities.

## Setup

### Server
1. Navigate to server directory: `cd server`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. Start server: `npm start`

### Client
1. Navigate to client directory: `cd client`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and update backend URL if needed
4. Start client: `npm run dev`

## Environment Variables

### Server (.env)
- `PORT` - Server port (default: 5174)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URI` - Frontend URL for CORS
- `AZURE_STORAGE_CONNECTION_STRING` - Azure storage connection string

### Client (.env)
- `VITE_BACKEND_URL` - Backend API URL

## Deployment

Make sure to set environment variables in your deployment platform and update URLs accordingly.