# Security Playbooks

A web app for security automation playbooks. A playbook pairs a trigger (malware detected, login attempt, phishing alert) with one to three actions (isolate host, notify admin, block IP), and a simulation shows which of your playbooks would run for a trigger. Node/Express with MongoDB on the server, React on the client, one shared type contract between them.

Three pages: **Login / Register**, **Playbooks** (create, list, edit and delete) and **Simulate**, the home page.

## Prerequisites

- Node.js 24.7 or later (passwords are hashed with the built-in `crypto.argon2`)
- Docker with Docker Compose, for MongoDB

## Running locally

```sh
docker compose up -d                  # MongoDB 7 on localhost:27017; stop with: docker compose down
cp server/.env.example server/.env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # a value for JWT_SECRET
```

Set `JWT_SECRET` in `server/.env` to the generated value.

| Variable        | Purpose                                                                            | Default in `.env.example`             |
| --------------- | ---------------------------------------------------------------------------------- | ------------------------------------- |
| `PORT`          | Port the server listens on                                                         | `4000`                                |
| `MONGODB_URI`   | MongoDB connection string                                                          | `mongodb://localhost:27017/playbooks` |
| `JWT_SECRET`    | Secret used to sign login tokens (HS256)                                           | placeholder, replace it               |
| `COOKIE_SECURE` | Send the auth cookie only over HTTPS: `true` in production, `false` for local http | `false`                               |

The server refuses to start if `MONGODB_URI`, `JWT_SECRET` or `COOKIE_SECURE` is missing or invalid.

```sh
npm --prefix server install
npm --prefix client install
npm --prefix server run dev           # http://localhost:4000, restarts on save
npm --prefix client run dev           # http://localhost:5173, in a second terminal
curl http://localhost:4000/health     # { "status": "ok", "db": "connected" }
```

Open `http://localhost:5173`, create an account, and you land on the Simulate page. The client's dev server proxies `/api` to the server; if the server runs on another port, copy `client/.env.example` to `client/.env` and set `SERVER_PORT`.

## Tests

```sh
npm --prefix server test
npm --prefix client test
```

Each side also has `typecheck`, `lint` and `format:check` scripts. The first server test run downloads a MongoDB binary for `mongodb-memory-server` (about 600 MB on Windows), so it takes a few minutes; later runs take seconds.

## Structure

```
server/       Express API: config/, modules/ (auth, users, playbooks, simulation, health), shared/
client/       React app: features/ (auth, playbooks, simulation), shared/ (api, forms, options, components, styles), app/ (routes, guards, layout)
shared/types  the type-only contract both sides import through @shared/*
```

Dependencies point one way: on the client `app/` may import `features/` and `shared/`, a feature imports only `shared/` and never another feature, and `shared/types` imports nothing.

## API

All bodies are JSON. Errors are `{ "error": "<message>" }`, with a `fields` object (one message per invalid field) on validation errors. Auth is a cookie set by `/auth/login`, so Postman works after logging in; every route marked `cookie` answers 401 without a valid one.

| Method | Path                 | Auth   | Returns                                                                                       |
| ------ | -------------------- | ------ | --------------------------------------------------------------------------------------------- |
| GET    | `/health`            | no     | `{ status, db }`                                                                              |
| POST   | `/auth/register`     | no     | 201 `{ id, email }`, or 409 if the email exists. Body `{ email, password }`, password ≥ 8 chars |
| POST   | `/auth/login`        | no     | 200 `{ id, email }` and the auth cookie, or 401. Body `{ email, password }`                   |
| POST   | `/auth/logout`       | no     | 204, cookie cleared                                                                           |
| GET    | `/auth/me`           | cookie | `{ id, email }`                                                                               |
| GET    | `/playbooks/options` | cookie | `{ triggers: [{ code, label }], actions: [{ code, label }], nameMaxLength }`                  |
| GET    | `/playbooks`         | cookie | `[{ id, name, trigger, actions }]`, sorted by name                                            |
| POST   | `/playbooks`         | cookie | 201 the playbook, 400, or 409 on a duplicate name. Body `{ name, trigger, actions }`          |
| PATCH  | `/playbooks/:id`     | cookie | 200 the playbook, 400, 404 or 409. Body: any non-empty subset of `{ name, trigger, actions }` |
| DELETE | `/playbooks/:id`     | cookie | 204, or 404                                                                                   |
| POST   | `/simulateTrigger`   | cookie | `{ trigger, matches: [{ id, name, actions }] }`. Body `{ trigger }`                           |

A trigger is one of `MALWARE_DETECTED`, `LOGIN_ATTEMPT`, `PHISHING_ALERT`; actions are one to three distinct codes among `ISOLATE_HOST`, `NOTIFY_ADMIN`, `BLOCK_IP`, always returned in that order. Names are trimmed, at most 100 characters, and unique per user regardless of case.

Design decisions and their trade-offs: [docs/decisions.md](docs/decisions.md).
