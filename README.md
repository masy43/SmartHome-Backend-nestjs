# SmartHome Backend — NestJS API

This repository is the backend API for the SmartHome project. It's built with NestJS and TypeScript, uses Prisma as the ORM, and exposes authenticated REST endpoints to manage devices, users, and telemetry data.

## Key features

- Modular NestJS architecture
- JWT-based authentication and role support
- Prisma ORM with migrations and seeding
- TypeScript types and basic validation

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Git
- PostgreSQL (recommended for production) or SQLite for local development

## Getting started (developer)

1. Clone your fork of the repository

   git clone https://github.com/<your-username>/SmartHome-Backend-nestjs.git
   cd SmartHome-Backend-nestjs

2. Install dependencies

   npm install

3. Create environment file

   Copy `.env.example` to `.env` (or create a `.env`) and set the values. Example:

   DATABASE_URL="postgresql://user:password@localhost:5432/smarthome?schema=public"
   JWT_SECRET=replace-with-a-secure-secret
   JWT_EXPIRES_IN=3600s

4. Apply Prisma migrations (development)

   npx prisma migrate dev --name init

5. Seed the database (optional)

   node prisma/seed.js

6. Start the app

   npm run start:dev

The app will run on http://localhost:3000 by default (unless configured otherwise).

## Scripts

- npm run start # Start production server
- npm run start:dev # Start dev server with Hot Reload
- npm run build # Build app
- npm run lint # Run linter (if configured)
- npm run test # Run tests (if configured)

## Project layout

- src/ - Application source
  - auth/ - Authentication module, DTOs and guards
  - prisma/ - Prisma service wrapper
  - app.module.ts, main.ts - App entry
- prisma/
  - schema.prisma - Prisma schema
  - seed.js - Seed script used for development

## Database

This project uses Prisma. Keep `DATABASE_URL` in your `.env` up-to-date. For production, use a managed PostgreSQL instance and run `npx prisma migrate deploy` during deployment.

## Seeding

Run `node prisma/seed.js` to populate the database with initial data. Review `prisma/seed.js` and adjust as needed before running in any environment.

## Environment & security notes

- Never commit `.env` or sensitive keys. Those are included in `.gitignore`.
- Use strong, randomly generated `JWT_SECRET` values in production and rotate when necessary.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests where applicable
4. Run linting and tests
5. Open a pull request with a clear description

## License

Specify the project license here (e.g., MIT).

## Maintainer

masy43 — https://github.com/masy43

---

If you'd like, I can also:

- Initialize a local git repository and commit these changes
- Add the remote `https://github.com/masy43/SmartHome-Backend-nestjs.git` and attempt to push

Tell me if you want me to proceed with those steps now.
