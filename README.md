# BookNook API

Express.js + MongoDB backend for the Programming Hero B14-A8 BookNook assignment.

## Features

- Eight required REST API routes for books and borrowing.
- MongoDB collections for books and active borrow records.
- JWT authentication middleware for protected endpoints.
- Book ownership checks for edit and delete.
- Available-copy tracking and no-double-borrow protection.
- Search, category filtering, sorting and pagination for books.
- Request validation, CORS, Helmet and consistent JSON errors.
- Sample seed data for local development.

## Requirements

- Node.js 20+
- MongoDB Atlas or local MongoDB
- A JWT secret shared securely with the Next.js server-side token issuer

## Local setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` with your own MongoDB URI, database name, JWT secret and frontend origin.

```bash
npm run dev
```

API runs at `http://localhost:5000`.

Insert the sample books:

```bash
npm run seed
```

The seed script is safe to run more than once; it skips matching title/author pairs.

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | Local Express port |
| `NODE_ENV` | Runtime environment |
| `MONGODB_URI` | MongoDB connection string |
| `DB_NAME` | Database name (default `booknook`) |
| `JWT_SECRET` | Long random secret used to verify internal API JWTs |
| `CLIENT_URL` | Allowed frontend origins; comma-separated if needed |

Never commit `.env`. Never expose `JWT_SECRET` or MongoDB credentials in frontend code or `NEXT_PUBLIC_` variables.

## Authentication contract

The frontend must obtain the current Better Auth session on the Next.js server, then issue a short-lived HS256 API token using the same `JWT_SECRET`. The token must include:

```json
{
  "sub": "stable-user-id",
  "email": "user@example.com",
  "name": "User Name",
  "iss": "booknook-client"
}
```

Set an expiry (for example, 10 minutes). Send it to protected API routes as:

```http
Authorization: Bearer YOUR_SHORT_LIVED_TOKEN
```

Do not create this token in browser code. Do not send the Better Auth session cookie to Express. Keep the shared secret only in server-side environment variables.

## API routes

### Books

- `GET /books` — public. Optional query parameters: `category`, `search`, `sort=newest|oldest`, `page`, `limit`.
- `GET /books/:id` — public.
- `POST /books` — protected. Required JSON: `title`, `author`, `category`, `image`, `description`, `totalCopies`, `addedByName`, `addedByEmail`.
- `PATCH /books/:id` — protected; only the user who added the book can edit it.
- `DELETE /books/:id` — protected; only the owner can delete, and books with active borrows cannot be deleted.

### Borrows

- `POST /borrows` — protected. JSON: `{ "bookId": "MongoDB ObjectId", "returnDate": "optional ISO date" }`. Defaults to seven days.
- `GET /borrows` — protected; returns only the authenticated user's borrow records.
- `DELETE /borrows/:id` — protected; returns the book and restores one available copy.

## Example responses

Successful list:

```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 12, "total": 0, "totalPages": 0 }
}
```

Errors use `{ "success": false, "message": "..." }`. Validation errors may also include an `errors` array.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Add `MONGODB_URI`, `DB_NAME`, `JWT_SECRET`, `CLIENT_URL`, and `NODE_ENV=production` in Vercel Project Settings → Environment Variables.
4. Redeploy after adding variables.
5. Test `/health`, `/books`, and protected endpoints.

The included `vercel.json` routes requests to the serverless entry point in `api/index.js`.

## Important production note

The borrow implementation uses an atomic inventory decrement and a unique MongoDB index to prevent simultaneous duplicate active borrows. It compensates the inventory decrement if borrow insertion fails. For a high-traffic production library, use MongoDB transactions on a replica set and add an idempotency strategy for return operations.

## Authenticated owner book listing

`GET /books?mine=true` is supported for the signed-in user's own book collection. It requires the same JWT Bearer token as the other protected operations. The server filters using the verified token email; it does not trust an email supplied in the query string.

When creating a book, the server now derives `addedByName`, `addedByEmail`, and `addedById` from the verified JWT identity (the submitted email is still checked against the token).

## Deployment note

The Vercel MongoDB authentication failure reported for the deployed `/books` endpoint remains unresolved. Confirm that Vercel is using this `api/index.js` + `src/` project version and that `MONGODB_URI`, `DB_NAME`, and the Atlas database user's credentials are correct.
