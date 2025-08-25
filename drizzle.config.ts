import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    out: './drizzle',
    schema: './config/jobs.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.EXPO_PUBLIC_DB_API!,
    },
});