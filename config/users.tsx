import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as users from './userSchema';

const dbApi = process.env.EXPO_PUBLIC_DB_API;
if (!dbApi) {
    throw new Error('EXPO_PUBLIC_DB_API environment variable is not set');
}

const sql = neon(dbApi);

export const user = drizzle(sql, { schema: users });
