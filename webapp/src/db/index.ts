import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema/media';

const dbPath = process.env.DATABASE_URL || './sqlite.db';

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

export default db;