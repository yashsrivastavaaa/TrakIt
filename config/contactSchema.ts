import {
    pgTable,
    serial,
    varchar
} from 'drizzle-orm/pg-core';

export const contactSchema = pgTable('contacts', {
    id: serial('id').primaryKey(),

    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone_number: varchar('phone_number', { length: 20 }),
    company: varchar('company', { length: 255 }),

    user_email: varchar('user_email', { length: 255 }),
});
