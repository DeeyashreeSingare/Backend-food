# Setup Instructions

## Prerequisites

1. **PostgreSQL** - Must be installed and running
2. **MongoDB** - Must be installed and running

## Database Setup

### PostgreSQL Setup

1. Install PostgreSQL (if not installed):
   ```bash
   # macOS (using Homebrew)
   brew install postgresql@14
   brew services start postgresql@14
   
   # Or download from https://www.postgresql.org/download/
   ```

2. Create database and run schema:
   ```bash
   npm run setup-db
   ```

   Or manually:
   ```bash
   createdb food_ordering
   psql -d food_ordering -f database/schema.sql
   ```

### MongoDB Setup

1. Install MongoDB (if not installed):
   ```bash
   # macOS (using Homebrew)
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   
   # Or download from https://www.mongodb.com/try/download/community
   ```

2. MongoDB will automatically create the database `food_ordering_notifications` when first used.

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=food_ordering
DB_USER=postgres
DB_PASSWORD=postgres
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=food_ordering_notifications
JWT_SECRET=your-secret-key-change-in-production
```

## Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## Verify Setup

1. Check PostgreSQL: `psql -U postgres -c "SELECT version();"`
2. Check MongoDB: `mongosh --eval "db.version()"`
3. Check server: `curl http://localhost:3000/health`
