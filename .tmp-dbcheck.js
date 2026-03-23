const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const db = await c.query('select current_database() as db, current_schema() as schema');
  console.log('dbctx', db.rows[0]);
  const q = "select column_name, data_type, is_nullable from information_schema.columns where table_schema = 'public' and table_name = 'sessions' order by ordinal_position";
  const r = await c.query(q);
  console.table(r.rows);
  await c.end();
})().catch((e) => { console.error(e); process.exit(1); });
