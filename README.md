# Coy Discover ❤️

Coy Discover is a simple profile discovery and matching application where users can explore profiles, like or pass, and connect through mutual likes.

## Features
- Discover one profile at a time.
- Like or pass using buttons or swipe gestures.
- Matches are created only when both users like each other.
- One-sided likes remain private.
- View mutual matches.
- Swipes and matches are saved in the database.
- Responsive design for desktop and mobile.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** SQLite with Prisma ORM

## Run Locally

**Backend**
```bash
cd server
npm install
```

Create a `.env` file inside `server`:
```env
DATABASE_URL="file:./dev.db"
```

Then run:
```bash
npx prisma migrate deploy
npm run seed
npm run dev
```

**Frontend** (open another terminal):
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/feed` | Get available profiles |
| POST | `/swipe` | Save like or pass |
| GET | `/matches` | Get mutual matches |

## Author

**Vidhi Vats**

[GitHub](https://github.com/vidhi-vats-11) · [LinkedIn](https://www.linkedin.com/in/vidhivats-/)
