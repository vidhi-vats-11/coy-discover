# Coy Discover

A swipe based "Discover" tab for Coy. I made this for the Coy SDE intern assignment. It has a blank Home tab, a Discover tab and a Matches tab.

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
npm run seed      # 30 profiles, 9 of them have already liked you
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

Tests use a separate `prisma/test.db`, so dev data is not changed.

To reset the data, run `npm run seed` again. It deletes all swipes and matches.

## API

| Method | Path | What it does |
|---|---|---|
| GET | `/feed` | Profiles the user hasn't swiped on yet |
| POST | `/swipe` | Body: `{ profileId, action: "LIKE" \| "PASS" }`. Saves the swipe and returns `{ matchCreated, match }` |
| GET | `/matches` | The user's mutual matches, newest first |

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
  src/server.js           starts the server
  src/routes/apiRoutes.js /feed, /swipe, /matches
  src/data/seed.js        30 mock profiles
  tests/api.test.js       API tests
```

## What I'd do next

- Real users and login instead of one fixed user. Then likes from both sides can be saved as swipes, and `likedYou` is not needed
- Pagination in `/feed` instead of sending all profiles at once
- Undo button for last pass
- Frontend tests for swipe

## Author

Vidhi Vats · [GitHub](https://github.com/vidhi-vats-11) · [LinkedIn](https://www.linkedin.com/in/vidhivats-/)
