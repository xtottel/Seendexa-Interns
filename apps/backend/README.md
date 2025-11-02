# Sendexa Backend API

A fast and modern backend API built with [Bun](https://bun.com), TypeScript, and Prisma ORM.

## Features

- ⚡ Fast runtime with Bun
- 🔐 Authentication & Authorization (JWT)
- 📧 OTP verification system
- 💾 PostgreSQL database with Prisma ORM
- 📝 TypeScript for type safety
- 🎯 RESTful API design
- 📊 SMS messaging system
- 🔒 Security best practices

## Prerequisites

- [Bun](https://bun.sh) v1.3.1 or higher
- PostgreSQL database (local or remote)
- Node.js 18+ (if using some tools)

## Installation

1. **Clone the repository** (if applicable)

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the following:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - A secure random string for JWT signing
   - `SMTP_*` - Email configuration for OTP and notifications
   - `SMS_PROVIDER_*` - SMS provider credentials

4. **Set up the database**
   ```bash
   # Generate Prisma client
   bun run db:generate
   
   # Push schema to database (or use migrations)
   bun run db:push
   
   # Run database migrations
   bun run db:migrate
   
   # Seed the database (optional)
   bun run db:seed
   ```

## Development

Start the development server with hot-reload:
```bash
bun run dev
```

The API will be available at `http://localhost:5000` (or the port specified in `.env`).

## Available Scripts

- `bun run dev` - Start development server with watch mode
- `bun run start` - Start production server
- `bun run build` - Build for production
- `bun run test` - Run tests
- `bun run lint` - Lint code
- `bun run format` - Format code with Prettier
- `bun run typecheck` - Type check without emitting files

### Database Scripts

- `bun run db:generate` - Generate Prisma client
- `bun run db:push` - Push schema changes to database
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Prisma Studio (database GUI)
- `bun run db:seed` - Seed the database
- `bun run db:reset` - Reset the database (⚠️ destructive)

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seed script
├── src/
│   ├── controllers/     # Request handlers
│   ├── core/            # Core utilities (config, logger, etc.)
│   ├── lib/             # External library wrappers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── index.ts             # Application entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── bunfig.toml         # Bun configuration
```

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint
- `GET /api/status` - API status information

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)
- `POST /api/auth/request-otp` - Request internal OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/request-external-otp` - Request external OTP

## Environment Variables

See `.env.example` for all required environment variables. Key variables include:

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing
- `JWT_EXPIRES_IN` - JWT expiration time
- `LOG_LEVEL` - Logging level (info, debug, error, etc.)

## Database

This project uses Prisma ORM with PostgreSQL. The schema is defined in `prisma/schema.prisma`.

### Viewing your database

Use Prisma Studio to view and edit your database:
```bash
bun run db:studio
```

## Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting (to be configured)
- CORS configuration
- Environment variable validation

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

Private project - All rights reserved

## Support

For issues and questions, please contact the development team.
