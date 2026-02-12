# JS Backend Template

Firebase Authentication + MySQL (Amazon RDS) backend template.

## Stack

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Authentication**: Firebase Auth (Email/Password + Google OAuth)
- **Database**: MySQL on Amazon RDS
- **Database Client**: mysql2 (raw SQL with parameterized queries)
- **Language**: JavaScript (ES Modules)

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your Firebase credentials

# Set up database config
cp rds-config.ini.example rds-config.ini
# Edit rds-config.ini with your RDS credentials

# Create tables on your RDS instance
mysql -h <endpoint> -u <user> -p <dbname> < sql/create_tables.sql

# Start development server
npm run dev
```

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for full setup instructions.

## API Endpoints

- `POST /auth/signup` - Create new user
- `POST /auth/login` - Login with Firebase ID token
- `GET /auth/me` - Get current user
- `GET /auth/users` - Get all users (protected)
- `POST /auth/logout` - Logout
- `GET /auth/google` - Google OAuth info
- `POST /auth/callback` - OAuth callback handler
- `POST /auth/token` - Handle Firebase token

## Scripts

```bash
npm run dev    # Start development server
npm run lint   # Run ESLint
```

## Configuration

This project uses two config sources:

- **`.env`** - Firebase credentials, CORS, port, environment. See [.env.example](.env.example).
- **`rds-config.ini`** - RDS database connection. See [rds-config.ini.example](rds-config.ini.example).

Required `.env` variables:
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase service account JSON
- `PORT` - Server port (default: 5050)
- `FRONTEND_URL` - Frontend URL for CORS
- `NODE_ENV` - Environment (development/production)

## Project Structure

```
js-backend/
├── sql/
│   └── create_tables.sql      # MySQL schema
├── src/
│   ├── config/
│   │   ├── firebase.js        # Firebase Admin SDK
│   │   └── database.js        # MySQL connection helper
│   ├── controllers/
│   │   └── authController.js  # Authentication logic
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── routes/
│   │   └── authRoutes.js      # API routes
│   └── server.js              # Express app
├── .env.example               # Environment template
├── rds-config.ini.example     # RDS config template
└── package.json
```

## License

ISC
