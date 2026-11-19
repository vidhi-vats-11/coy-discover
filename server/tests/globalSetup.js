const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = () => {
  const dbFile = path.join(__dirname, "..", "prisma", "test.db");
  fs.rmSync(dbFile, { force: true });

  execSync("npx prisma migrate deploy", {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "ignore",
  });
};
