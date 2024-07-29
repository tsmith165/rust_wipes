import { pgTable, integer, varchar, timestamp, text, serial, boolean } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

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

export const kitsTable = pgTable('kits', {
    id: serial('id').notNull().primaryKey(),
    o_id: integer('o_id').notNull(),
    p_id: integer('p_id').notNull().default(0),
    active: boolean('active').default(true),
    name: text('name').notNull(),
    price: integer('price'),
    permission_string: text('permission_string'),
    description: text('description'),
    image_path: text('image_path').notNull(),
    small_image_path: text('small_image_path').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    small_width: integer('small_width').notNull(),
    small_height: integer('small_height').notNull(),
});

export type Kits = InferSelectModel<typeof kitsTable>;
export type InsertKits = InferInsertModel<typeof kitsTable>;

export const kitExtraImagesTable = pgTable('KitExtraImages', {
    id: serial('id').notNull().primaryKey(),
    kit_id: integer('kit_id')
        .notNull()
        .references(() => kitsTable.id),
    title: text('title').default(''),
    image_path: text('image_path').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    small_image_path: text('small_image_path'),
    small_width: integer('small_width'),
    small_height: integer('small_height'),
});

export type KitExtraImages = InferSelectModel<typeof kitExtraImagesTable>;
export type InsertKitExtraImages = InferInsertModel<typeof kitExtraImagesTable>;

export type KitsWithExtraImages = Kits & {
    extraImages: KitExtraImages[];
};
