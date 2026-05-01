import { readFileSync } from "fs";
import { Client } from "pg";

const PASSWORD_MARKER = "DB_PASSWORD = '";
const APPLY_MIGRATION_SRC = readFileSync("apply-migration.js", "utf-8");
const pwdStart = APPLY_MIGRATION_SRC.indexOf(PASSWORD_MARKER);
const pwdEnd = APPLY_MIGRATION_SRC.indexOf("'", pwdStart + PASSWORD_MARKER.length);
const DB_PASSWORD = APPLY_MIGRATION_SRC.slice(pwdStart + PASSWORD_MARKER.length, pwdEnd);

const USER = "postgres";
const DB = "postgres";

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error("Uso: node run-migration.js <caminho-da-migration.sql>");
  process.exit(1);
}

const PROJECT_REF = "zinlfatzabxwnzpyqwwh";
const hosts = [
  { host: "aws-0-sa-east-1.pooler.supabase.com", user: USER + "." + PROJECT_REF, port: 6543 },
  { host: "aws-0-us-west-1.pooler.supabase.com", user: USER + "." + PROJECT_REF, port: 6543 },
  { host: "aws-0-sa-east-1.pooler.supabase.com", user: USER + "." + PROJECT_REF, port: 5432 },
];

async function run() {
  const sql = readFileSync(migrationFile, "utf-8");

  const downIdx = sql.indexOf("\n-- DOWN");
  const upIdx = sql.indexOf("\n-- UP\n");
  if (upIdx === -1) {
    console.error("Migration sem bloco -- UP encontrado.");
    process.exit(1);
  }
  const upSql = (downIdx === -1 ? sql.slice(upIdx) : sql.slice(upIdx, downIdx))
    .replace(/^-- UP\s*\n*/i, "")
    .trim();

  console.log("Migration: " + migrationFile);
  console.log("Tamanho do SQL UP: " + upSql.length + " caracteres");
  console.log("--- INÍCIO DO SQL ---");
  console.log(upSql.substring(0, 300) + "...");
  console.log("--- FIM DO SQL ---");

  for (const host of hosts) {
    console.log("\nConectando a " + host.host + " como " + host.user + "...");
    const client = new Client({
      user: host.user,
      password: DB_PASSWORD,
      host: host.host,
      port: host.port,
      database: DB,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    try {
      await client.connect();
      console.log("Conectado! Executando migration...");

      await client.query("BEGIN");
      await client.query(upSql);
      await client.query("COMMIT");

      console.log("Migration aplicada com sucesso!");
      await client.end();
      return;
    } catch (err) {
      await client.query("ROLLBACK").catch(function() {});
      console.error("Falha em " + host.host + ": " + err.message);
      await client.end().catch(function() {});
    }
  }

  console.error("\nNão foi possível conectar a nenhum host.");
  process.exit(1);
}

run();
