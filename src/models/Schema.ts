import { relations } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the Next.js initialization process through `instrumentation.ts`.
// Simply restart your Next.js server to apply the database changes.
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://www.prisma.io/?via=nextjsboilerplate
// Tested and compatible with Next.js Boilerplate

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const usersSchema = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  theme: text('theme').notNull().default('light'),
  hoverSoundEnabled: text('hover_sound_enabled').notNull().default('true'),
  currency: text('currency').notNull().default('GBP'),
});

export const workSpacesSchema = pgTable('work_spaces', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const assetsSchema = pgTable('assets', {
  id: serial('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  userId: text('user_id').references(() => usersSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  color: text('color'),
  status: text('status'),
  type: text('type').notNull(),
  tabs: text('tabs').array().notNull().default(['overview']),
  // Conditional fields for vehicles
  subtype: text('subtype'), // car, motorcycle, van
  registrationNumber: text('registration_number'),
  // Conditional fields for properties
  address: text('address'),
  buyOrRent: text('buy_or_rent'), // buy, rent
  // JSON field for type-specific metadata (vehicle specs, maintenance, property info, etc.)
  metadata: jsonb('metadata'),
});

export const objectivesSchema = pgTable('objectives', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  assetId: integer('asset_id').references(() => assetsSchema.id),
  userId: text('user_id').references(() => usersSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  status: text('status').notNull().default('active'),
  priority: text('priority').notNull().default('medium'),
  startDate: timestamp('start_date', { mode: 'date' }),
  dueDate: timestamp('due_date', { mode: 'date' }),
});

export const todosSchema = pgTable('todos', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  objectiveId: integer('objective_id').references((): any => objectivesSchema.id),
  assetId: integer('asset_id').references((): any => assetsSchema.id),
  parentTaskId: integer('parent_task_id').references((): any => todosSchema.id),
  userId: text('user_id').references(() => usersSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate((): Date => new Date())
    .notNull(),
  status: text('status').notNull().default('todo'),
  dueDate: timestamp('due_date', { mode: 'date' }),
  assigneeId: text('assignee_id').references(() => usersSchema.id),
  priority: text('priority').notNull().default('medium'),
  sprintIds: integer('sprint_ids').array(),
});

export const sprintsSchema = pgTable('sprints', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  userId: text('user_id').references(() => usersSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  assetId: integer('asset_id').references(() => assetsSchema.id),
  workSpaceId: integer('work_space_id').references(() => workSpacesSchema.id),
  startDate: timestamp('start_date', { mode: 'date' }),
  endDate: timestamp('end_date', { mode: 'date' }),
  status: text('status').notNull().default('planned'),
});

export const calendarEventsSchema = pgTable('calendar_events', {
  id: serial('id').primaryKey(),
  assetId: integer('asset_id').references(() => assetsSchema.id).notNull(),
  userId: text('user_id').references(() => usersSchema.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  location: text('location'),
  color: text('color'),
  start: timestamp('start', { mode: 'date' }).notNull(),
  end: timestamp('end', { mode: 'date' }).notNull(),
  reminders: jsonb('reminders'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const financeEntriesSchema = pgTable('finance_entries', {
  id: serial('id').primaryKey(),
  assetId: integer('asset_id').references(() => assetsSchema.id).notNull(),
  userId: text('user_id').references(() => usersSchema.id).notNull(),
  name: text('name').notNull(),
  kind: text('kind').notNull(),
  flow: text('flow').notNull(),
  amountCents: integer('amount_cents').notNull(),
  category: text('category'),
  color: text('color'),
  manualAmounts: jsonb('manual_amounts'),
  attachments: jsonb('attachments'),
  financeAgreement: jsonb('finance_agreement'),
  insurance: jsonb('insurance'),
  gas: jsonb('gas'),
  repair: jsonb('repair'),
  tax: jsonb('tax'),
  service: jsonb('service'),
  mot: jsonb('mot'),
  other: jsonb('other'),
  effectiveDate: timestamp('effective_date', { mode: 'date' }),
  recurringFrequency: text('recurring_frequency'),
  recurringStart: timestamp('recurring_start', { mode: 'date' }),
  recurringEnd: timestamp('recurring_end', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const notificationsSchema = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => usersSchema.id).notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  metadata: jsonb('metadata'),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const assetActivitiesSchema = pgTable('asset_activities', {
  id: serial('id').primaryKey(),
  assetId: integer('asset_id').references(() => assetsSchema.id).notNull(),
  userId: text('user_id').references(() => usersSchema.id).notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: integer('entity_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const musicProjectsSchema = pgTable('music_projects', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => usersSchema.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  genre: text('genre'),
  color: text('color'),
  status: text('status').notNull().default('active'),
  coverImageUrl: text('cover_image_url'),
  metadata: jsonb('metadata'),
  linkedAssetId: integer('linked_asset_id').references(() => assetsSchema.id),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => [
  uniqueIndex('music_projects_user_slug_idx').on(table.userId, table.slug),
]);

export const albumsSchema = pgTable('albums', {
  id: serial('id').primaryKey(),
  musicProjectId: integer('music_project_id').references(() => musicProjectsSchema.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  releaseDate: timestamp('release_date', { mode: 'date' }),
  coverImageUrl: text('cover_image_url'),
  sortOrder: integer('sort_order').notNull().default(0),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const songsSchema = pgTable('songs', {
  id: serial('id').primaryKey(),
  musicProjectId: integer('music_project_id').references(() => musicProjectsSchema.id, { onDelete: 'cascade' }).notNull(),
  albumId: integer('album_id').references(() => albumsSchema.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  trackNumber: integer('track_number'),
  durationSeconds: integer('duration_seconds'),
  key: text('key'),
  bpm: integer('bpm'),
  lyrics: text('lyrics'),
  chordsOrTabs: text('chords_or_tabs'),
  metadata: jsonb('metadata'),
  status: text('status').notNull().default('idea'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Define relationships
export const userRelations = relations(usersSchema, ({ many }) => ({
  assets: many(assetsSchema),
  musicProjects: many(musicProjectsSchema),
  objectives: many(objectivesSchema),
  createdTodos: many(todosSchema, { relationName: 'createdTodos' }),
  assignedTodos: many(todosSchema, { relationName: 'assignedTodos' }),
  sprints: many(sprintsSchema),
  workSpaces: many(workSpacesSchema),
  calendarEvents: many(calendarEventsSchema),
  financeEntries: many(financeEntriesSchema),
  notifications: many(notificationsSchema),
  assetActivities: many(assetActivitiesSchema),
}));

export const workSpacesRelations = relations(workSpacesSchema, ({ many }) => ({
  users: many(usersSchema),
  assets: many(assetsSchema),
  sprints: many(sprintsSchema),
}));

export const assetsRelations = relations(assetsSchema, ({ many, one }) => ({
  objectives: many(objectivesSchema),
  todos: many(todosSchema),
  sprints: many(sprintsSchema),
  calendarEvents: many(calendarEventsSchema),
  financeEntries: many(financeEntriesSchema),
  assetActivities: many(assetActivitiesSchema),
  linkedMusicProjects: many(musicProjectsSchema),
  user: one(usersSchema, {
    fields: [assetsSchema.userId],
    references: [usersSchema.id],
  }),
}));

export const objectivesRelations = relations(objectivesSchema, ({ one, many }) => ({
  asset: one(assetsSchema, {
    fields: [objectivesSchema.assetId],
    references: [assetsSchema.id],
  }),
  user: one(usersSchema, {
    fields: [objectivesSchema.userId],
    references: [usersSchema.id],
  }),
  todos: many(todosSchema),
}));

export const todosRelations = relations(todosSchema, ({ one, many }) => ({
  objective: one(objectivesSchema, {
    fields: [todosSchema.objectiveId],
    references: [objectivesSchema.id],
  }),
  asset: one(assetsSchema, {
    fields: [todosSchema.assetId],
    references: [assetsSchema.id],
  }),
  user: one(usersSchema, {
    fields: [todosSchema.userId],
    references: [usersSchema.id],
    relationName: 'createdTodos',
  }),
  assignee: one(usersSchema, {
    fields: [todosSchema.assigneeId],
    references: [usersSchema.id],
    relationName: 'assignedTodos',
  }),
  parentTodo: one(todosSchema, {
    fields: [todosSchema.parentTaskId],
    references: [todosSchema.id],
    relationName: 'subtodos',
  }),
  subtodos: many(todosSchema, {
    relationName: 'subtodos',
  }),
  sprints: many(sprintsSchema),
}));

export const sprintsRelations = relations(sprintsSchema, ({ many, one }) => ({
  todos: many(todosSchema),
  workSpace: one(workSpacesSchema, {
    fields: [sprintsSchema.workSpaceId],
    references: [workSpacesSchema.id],
  }),
  asset: one(assetsSchema, {
    fields: [sprintsSchema.assetId],
    references: [assetsSchema.id],
  }),
  user: one(usersSchema, {
    fields: [sprintsSchema.userId],
    references: [usersSchema.id],
  }),
}));

export const calendarEventsRelations = relations(calendarEventsSchema, ({ one }) => ({
  asset: one(assetsSchema, {
    fields: [calendarEventsSchema.assetId],
    references: [assetsSchema.id],
  }),
  user: one(usersSchema, {
    fields: [calendarEventsSchema.userId],
    references: [usersSchema.id],
  }),
}));

export const financeEntriesRelations = relations(financeEntriesSchema, ({ one }) => ({
  asset: one(assetsSchema, {
    fields: [financeEntriesSchema.assetId],
    references: [assetsSchema.id],
  }),
  user: one(usersSchema, {
    fields: [financeEntriesSchema.userId],
    references: [usersSchema.id],
  }),
}));

export const notificationsRelations = relations(notificationsSchema, ({ one }) => ({
  user: one(usersSchema, {
    fields: [notificationsSchema.userId],
    references: [usersSchema.id],
  }),
}));

export const assetActivitiesRelations = relations(assetActivitiesSchema, ({ one }) => ({
  asset: one(assetsSchema, {
    fields: [assetActivitiesSchema.assetId],
    references: [assetsSchema.id],
  }),
  user: one(usersSchema, {
    fields: [assetActivitiesSchema.userId],
    references: [usersSchema.id],
  }),
}));

export const musicProjectsRelations = relations(musicProjectsSchema, ({ one, many }) => ({
  user: one(usersSchema, {
    fields: [musicProjectsSchema.userId],
    references: [usersSchema.id],
  }),
  linkedAsset: one(assetsSchema, {
    fields: [musicProjectsSchema.linkedAssetId],
    references: [assetsSchema.id],
  }),
  albums: many(albumsSchema),
  songs: many(songsSchema),
}));

export const albumsRelations = relations(albumsSchema, ({ one, many }) => ({
  musicProject: one(musicProjectsSchema, {
    fields: [albumsSchema.musicProjectId],
    references: [musicProjectsSchema.id],
  }),
  songs: many(songsSchema),
}));

export const songsRelations = relations(songsSchema, ({ one }) => ({
  musicProject: one(musicProjectsSchema, {
    fields: [songsSchema.musicProjectId],
    references: [musicProjectsSchema.id],
  }),
  album: one(albumsSchema, {
    fields: [songsSchema.albumId],
    references: [albumsSchema.id],
  }),
}));
