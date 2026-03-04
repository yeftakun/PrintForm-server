const { useDb } = require("../config");
const { readPings, writePings } = require("../storage/jsonStore");
const { query, withTransaction } = require("../db");

async function getPings() {
  if (!useDb) {
    return readPings();
  }
  const res = await query(
    "select client_id, payload from events where type = 'ping' order by created_at asc"
  );
  const map = {};
  for (const row of res.rows) {
    if (!map[row.client_id]) {
      map[row.client_id] = [];
    }
    map[row.client_id].push(row.payload);
  }
  return map;
}

async function savePings(pings) {
  if (!useDb) {
    return writePings(pings);
  }
  return withTransaction(async client => {
    await client.query("DELETE FROM events WHERE type = 'ping'");
    const entries = Object.entries(pings || {});
    for (const [clientId, items] of entries) {
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        await client.query(
          "INSERT INTO events (client_id, type, payload) VALUES ($1, 'ping', $2)",
          [clientId, item]
        );
      }
    }
  });
}

module.exports = {
  getPings,
  savePings
};
