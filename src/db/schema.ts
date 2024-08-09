import { pgTable, integer, varchar, timestamp, text, serial, boolean, jsonb, date, decimal, unique } from 'drizzle-orm/pg-core';

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
    email: varchar('email'),
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
    email: varchar('email').notNull(),
    is_subscription: boolean('is_subscription').notNull().default(false),
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
    steam_id: varchar('steam_id'),
    email: varchar('email').notNull(),
    is_subscription: boolean('is_subscription').notNull().default(false),
    subscription_id: text('subscription_id'),
    image_path: text('image_path').notNull(),
    image_width: integer('image_width').notNull(),
    image_height: integer('image_height').notNull(),
    date: date('date').notNull(),
    end_date: timestamp('end_date'),
    stripe_id: text('stripe_id').notNull(),
    price: integer('price').notNull(),
    timestamp: timestamp('timestamp').defaultNow(),
    redeemed: boolean('redeemed').notNull().default(false),
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

export const player_stats = pgTable(
    'player_stats',
    {
        id: serial('id').primaryKey(),
        steam_id: varchar('steam_id').notNull(),
        server_id: varchar('server_id').notNull().default(''),
        kills: integer('kills').notNull().default(0),
        deaths: integer('deaths').notNull().default(0),
        stone_gathered: integer('stone_gathered').notNull().default(0),
        wood_gathered: integer('wood_gathered').notNull().default(0),
        metal_ore_gathered: integer('metal_ore_gathered').notNull().default(0),
        scrap_wagered: integer('scrap_wagered').notNull().default(0),
        scrap_won: integer('scrap_won').notNull().default(0),
        last_updated: timestamp('last_updated').defaultNow(),
    },
    (table: any) => {
        return {
            unique_player_server: unique('unique_player_server').on(table.steam_id, table.server_id),
        };
    },
);

export type PlayerStats = InferSelectModel<typeof player_stats>;
export type InsertPlayerStats = InferInsertModel<typeof player_stats>;

export const server_performance = pgTable('server_performance', {
    id: serial('id').primaryKey(),
    system_id: varchar('system_id', { length: 64 }).notNull(),
    server_name: varchar('server_name', { length: 255 }).notNull().default('NEW SERVER'),
    timestamp: timestamp('timestamp').defaultNow(),
    cpu_usage: decimal('cpu_usage', { precision: 5, scale: 2 }).notNull(),
    memory_usage: decimal('memory_usage', { precision: 5, scale: 2 }).notNull(),
    disk_usage: decimal('disk_usage', { precision: 5, scale: 2 }).notNull(),
    network_in: decimal('network_in', { precision: 10, scale: 2 }).notNull(),
    network_out: decimal('network_out', { precision: 10, scale: 2 }).notNull(),
});

export type ServerPerformance = InferSelectModel<typeof server_performance>;
export type InsertServerPerformance = InferInsertModel<typeof server_performance>;

export const next_wipe_info = pgTable('next_wipe_info', {
    id: serial('id').primaryKey(),
    server_id: varchar('server_id').notNull(),
    level_url: text('level_url').notNull(),
    map_seed: integer('map_seed'),
    map_size: integer('map_size'),
    map_name: varchar('map_name'),
    is_queued: boolean('is_queued').notNull().default(false),
});

export type NextWipeInfo = InferSelectModel<typeof next_wipe_info>;
export type InsertNextWipeInfo = InferInsertModel<typeof next_wipe_info>;

export const map_options = pgTable('map_options', {
    id: serial('id').primaryKey(),
    map_name: varchar('map_name').notNull(),
    seed: integer('seed').notNull(),
    size: integer('size').notNull(),
    level_url: text('level_url').notNull(),
    rust_maps_url: text('rust_maps_url').notNull(),
    rust_maps_image: text('rust_maps_image').notNull().default(''),
    enabled: boolean('enabled').notNull().default(true),
});

export type MapOptions = InferSelectModel<typeof map_options>;
export type InsertMapOptions = InferInsertModel<typeof map_options>;

export const map_votes = pgTable('map_votes', {
    id: serial('id').primaryKey(),
    map_id: integer('map_id')
        .notNull()
        .references(() => map_options.id),
    timestamp: timestamp('timestamp').defaultNow(),
    steam_id: varchar('steam_id').notNull(),
    wipe_id: integer('wipe_id').notNull(),
    server_id: varchar('server_id').notNull(),
});

export type MapVotes = InferSelectModel<typeof map_votes>;
export type InsertMapVotes = InferInsertModel<typeof map_votes>;

export const server_backend_info = pgTable('server_backend_info', {
    id: serial('id').primaryKey(),
    server_id: varchar('server_id').notNull().unique(),
    server_folder: varchar('server_folder').notNull(),
});

export type ServerBackendInfo = InferSelectModel<typeof server_backend_info>;
export type InsertServerBackendInfo = InferInsertModel<typeof server_backend_info>;
