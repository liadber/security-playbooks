# Security Playbooks

A minimal web app for creating and simulating security automation playbooks.

## Prerequisites

- Node.js 24.7 or later (tested with v24.19). Passwords are hashed with the built-in `crypto.argon2`, which was added in 24.7.
- Docker with Docker Compose (for MongoDB)

## Running locally

### 1. Start MongoDB

From the project root:

```sh
docker compose up -d
```

This starts MongoDB 7 on `localhost:27017`. Data is kept in a Docker volume, so it survives container restarts. Stop it with `docker compose down` (add `-v` to also delete the data).

### 2. Configure the server

```sh
cd server
cp .env.example .env
```

Then open `.env` and set `JWT_SECRET` to a long random string, for example the output of:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

| Variable        | Purpose                                                              | Default in `.env.example`             |
| --------------- | -------------------------------------------------------------------- | ------------------------------------- |
| `PORT`          | Port the server listens on                                           | `4000`                                |
| `MONGODB_URI`   | MongoDB connection string                                            | `mongodb://localhost:27017/playbooks` |
| `JWT_SECRET`    | Secret used to sign login tokens (HS256)                             | placeholder, replace it               |
| `COOKIE_SECURE` | Send the auth cookie only over HTTPS: `true` in production, `false` for local http | `false`                  |

The server refuses to start if `MONGODB_URI`, `JWT_SECRET` or `COOKIE_SECURE` is missing or invalid.

### 3. Install and run

```sh
npm install
npm run dev
```

The server starts on `http://localhost:4000` and restarts automatically on every file save. If it cannot reach MongoDB it prints an error and exits.

### 4. Verify

```sh
curl http://localhost:4000/health
```

Expected response:

```json
{ "status": "ok", "db": "connected" }
```

## API

All request and response bodies are JSON. Errors have the shape `{ "error": "<message>" }`; validation errors add a `fields` object with one message per invalid field. Unknown routes answer 404 in the same shape.

| Method | Path             | Auth   | Description                                                                                                             |
| ------ | ---------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| GET    | `/health`        | no     | Server and database status                                                                                              |
| POST   | `/auth/register` | no     | Create a user. Body: `{ email, password }` (min 8 chars). Returns 201 with `{ id, email }`, or 409 if the email exists. |
| POST   | `/auth/login`    | no     | Body: `{ email, password }`. Sets the auth cookie and returns 200 with `{ id, email }`, or 401.                          |
| POST   | `/auth/logout`   | no     | Clears the auth cookie. Returns 204, also when not logged in.                                                           |
| GET    | `/auth/me`       | cookie | Returns the current user's `{ id, email }`, or 401 without a valid cookie.                                              |

### Authentication

Logging in issues a JWT (HS256, valid for 1 hour) and sends it in a cookie named `token` rather than in the response body. The cookie is:

- `HttpOnly`, so page scripts cannot read it. A cross-site scripting bug in the client cannot steal the session.
- `SameSite=Strict`, so browsers only send it on requests that originate from this site. A form or link on another site cannot make the browser act as the logged-in user (CSRF).
- `Secure` when `COOKIE_SECURE=true`, so it is never sent over plain http in production.
- Limited to `Path=/` and given a `Max-Age` equal to the token lifetime, so it disappears when the token would stop working anyway.

Browsers attach the cookie automatically, so a client only has to call `/auth/login` once and then use the protected routes. `/auth/logout` clears it.

### Trying it from PowerShell

`Invoke-RestMethod` keeps cookies between calls when you give it a web session: create it with `-SessionVariable` on login and pass it back with `-WebSession` afterwards.

```powershell
$base = "http://localhost:4000"
$body = @{ email = "alice@example.com"; password = "correct-horse" } | ConvertTo-Json

# Register (201)
Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType "application/json" -Body $body

# Login (200): the cookie is stored in $session
Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType "application/json" -Body $body -SessionVariable session

# Protected route (200), sending the cookie
Invoke-RestMethod -Uri "$base/auth/me" -WebSession $session

# Logout (204) clears the cookie; /auth/me now answers 401
Invoke-RestMethod -Method Post -Uri "$base/auth/logout" -WebSession $session
Invoke-RestMethod -Uri "$base/auth/me" -WebSession $session
```

Postman keeps cookies automatically, so after calling `/auth/login` there the protected routes work without any extra setup.

`Invoke-RestMethod` throws on 4xx/5xx responses. To see the JSON error body in Windows PowerShell 5.1:

```powershell
try { Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType "application/json" -Body '{"email":"bad","password":"short"}' }
catch { $_.ErrorDetails.Message }
```

## Project structure (`server/src`)

```
config/      environment variables and their defaults
modules/     one folder per feature: routes, service, schemas, types, constants
  auth/      register, login, logout, me; password hashing; tokens; auth cookie
  users/     User model and types
  health/    health check
shared/      cross-cutting code: middleware, errors, HTTP status constants, DB connection
app.ts       builds the Express app (routes, 404, error handler)
index.ts     connects to MongoDB and starts listening
```

## Scripts (in `server/`)

| Script                 | What it does                          |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Run with auto-restart on save (tsx)   |
| `npm run typecheck`    | Type-check without emitting           |
| `npm run lint`         | Run ESLint                            |
| `npm run format`       | Format with Prettier                  |
| `npm run format:check` | Check formatting without writing      |
| `npm run build`        | Compile TypeScript to `dist/`         |
| `npm start`            | Run the compiled server from `dist/`  |
