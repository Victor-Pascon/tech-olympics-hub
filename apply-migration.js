import { Client } from 'pg';

const DB_PASSWORD = 'sb_secret_sAzs6q_ncsJbmN4GCq8Xag_GQJVRl82';
const PROJECT_REF = 'zinlfatzabxwnzpyqwwh';
const DB_HOST = `aws-0-us-west-1.pooler.supabase.com`; // Let's try aws-0-sa-east-1.pooler.supabase.com if us-west-1 fails since the user is in Brazil. Or direct `db.${PROJECT_REF}.supabase.co`

async function run() {
  const hosts = [
    `aws-0-sa-east-1.pooler.supabase.com`,
    `db.${PROJECT_REF}.supabase.co`
  ];
  
  for (const host of hosts) {
    console.log(`Trying ${host}...`);
    const client = new Client({
      user: 'postgres',
      password: DB_PASSWORD,
      host: host,
      port: 5432,
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log(`Connected to ${host}! Running migration...`);
      
      const fs = await import('fs');
      const sql = fs.readFileSync('./supabase/migrations/20260320_create_olympiad_enrollments.sql', 'utf8');
      
      await client.query(sql);
      console.log('Migration applied successfully.');
      
      await client.end();
      return;
    } catch (err) {
      console.error(`Failed to connect to ${host}:`, err.message);
    }
  }
}

run();
