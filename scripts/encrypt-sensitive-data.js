const Database = require("better-sqlite3");
const { Client } = require("pg");
const path = require("path");
const {
  assertEncryptionKeyConfigured,
  decryptSensitiveData,
  emailLookup,
  encryptSensitiveData,
} = require("../src/lib/sensitive-data.js");

const BATCH_SIZE = 250;
const TABLES = [
  { name: "users", sqlite: { name: "name", email: "email" }, postgres: { name: "name", email: "email" }, lookup: true },
  { name: "orders", sqlite: { email: "email", firstName: "firstName", lastName: "lastName", address: "address", city: "city", zip: "zip", country: "country" }, postgres: { email: "email", firstName: "firstname", lastName: "lastname", address: "address", city: "city", zip: "zip", country: "country" } },
  { name: "design_orders", sqlite: { dimensions: "dimensions", notes: "notes", customerName: "customerName", email: "email", phone: "phone" }, postgres: { dimensions: "dimensions", notes: "notes", customerName: "customername", email: "email", phone: "phone" } },
  { name: "contacts", sqlite: { firstName: "firstName", lastName: "lastName", email: "email", message: "message" }, postgres: { firstName: "firstname", lastName: "lastname", email: "email", message: "message" } },
  { name: "subscribers", sqlite: { email: "email" }, postgres: { email: "email" }, lookup: true },
  { name: "admin_audit", sqlite: { adminEmail: "adminEmail" }, postgres: { adminEmail: "adminemail" } },
];

function encryptValue(value) {
  if (value === null || value === undefined) return value;
  return encryptSensitiveData(decryptSensitiveData(value));
}

function migrateSqlite() {
  const sqlitePath = process.env.SQLITE_DATABASE_PATH || path.join(process.cwd(), "prisma", "dev.db");
  const db = new Database(sqlitePath, { fileMustExist: true });

  try {
    for (const table of ["users", "subscribers"]) {
      const columns = db.prepare(`PRAGMA table_info(${table})`).all();
      if (!columns.some(column => column.name === "email_lookup")) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN email_lookup TEXT`);
      }
      db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS ${table}_email_lookup_unique ON ${table} (email_lookup)`);
    }

    const migrate = db.transaction(() => {
      for (const table of TABLES) {
        const fields = table.sqlite;
        const columns = Object.values(fields);
        const selectFirst = db.prepare(`SELECT id, ${columns.map(column => `"${column}"`).join(", ")} FROM "${table.name}" ORDER BY id LIMIT ?`);
        const selectAfter = db.prepare(`SELECT id, ${columns.map(column => `"${column}"`).join(", ")} FROM "${table.name}" WHERE id > ? ORDER BY id LIMIT ?`);
        const updateColumns = Object.entries(fields).map(([, column]) => `"${column}" = ?`);
        const hasLookup = Boolean(table.lookup);
        const update = db.prepare(
          `UPDATE "${table.name}" SET ${updateColumns.join(", ")}${hasLookup ? ', email_lookup = ?' : ""} WHERE id = ?`,
        );
        let count = 0;
        let cursor;
        while (true) {
          const rows = cursor === undefined
            ? selectFirst.all(BATCH_SIZE)
            : selectAfter.all(cursor, BATCH_SIZE);
          if (rows.length === 0) break;
          for (const row of rows) {
            const originalEmail = hasLookup ? decryptSensitiveData(row[fields.email]) : undefined;
            const values = Object.values(fields).map(column => encryptValue(row[column]));
            if (hasLookup) values.push(emailLookup(originalEmail, table.name));
            values.push(row.id);
            update.run(...values);
            cursor = row.id;
            count += 1;
          }
        }
        console.log(`Encrypted ${count} rows in ${table.name}.`);
      }
    });

    migrate();
  } finally {
    db.close();
  }
}

async function migratePostgres() {
  const connectionString = process.env.SUPABASE_MIGRATION_DATABASE_URL;
  if (!connectionString) {
    throw new Error("SUPABASE_MIGRATION_DATABASE_URL is required for PostgreSQL encryption backfills.");
  }
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: true } });
  await client.connect();
  try {
    await client.query("BEGIN");
    for (const table of TABLES) {
      const fields = table.postgres;
      const columns = Object.values(fields);
      let cursor;
      let count = 0;
      while (true) {
        const params = cursor === undefined ? [BATCH_SIZE] : [cursor, BATCH_SIZE];
        const where = cursor === undefined ? "" : "WHERE id > $1";
        const limitPlaceholder = cursor === undefined ? "$1" : "$2";
        const selected = await client.query(
          `SELECT id, ${columns.map(column => `"${column}"`).join(", ")} FROM public."${table.name}" ${where} ORDER BY id LIMIT ${limitPlaceholder}`,
          params,
        );
        if (selected.rows.length === 0) break;

        const assignments = Object.values(fields).map((column, index) => `"${column}" = $${index + 1}`);
        const hasLookup = Boolean(table.lookup);
        if (hasLookup) assignments.push(`email_lookup = $${assignments.length + 1}`);
        assignments.push(`id = id`);
        const update = `UPDATE public."${table.name}" SET ${assignments.slice(0, -1).join(", ")} WHERE id = $${assignments.length}`;
        for (const row of selected.rows) {
          const originalEmail = hasLookup ? decryptSensitiveData(row[fields.email]) : undefined;
          const values = Object.values(fields).map(column => encryptValue(row[column]));
          if (hasLookup) values.push(emailLookup(originalEmail, table.name));
          values.push(row.id);
          await client.query(update, values);
          cursor = row.id;
          count += 1;
        }
      }
      console.log(`Encrypted ${count} rows in ${table.name}.`);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  assertEncryptionKeyConfigured();
  if (process.env.DATABASE_URL) {
    await migratePostgres();
  } else {
    migrateSqlite();
  }
  console.log("Sensitive-data encryption backfill completed.");
}

main().catch(error => {
  console.error("Sensitive-data encryption failed:", error);
  process.exitCode = 1;
});
