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

### 5. Start the client

In a second terminal, from the project root:

```sh
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173`. Its dev server proxies every request to `/api/*` to the API server at `http://localhost:4000` with the `/api` prefix removed, so the browser talks to a single origin and the auth cookie is first-party. If your server runs on another port, copy `client/.env.example` to `client/.env` and set `SERVER_PORT`. It has no `VITE_` prefix on purpose: only `VITE_`-prefixed variables are exposed to browser code, and this one is read by `vite.config.ts` alone.

Open `http://localhost:5173`, create an account, and you land on the Simulate page.

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

## Tests

### Server

```sh
cd server
npm test
```

Unit tests (config, password hashing, tokens, validation schemas) need nothing else. Integration tests send real HTTP requests to the app with `supertest` against an in-memory MongoDB started by `mongodb-memory-server`, so Docker does not need to be running. The first run downloads a MongoDB binary (a few hundred MB; about 600 MB on Windows) into `~/.cache/mongodb-binaries`, so it takes a few minutes; later runs take seconds.

`npm run test:watch` re-runs the tests on every save. Test files sit next to the code they test (`*.test.ts`) and are excluded from the build output.

### Client

```sh
cd client
npm test
```

Vitest with Testing Library in jsdom; nothing else needs to be running. The API module is mocked in page tests, so they exercise the real routes, forms and auth state without a server. Test files sit next to the code they test (`*.test.ts` / `*.test.tsx`). `npm run test:watch` re-runs them on every save.

## Shared types (`shared/types`)

The contract between client and server lives once, in `shared/types/`, as `.d.ts` files: the public user (`PublicUser`), the error body (`ErrorResponse`) and the auth request body (`Credentials`). Both sides import them with `import type` through the `@shared/*` alias (a `paths` entry in each `tsconfig`, mirrored by a Vite alias on the client). Type-only imports are erased when the code is compiled or run, so nothing at runtime depends on the folder and the server's build output is unchanged.

Only types belong there. Values such as the minimum password length stay on the side that enforces them: the server is the source of truth for validation, and the client repeats the few limits its forms need as its own constants. The server's zod schemas are tied to the contract with `satisfies z.ZodType<Credentials>`, so a schema that drifts from the shared type fails typecheck. The folder holds only interfaces, so it is covered by typecheck and Prettier on both sides; there is nothing for ESLint to check.

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

## Project structure (`client/src`)

```
features/    one folder per feature: pages, API calls, types, constants (including route paths)
  auth/      login/register page and form, AuthProvider + useAuth, auth.api.ts
  playbooks/ placeholder page
  simulation/ placeholder page
shared/      code any feature may use
  api/       request() (the single fetch wrapper), ApiError, the unauthorized handler
  forms/     useFormAction (form actions with server errors) and toFormErrors
  components/ Button, FormField, ErrorMessage, LoadingScreen, PageLayout (CSS Modules)
  styles/    CSS variables for colors and spacing, global reset
app/         routes, route guards (routing/), AppLayout (header), not-found page
App.tsx      BrowserRouter > AuthProvider > routes
main.tsx     mounts the app
```

Dependencies point one way: `app/` may import from `features/` and `shared/`; a feature imports only from `shared/` (never from another feature or from `app/`); `shared/` imports from neither. Test files follow the same rule, which is why the helper that renders the whole app lives in `app/`.

Imports that leave their own folder use the `@/` alias for `client/src` (for example `@/shared/api/http`), so there are no `../` paths to count; imports within a folder stay relative (`./`). The alias is a `paths` entry in `tsconfig.app.json` and a `resolve.alias` entry in `vite.config.ts`, which Vitest reads too. `@shared/` is the same mechanism for the type-only contract with the server.

One kind of thing per file: components, hooks, functions, types and constants each have their own file (`*.types.ts`, `*.constants.ts`). The one exception is a component's own `Props` type, which stays in the component's file because it is part of the component's signature. `vite.config.ts` is exempt, since it cannot import from `src/`.

### Main decisions

- **The client never handles the token.** The server sets an httpOnly cookie; `request()` sends `credentials: 'same-origin'` and the browser attaches the cookie. Nothing is kept in `localStorage` or `sessionStorage`, so a script injected into the page has nothing to steal.
- **Session check before routing.** `AuthProvider` calls `/auth/me` on start and the route guards show a loading state until it answers, so reloading a protected page does not bounce a logged-in user to `/login`.
- **Navigation lives in the route guards.** `ProtectedRoute` sends a visitor to `/login` and remembers the page they asked for; `GuestRoute` sends a logged-in user back to that page, or to the home route. Only in-app paths are honoured, so the login page cannot be used as an open redirect. Pages never call `navigate()`: after login or logout the guards react to the auth state.
- **An expired session logs out everywhere.** The token lives for an hour. When any request is answered with 401, `shared/api` notifies a handler that `AuthProvider` registers to clear the user, and the guards redirect to `/login`. A wrong-password login is also a 401, but the user was already logged out, so the form simply shows the error.
- **One fetch wrapper.** Every call goes through `shared/api/request()`, which turns the server's `{ error, fields }` responses into an `ApiError`; pages only decide where to show `message` and `fields`.
- **React 19 form Actions through one hook.** `shared/forms/useFormAction` wraps `useActionState`: the form passes a submit function and gets back the state (general error, per-field errors, kept values), the form action and `isPending`. Chosen field values (the email) survive a failed submit; passwords never do. Browser attributes (`required`, `type="email"`, `minLength`) give first-line validation; the server's rules remain the source of truth.
- **Registering logs in.** The server's register endpoint only creates the account, so the client calls login right after it.
- **Feature folders, one kind of thing per file, named constants.** Route paths and API endpoints live in each feature's constants file; `shared/` never imports from `features/`.
- **Dev proxy instead of CORS.** During development Vite forwards `/api/*` to the server, so no CORS headers are needed and the `SameSite=Strict` cookie works unchanged.
- **No magic numbers in CSS.** Every value a stylesheet uses (colors, spacing, border and focus-ring widths, radii, font sizes and weights, line height, opacity, widths) is a variable in `shared/styles/variables.css`; only `0` and `100%`/`100vh` appear as literals. Units: `px` for borders, outlines and radii; `rem` for spacing, sizes, widths and font sizes.

## Scripts (in `client/`)

| Script                 | What it does                             |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Vite dev server with the `/api` proxy    |
| `npm run typecheck`    | Type-check the app and config            |
| `npm run lint`         | Run ESLint                               |
| `npm run format`       | Format with Prettier                     |
| `npm run format:check` | Check formatting without writing         |
| `npm test`             | Run the tests once                       |
| `npm run test:watch`   | Re-run tests on every save               |
| `npm run build`        | Type-check and build to `dist/`          |
| `npm run preview`      | Serve the production build locally       |
