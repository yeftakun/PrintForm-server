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
    for (const c of clients) {
      const printersJson = JSON.stringify(c.printers || []);
      await client.query(
        `INSERT INTO clients (id, name, printers, selected_printer, created_at, last_seen_at, status)
         VALUES ($1,$2,$3::jsonb,$4,COALESCE($5, now()),$6,$7)
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
          printersJson,
          c.selectedPrinter || null,
          c.createdAt ? new Date(c.createdAt) : null,
          c.lastSeen ? new Date(c.lastSeen) : new Date(),
          c.status || "offline"
        ]
      );
    }
  });
}

async function updateClientStatuses(statusById = {}) {
  const entries = Object.entries(statusById || {}).filter(([id, status]) => {
    const normalizedId = String(id || "").trim();
    const normalizedStatus = String(status || "").trim().toLowerCase();
    return normalizedId.length > 0 && (normalizedStatus === "online" || normalizedStatus === "offline");
  });

  if (entries.length === 0) {
    return 0;
  }

  if (!useDb) {
    const clients = await readClients();
    let changed = 0;
    for (const client of clients) {
      const nextStatus = statusById[client.id];
      if (!nextStatus) {
        continue;
      }
      if (client.status !== nextStatus) {
        client.status = nextStatus;
        changed += 1;
      }
    }

    if (changed > 0) {
      await writeClients(clients);
    }
    return changed;
  }

  await withTransaction(async client => {
    for (const [id, status] of entries) {
      await client.query(
        "UPDATE clients SET status = $2 WHERE id = $1",
        [id, status]
      );
    }
  });

  return entries.length;
}

async function deleteClientsByIds(ids = []) {
  if (!useDb) {
    return 0; // handled in caller for JSON mode
  }
  if (!ids || ids.length === 0) {
    return 0;
  }
  const res = await query("DELETE FROM clients WHERE id = ANY($1)", [ids]);
  return res.rowCount || 0;
}

module.exports = {
  getClients,
  saveClients,
  deleteClientsByIds,
  updateClientStatuses
};
