import { integer, json, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const userSchema = pgTable('users', {
    email: varchar('email', { length: 255 }).primaryKey(),
    password: text('password').notNull(),
    name: varchar('name', { length: 255 }),
    jobTitle: varchar('job_title', { length: 255 }),
    location: varchar('location', { length: 255 }),
    experience: integer('experience'),
    skills: json('skills'),
});
