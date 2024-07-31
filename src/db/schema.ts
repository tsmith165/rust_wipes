import { pgTable, integer, varchar, timestamp, text, serial, boolean, jsonb, date, decimal } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

const DEFAULT_CONTENTS = {
    guns: {
        AK: 1,
    },
    armor: {
        'HQM Facemask': 1,
    },
    resources: {
        Scrap: 1000,
    },
    components: {
        'Rifle Body': 1,
    },
    medical: {
        'Medical Syringe': 12,
    },
};

export const rw_parsed_server = pgTable('rw_parsed_server', {
    id: serial('id').primaryKey(),
    timestamp: timestamp('timestamp').defaultNow(),
    rank: integer('rank'),
    ip: varchar('ip'),
    title: varchar('title'),
    region: varchar('region'),
    players: integer('players'),
    wipe_schedule: varchar('wipe_schedule'),
    game_mode: varchar('game_mode'),
    resource_rate: varchar('resource_rate'),
    group_limit: varchar('group_limit'),
    last_wipe: varchar('last_wipe'),
    last_bp_wipe: varchar('last_bp_wipe'),
    next_wipe: varchar('next_wipe'),
    next_wipe_full: varchar('next_wipe_full'),
    next_wipe_is_bp: varchar('next_wipe_is_bp'),
    next_wipe_hour: integer('next_wipe_hour'),
    next_wipe_dow: integer('next_wipe_dow'),
    next_wipe_week: integer('next_wipe_week'),
    main_wipe_hour: integer('main_wipe_hour'),
    main_wipe_dow: integer('main_wipe_dow'),
    sec_wipe_hour: integer('sec_wipe_hour'),
    sec_wipe_dow: integer('sec_wipe_dow'),
    bp_wipe_hour: integer('bp_wipe_hour'),
    bp_wipe_dow: integer('bp_wipe_dow'),
});

export type ParsedServer = InferSelectModel<typeof rw_parsed_server>;
export type InsertParsedServer = InferInsertModel<typeof rw_parsed_server>;

export const rw_wipe_history = pgTable('rw_wipe_history', {
    id: serial('id').primaryKey(),
    bm_id: integer('bm_id'),
    timestamp: timestamp('timestamp').defaultNow(),
    wipe_time: varchar('wipe_time'),
    is_bp: varchar('is_bp'),
    title: varchar('title'),
    description: text('description'),
    attributes: text('attributes'),
});

export type WipeHistory = InferSelectModel<typeof rw_wipe_history>;
export type InsertWipeHistory = InferInsertModel<typeof rw_wipe_history>;

export const rw_scrapper_stats = pgTable('rw_scrapper_stats', {
    id: serial('id').primaryKey(),
    date: timestamp('date').defaultNow(),
    scrapper_duration: integer('scrapper_duration'),
    servers_parsed: integer('servers_parsed'),
    servers_skipped: integer('servers_skipped'),
    servers_posted: integer('servers_posted'),
});

export type ScrapperStats = InferSelectModel<typeof rw_scrapper_stats>;
export type InsertScrapperStats = InferInsertModel<typeof rw_scrapper_stats>;

export const rw_server_network = pgTable('rw_server_network', {
    id: serial('id').primaryKey(),
    bm_ids: varchar('bm_ids'),
    name: varchar('name'),
    region: varchar('region'),
});

export type ServerNetwork = InferSelectModel<typeof rw_server_network>;
export type InsertServerNetwork = InferInsertModel<typeof rw_server_network>;

export const kits = pgTable('kits', {
    id: serial('id').notNull().primaryKey(),
    o_id: integer('o_id').notNull(),
    p_id: integer('p_id').notNull().default(0),
    active: boolean('active').default(true),
    name: text('name').notNull(),
    full_name: text('full_name'),
    price: decimal('price'),
    permission_string: text('permission_string'),
    description: text('description'),
    image_path: text('image_path').notNull(),
    small_image_path: text('small_image_path').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    small_width: integer('small_width').notNull(),
    small_height: integer('small_height').notNull(),
    contents: jsonb('contents').default(DEFAULT_CONTENTS),
    type: varchar('type').notNull().default('monthly'),
});

export type Kits = InferSelectModel<typeof kits>;
export type InsertKits = InferInsertModel<typeof kits>;

export const KitExtraImages = pgTable('KitExtraImages', {
    id: serial('id').notNull().primaryKey(),
    kit_id: integer('kit_id')
        .notNull()
        .references(() => kits.id),
    title: text('title').default(''),
    image_path: text('image_path').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    small_image_path: text('small_image_path'),
    small_width: integer('small_width'),
    small_height: integer('small_height'),
});

export type KitExtraImagesType = InferSelectModel<typeof KitExtraImages>;
export type InsertKitExtraImagesType = InferInsertModel<typeof KitExtraImages>;

export type KitsWithExtraImages = Kits & {
    extraImages: KitExtraImagesType[];
};

export const users = pgTable('users', {
    id: serial('id').notNull().primaryKey(),
    steam_id: varchar('steam_id').notNull().unique(),
    steam_user: varchar('steam_user').notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});

export type Users = InferSelectModel<typeof users>;
export type InsertUsers = InferInsertModel<typeof users>;

export const pending_transactions_table = pgTable('pending_transactions', {
    id: serial('id').notNull().primaryKey(),
    kit_db_id: integer('kit_db_id')
        .notNull()
        .references(() => kits.id),
    kit_name: text('kit_name').notNull(),
    user_id: integer('user_id')
        .notNull()
        .references(() => users.id),
    timestamp: timestamp('timestamp').defaultNow(),
});

export type PendingTransactions = InferSelectModel<typeof pending_transactions_table>;
export type InsertPendingTransactions = InferInsertModel<typeof pending_transactions_table>;

export const verified_transactions_table = pgTable('verified_transactions', {
    id: serial('id').notNull().primaryKey(),
    kit_db_id: integer('kit_db_id')
        .notNull()
        .references(() => kits.id),
    kit_name: text('kit_name').notNull(),
    user_id: integer('user_id')
        .notNull()
        .references(() => users.id),
    image_path: text('image_path').notNull(),
    image_width: integer('image_width').notNull(),
    image_height: integer('image_height').notNull(),
    date: date('date').notNull(),
    stripe_id: text('stripe_id').notNull(),
    price: integer('price').notNull(),
    timestamp: timestamp('timestamp').defaultNow(),
});

export type VerifiedTransactions = InferSelectModel<typeof verified_transactions_table>;
export type InsertVerifiedTransactions = InferInsertModel<typeof verified_transactions_table>;

export const rw_servers = pgTable('rw_servers', {
    id: serial('id').primaryKey(),
    o_id: integer('o_id').notNull(),
    name: varchar('name').notNull(),
    short_title: varchar('short_title'),
    rate: varchar('rate').notNull(),
    group_size: integer('group_size'),
    wipe_days: varchar('wipe_days').notNull(),
    wipe_time: integer('wipe_time').default(11),
    connection_url: varchar('connection_url').notNull(),
});

export type RwServer = InferSelectModel<typeof rw_servers>;
export type InsertRwServer = InferInsertModel<typeof rw_servers>;
