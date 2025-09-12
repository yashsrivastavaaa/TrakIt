import { pgTable, text, varchar } from "drizzle-orm/pg-core";

export const pendingSchema = pgTable('pending', {
    email: varchar('email', { length: 255 }).primaryKey(),
    password: text('password').notNull(),
    name: varchar('name', { length: 255 }),
});
