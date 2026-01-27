import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from apps/api/.env
dotenv.config({ path: path.resolve('apps', 'api', '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.resolve('supabase', 'migrations');

async function migrate() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL is not defined in apps/api/.env');
        process.exit(1);
    }

    console.log('Connecting to database...');
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        await client.connect();
        console.log('Connected.');

        const files = fs.readdirSync(migrationsDir).sort();

        for (const file of files) {
            if (!file.endsWith('.sql')) continue;

            console.log(`Running migration: ${file}`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                await client.query(sql);
                console.log(`✓ Success: ${file}`);
            } catch (err) {
                // Ignore "relation already exists" errors to verify idempotency roughly
                if (err.code === '42P07') {
                    console.log(`- Skipped: ${file} (Table already exists)`);
                } else {
                    console.error(`X Error in ${file}:`, err.message);
                    throw err;
                }
            }
        }

        console.log('All migrations applied successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
