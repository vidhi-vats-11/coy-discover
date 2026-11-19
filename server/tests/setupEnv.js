// Use a separate db for tests so dev.db is not touched.
process.env.DATABASE_URL = "file:./test.db";
