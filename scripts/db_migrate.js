const fs = require('fs');
const path = require('path');
const { query } = require('../src/db');
const { databaseUrl } = require('../src/config');

if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error("Please provide a migration file path.");
  process.exit(1);
}

const filePath = path.resolve(process.cwd(), migrationFile);
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const sql = fs.readFileSync(filePath, 'utf8');

console.log(`Applying migration: ${path.basename(filePath)}...`);

query(sql)
  .then(() => {
    console.log("Migration applied successfully.");
    process.exit(0);
  })
  .catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
