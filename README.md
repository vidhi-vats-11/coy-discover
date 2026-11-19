# Coy Discover

A swipe-based "Discover" tab for Coy, built for the Coy SDE intern assignment. It is a standalone app with a blank Home tab, a Discover tab and a Matches tab.

## Stack

- **Frontend:** React (Vite), Tailwind CSS, Framer Motion
- **Backend:** Node.js + Express
- **Database:** SQLite through Prisma
- **Tests:** Jest + Supertest

## Running it locally

You need Node 20 or newer.

**Backend**

```bash
cd server
npm install
echo 'DATABASE_URL="file:./dev.db"' > .env
npx prisma migrate deploy
npm run seed      # 30 profiles, 10 of them have already liked you
npm run dev       # http://localhost:5000
```

**Frontend** (in a second terminal)

```bash
cd client
npm install
npm run dev       # http://localhost:5173
```

**Tests**

```bash
cd server
npm test
```

The tests use a separate `prisma/test.db`, so they don't touch your dev data.

To start over with fresh data, run `npm run seed` again. It clears all swipes and matches.

## API

| Method | Path | What it does |
|---|---|---|
| GET | `/feed` | Profiles the user hasn't swiped on yet |
| POST | `/swipe` | Body: `{ profileId, action: "LIKE" \| "PASS" }`. Saves the swipe and returns `{ matchCreated, match }` |
| GET | `/matches` | The user's mutual matches, newest first |

`/swipe` returns `400` for a bad body, `404` for an unknown profile and `409` if the profile was already swiped on.

## How matching works

There is one logged-in user (`demo-user`), as the brief allows. Each seeded profile has a `likedYou` flag that stands in for "this person has already liked the user." A match is created only when the user likes a profile that has `likedYou = true`.

The swipe and the match are written in a single transaction, so a like can't be saved without its match. The `@@unique([userId, profileId])` constraint on `Swipe` means a profile can only be swiped once, even if two requests arrive at the same time (for example, a double tap). One of them gets a `409`.

## Privacy

The core promise is that a user never finds out who liked them unless it's mutual. Here is how the API keeps that promise:

- `likedYou` is never sent to the client. Every endpoint returns profiles through the same `publicProfileFields` select, which leaves it out.
- `/swipe` returns exactly the same response for a pass and for a one-sided like (`matchCreated: false, match: null`). Without this, a user could pass on someone and still learn from the response whether that person liked them. There's a test for this.
- `/feed` is ordered by creation time, not by whether someone liked you, so the order of cards doesn't give anything away either.
- Profile details only come back from `/swipe` when the like is mutual.

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
  src/server.js           starts the server
  src/routes/apiRoutes.js /feed, /swipe, /matches
  src/data/seed.js        30 mock profiles
  tests/api.test.js       API tests
```

## What I'd do next

- Real users and auth instead of one hardcoded user, with likes stored as swipes from both sides instead of the `likedYou` flag
- Paginate `/feed` instead of returning every profile at once
- An undo for the last pass
- Frontend tests for the swipe flow

## Author

Vidhi Vats · [GitHub](https://github.com/vidhi-vats-11) · [LinkedIn](https://www.linkedin.com/in/vidhivats-/)
