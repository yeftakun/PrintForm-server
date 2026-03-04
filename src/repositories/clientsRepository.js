const { useDb } = require("../config");
const { readClients, writeClients } = require("../storage/jsonStore");
const { query, withTransaction } = require("../db");

async function getClients() {
  if (!useDb) {
    return readClients();
  }
  const res = await query(
    "select id, name, printers, selected_printer, created_at, last_seen_at, status from clients order by created_at desc"
  );
  return res.rows.map(row => ({
    id: row.id,
    name: row.name,
    printers: row.printers || [],
    selectedPrinter: row.selected_printer || null,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    lastSeen: row.last_seen_at?.toISOString?.() || row.last_seen_at,
    status: row.status || "offline"
  }));
}

async function saveClients(clients) {
  if (!useDb) {
    return writeClients(clients);
  }
  const ids = clients.map(c => c.id);
  return withTransaction(async client => {
    if (ids.length > 0) {
      await client.query("DELETE FROM clients WHERE id <> ALL($1)", [ids]);
    } else {
      await client.query("DELETE FROM clients");
    }

    for (const c of clients) {
      await client.query(
        `INSERT INTO clients (id, name, printers, selected_printer, created_at, last_seen_at, status)
         VALUES ($1,$2,$3,$4,COALESCE($5, now()),$6,$7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           printers = EXCLUDED.printers,
           selected_printer = EXCLUDED.selected_printer,
           created_at = LEAST(clients.created_at, EXCLUDED.created_at),
           last_seen_at = EXCLUDED.last_seen_at,
           status = EXCLUDED.status`,
        [
          c.id,
          c.name,
          c.printers || [],
          c.selectedPrinter || null,
          c.createdAt ? new Date(c.createdAt) : null,
          c.lastSeen ? new Date(c.lastSeen) : new Date(),
          c.status || "offline"
        ]
      );
    }
  });
}

module.exports = {
  getClients,
  saveClients
};
