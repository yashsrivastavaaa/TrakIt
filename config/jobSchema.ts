import {
    date,
    json,
    numeric,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';

export const jobSchema = pgTable('jobs', {
    job_id: serial('job_id').primaryKey(),
    user_email: varchar('user_email', { length: 255 }).notNull(),
    company_name: varchar('company_name', { length: 255 }).notNull(),
    role: varchar('role', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).notNull(),
    date_applied: date('date_applied').notNull(),
    notes: text('notes'),
    ctc: numeric('ctc', { precision: 10, scale: 2 }), // Allows e.g. 12345678.90
    location: varchar('location', { length: 255 }),
    techstacks: json('techstacks'), // Will store array like ['React', 'Node.js']
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});
