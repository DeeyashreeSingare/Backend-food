# Food Ordering App - Backend Service

This is the backend service for the Food Ordering Application, built with Node.js, Express, PostgreSQL, and MongoDB.

## Tech Stack
- **Node.js & Express**: Core server framework.
- **PostgreSQL**: Primary database for users, restaurants, orders, and payments.
- **MongoDB Atlas**: Used for real-time notification storage.
- **Socket.io**: Real-time updates for order status and notifications.
- **JWT**: Authentication and authorization.

## Core Features
1. **Authentication**: Role-based access for End Users, Restaurants, and Riders.
2. **Order Management**: Complete lifecycle from placement to delivery.
3. **Real-time Notifications**: Instant alerts for order updates via WebSockets.
4. **Image Uploads**: Multer-based image handling for restaurants and dishes.

## Local Setup

### 1. Prerequisites
- Node.js installed.
- PostgreSQL and MongoDB running locally or accessible via URI.

### 2. Environment Variables
Create a `.env` file in the root of the `backend` folder:
```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/food_ordering
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=food_ordering_notifications
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

### 3. Installation
```bash
npm install
```

### 4. Database Setup
```bash
npm run setup-db
```

### 5. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## Deployment to Render

1. **New Web Service**: Connect your GitHub repository.
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `DATABASE_URL`: Your production PostgreSQL string.
   - `MONGODB_URI`: Your MongoDB Atlas string.
   - `JWT_SECRET`: A secure random string.
   - `FRONTEND_URL`: Your Vercel frontend URL.

---
Created by Antigravity 🚀
