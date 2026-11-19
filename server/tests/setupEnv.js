// Tests run against their own SQLite file so they never touch dev.db.
process.env.DATABASE_URL = "file:./test.db";
