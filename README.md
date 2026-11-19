# Coy Discover

A swipe based "Discover" tab for Coy. I made this for the Coy SDE intern assignment. It has a blank Home tab, a Discover tab and a Matches tab.

## Stack

- **Frontend:** React (Vite), Tailwind CSS, Framer Motion
- **Backend:** Node.js + Express
- **Database:** SQLite through Prisma
- **Tests:** Jest + Supertest
- **API docs:** Swagger UI
- **Docker:** Docker Compose for running everything with one command

## How to run

There are two ways: with Docker (easiest) or directly with Node.

### Option 1: Run with Docker

You only need [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
git clone https://github.com/vidhi-vats-11/coy-discover.git
cd coy-discover
docker compose up --build
```

Then open:

- App: http://localhost:5173
- API: http://localhost:5000
- API docs (Swagger): http://localhost:5000/docs

The first start creates the database and adds the 30 profiles. Data is saved in a Docker volume, so swipes and matches stay after a restart.

To stop: press `Ctrl + C`, or run `docker compose down`.
To start fresh with new data: `docker compose down -v` (this deletes the saved data), then `docker compose up --build` again.

### Option 2: Run locally with Node

You need Node 20 or newer. Check with `node -v`.

**1. Clone the repo**

```bash
git clone https://github.com/vidhi-vats-11/coy-discover.git
cd coy-discover
```

**2. Start the backend** (first terminal)

```bash
cd server
npm install
echo 'DATABASE_URL="file:./dev.db"' > .env
npx prisma migrate deploy   # creates the SQLite database and tables
npm run seed                # adds 30 profiles, 9 of them have already liked you
npm run dev                 # API runs on http://localhost:5000
```

**3. Start the frontend** (second terminal, from the `coy-discover` folder)

```bash
cd client
npm install
npm run dev                 # app runs on http://localhost:5173
```

Open http://localhost:5173. Swipe right or press the heart to like, swipe left or press X to pass.

**Reset data:** run `npm run seed` inside `server` again. It deletes all swipes and matches and adds the 30 profiles again.

### Run the tests

```bash
cd server
npm test
```

Tests use a separate `prisma/test.db`, so dev data is not changed. They cover all three APIs, the match logic, the privacy rules and the docs.

## API

| Method | Path | What it does |
|---|---|---|
| GET | `/feed` | Profiles the user hasn't swiped on yet |
| POST | `/swipe` | Body: `{ profileId, action: "LIKE" \| "PASS" }`. Saves the swipe and returns `{ matchCreated, match }` |
| GET | `/matches` | The user's mutual matches, newest first |

Full API contract with request and response examples is in Swagger: http://localhost:5000/docs (spec file: `server/src/docs/openapi.json`).

`/swipe` returns `400` for a bad body, `404` for an unknown profile and `409` if the profile was already swiped on.

## How matching works

There is only one logged in user (`demo-user`), as said in the assignment. Each profile has a `likedYou` field. If it is `true`, it means that person already liked the user. A match is made only when the user likes a profile with `likedYou = true`.

Swipe and match are saved in one transaction, so a like is never saved without its match. `Swipe` has a unique key on `(userId, profileId)`, so one profile can be swiped only once. Even if two requests come at the same time (like a double tap), one of them gets `409`.

## Privacy

Main rule of Coy: user should never know who liked them, unless it is mutual. This is how I handled it:

- `likedYou` is never sent to the frontend. All APIs use `publicProfileFields`, which does not include it.
- `/swipe` gives the same response for a pass and a one-sided like (`matchCreated: false, match: null`). Otherwise user can pass someone and still find out from the response if that person liked them. There is a test for this.
- `/feed` is sorted by created time, not by who liked you, so card order also doesn't tell anything.
- `/swipe` sends profile details only when it is a match.

## Project structure

```
client/src/
  App.jsx                 tab state, data loading, swipe handling
  api.js                  calls to the backend
  components/             Header, BottomNav, DiscoverView, ProfileCard,
                          MatchesList, MatchModal
server/
  prisma/schema.prisma    Profile, Swipe, Match
  src/app.js              Express app
  src/docs/openapi.json   Swagger / OpenAPI API contract
  src/server.js           starts the server
  src/routes/apiRoutes.js /feed, /swipe, /matches
  src/data/seed.js        30 mock profiles
  tests/api.test.js       API tests
  Dockerfile
docker-compose.yml        runs client + server together
```

## Author

Vidhi Vats · [GitHub](https://github.com/vidhi-vats-11) · [LinkedIn](https://www.linkedin.com/in/vidhivats-/)
