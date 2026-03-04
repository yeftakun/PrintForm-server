const { Pool } = require("pg");
const { databaseUrl } = require("./config");

let pool = null;

function getPool() {
  if (!pool) {
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required when USE_DB=true");
    }
    pool = new Pool({ connectionString: databaseUrl });
  }
  return pool;
}

async function query(text, params) {
  const client = getPool();
  return client.query(text, params);
}

async function withTransaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  withTransaction
};
