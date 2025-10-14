import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema/media';

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/db';
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

export default db;