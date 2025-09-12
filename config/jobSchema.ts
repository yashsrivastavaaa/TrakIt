import {
    date,
    integer,
    json,
    numeric,
    pgTable,
    serial,
    text,
    timestamp,
    varchar
} from 'drizzle-orm/pg-core';

export const jobSchema = pgTable('jobs', {
    job_id: serial('job_id').primaryKey(),
    user_email: varchar('user_email', { length: 255 }).notNull(),
    company_name: varchar('company_name', { length: 255 }).notNull(),
    role: varchar('role', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).notNull(),
    date_applied: date('date_applied').notNull(),
    notes: text('notes'),
    ctc: numeric('ctc', { precision: 10, scale: 2 }),
    location: varchar('location', { length: 255 }),
    techstacks: json('techstacks'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
    resume_link: text('resume_link'),
    bond_duration: integer('bond_duration'),
    bond_fine: numeric('bond_fine', { precision: 10, scale: 2 }),
    stipend: numeric('stipend', { precision: 10, scale: 2 }),
    intern_duration: integer('intern_duration'),
    application_deadline: date('application_deadline'),
    important_date: date('important_date'),
    tag: varchar('tag', { length: 100 }),
});
