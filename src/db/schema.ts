import { pgTable, integer, varchar, timestamp, text, serial, boolean, jsonb, numeric, date } from 'drizzle-orm/pg-core';
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
    last_wipe: timestamp('last_wipe').defaultNow(),
    next_wipe: timestamp('next_wipe'),
    next_full_wipe: timestamp('next_full_wipe'),
});

export type ParsedServer = InferSelectModel<typeof rw_parsed_server>;
export type InsertParsedServer = InferInsertModel<typeof rw_parsed_server>;

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
    price: numeric('price'),
    permission_string: text('permission_string'),
    description: text('description'),
    image_path: text('image_path').notNull(),
    small_image_path: text('small_image_path').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    small_width: integer('small_width').notNull(),
    small_height: integer('small_height').notNull(),
    contents: jsonb('contents'),
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

export const player_stats = pgTable('player_stats', {
    id: serial('id').primaryKey(),
    steam_id: varchar('steam_id').notNull(),
    server_id: varchar('server_id').notNull(),
    kills: integer('kills').notNull().default(0),
    deaths: integer('deaths').notNull().default(0),
    stone_gathered: integer('stone_gathered').notNull().default(0),
    wood_gathered: integer('wood_gathered').notNull().default(0),
    metal_ore_gathered: integer('metal_ore_gathered').notNull().default(0),
    sulfur_ore_gathered: integer('sulfur_ore_gathered').notNull().default(0),
    scrap_wagered: integer('scrap_wagered').notNull().default(0),
    scrap_won: integer('scrap_won').notNull().default(0),
    last_updated: timestamp('last_updated').defaultNow(),
});

export type PlayerStats = InferSelectModel<typeof player_stats>;
export type InsertPlayerStats = InferInsertModel<typeof player_stats>;

export const server_performance = pgTable('server_performance', {
    id: serial('id').primaryKey(),
    system_id: varchar('system_id', { length: 64 }).notNull(),
    server_name: varchar('server_name', { length: 255 }).notNull().default('NEW SERVER'),
    timestamp: timestamp('timestamp').defaultNow(),
    cpu_usage: numeric('cpu_usage', { precision: 5, scale: 2 }).notNull(),
    memory_usage: numeric('memory_usage', { precision: 5, scale: 2 }).notNull(),
    disk_usage: numeric('disk_usage', { precision: 5, scale: 2 }).notNull(),
    network_in: numeric('network_in', { precision: 10, scale: 2 }).notNull(),
    network_out: numeric('network_out', { precision: 10, scale: 2 }).notNull(),
});

export type ServerPerformance = InferSelectModel<typeof server_performance>;
export type InsertServerPerformance = InferInsertModel<typeof server_performance>;

export const rw_servers = pgTable('rw_servers', {
    id: serial('id').primaryKey(),
    o_id: integer('o_id').notNull(),
    server_id: integer('server_id').notNull().default(0),
    name: varchar('name').notNull(),
    short_title: varchar('short_title'),
    rate: varchar('rate').notNull(),
    group_size: integer('group_size'),
    wipe_days: varchar('wipe_days').notNull(),
    wipe_time: varchar('wipe_time').default('1100'),
    bp_wipe_time: varchar('bp_wipe_time').default('1400'),
    restart_time: varchar('restart_time').default('0400'),
    connection_url: varchar('connection_url').notNull(),
});

export type RwServer = InferSelectModel<typeof rw_servers>;
export type InsertRwServer = InferInsertModel<typeof rw_servers>;

export const next_wipe_info = pgTable('next_wipe_info', {
    id: serial('id').primaryKey(),
    bm_id: varchar('bm_id'),
    server_id: varchar('server_id').notNull(),
    server_name: varchar('server_name'),
    server_uuid: varchar('server_uuid'),
    rcon_port: integer('rcon_port'),
    rcon_password: text('rcon_password'),
    rcon_ip: varchar('rcon_ip'),
    last_restart: timestamp('last_restart'),
    last_wipe: timestamp('last_wipe'),
    is_queued: boolean('is_queued').notNull().default(false),
    level_url: text('level_url').notNull(),
    map_seed: integer('map_seed'),
    map_size: integer('map_size'),
    map_name: varchar('map_name'),
    installed_plugins: jsonb('installed_plugins'),
    plugins_updated_at: timestamp('plugins_updated_at'),
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

export const user_playtime = pgTable('user_playtime', {
    id: serial('id').primaryKey(),
    steam_id: varchar('steam_id').notNull().unique(),
    credits: integer('credits').notNull().default(0),
    player_name: varchar('player_name'),
    minutes_played: integer('minutes_played').default(0),
    auth_code: varchar('auth_code', { length: 6 }),
    profile_picture_url: text('profile_picture_url'),
});

export type UserPlaytime = InferSelectModel<typeof user_playtime>;
export type InsertUserPlaytime = InferInsertModel<typeof user_playtime>;

export const wheel_spins = pgTable('wheel_spins', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id')
        .notNull()
        .references(() => user_playtime.id),
    result: varchar('result').notNull(),
    in_game_item_name: varchar('in_game_item_name').notNull(),
    timestamp: timestamp('timestamp').defaultNow(),
    redeemed: boolean('redeemed').notNull().default(false),
});

export type WheelSpins = InferSelectModel<typeof wheel_spins>;
export type InsertWheelSpins = InferInsertModel<typeof wheel_spins>;

export const slot_machine_spins = pgTable('slot_machine_spins', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id')
        .notNull()
        .references(() => user_playtime.id),
    result: jsonb('result').notNull(),
    payout: jsonb('payout').notNull(),
    free_spins_won: integer('free_spins_won').notNull().default(0),
    free_spins_used: integer('free_spins_used').notNull().default(0),
    redeemed: boolean('redeemed').notNull().default(false),
    payout_redeemed: jsonb('payout_redeemed').notNull().default('{}'),
    timestamp: timestamp('timestamp').defaultNow(),
});

export type SlotMachineSpins = InferSelectModel<typeof slot_machine_spins>;
export type InsertSlotMachineSpins = InferInsertModel<typeof slot_machine_spins>;

export const bonus_spins = pgTable('bonus_spins', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id')
        .notNull()
        .references(() => user_playtime.id),
    spins_remaining: integer('spins_remaining').notNull().default(0),
    bonus_type: varchar('bonus_type').notNull().default('normal'),
    sticky_multipliers: jsonb('sticky_multipliers').notNull().default('[]'),
    last_updated: timestamp('last_updated').defaultNow(),
    pending_bonus: boolean('pending_bonus').notNull().default(false),
    pending_bonus_amount: integer('pending_bonus_amount').notNull().default(0),
    total_win: jsonb('total_win').notNull().default('[]'),
    in_progress: boolean('in_progress').notNull().default(false),
});

export type BonusSpins = InferSelectModel<typeof bonus_spins>;
export type InsertBonusSpins = InferInsertModel<typeof bonus_spins>;

export const referrals = pgTable('referrals', {
    id: serial('id').primaryKey(),
    steam_id: varchar('steam_id').notNull().unique(),
    referral_code: varchar('referral_code').notNull().unique(),
    referred_by: varchar('referred_by'), // This can be null if not referred by anyone
});

export type Referrals = InferSelectModel<typeof referrals>;
export type InsertReferrals = InferInsertModel<typeof referrals>;

export const referral_rewards = pgTable('referral_rewards', {
    id: serial('id').primaryKey(),
    steam_id: varchar('steam_id').notNull(),
    referred_user: varchar('referred_user', { length: 20 }),
    timestamp: timestamp('timestamp').defaultNow(),
    reward: integer('reward').notNull(),
    condition_met: boolean('condition_met').notNull().default(false),
    claimed: boolean('claimed').notNull().default(false),
});

export type ReferralRewards = InferSelectModel<typeof referral_rewards>;
export type InsertReferralRewards = InferInsertModel<typeof referral_rewards>;

export const player_stats_history = pgTable('player_stats_history', {
    id: serial('id').primaryKey(),
    steam_id: varchar('steam_id').notNull(),
    server_id: varchar('server_id').notNull(),
    kills: integer('kills').notNull().default(0),
    deaths: integer('deaths').notNull().default(0),
    stone_gathered: integer('stone_gathered').notNull().default(0),
    wood_gathered: integer('wood_gathered').notNull().default(0),
    metal_ore_gathered: integer('metal_ore_gathered').notNull().default(0),
    sulfur_ore_gathered: integer('sulfur_ore_gathered').notNull().default(0),
    scrap_wagered: integer('scrap_wagered').notNull().default(0),
    scrap_won: integer('scrap_won').notNull().default(0),
    wipe_start: timestamp('wipe_start').notNull(),
    wipe_end: timestamp('wipe_end').notNull(),
});

export type PlayerStatsHistory = InferSelectModel<typeof player_stats_history>;
export type InsertPlayerStatsHistory = InferInsertModel<typeof player_stats_history>;

export const giveaway_rewards = pgTable('giveaway_rewards', {
    id: serial('id').primaryKey(),
    steam_id: varchar('steam_id').notNull(),
    player_name: varchar('player_name').notNull(),
    reward_permission: varchar('reward_permission').notNull(),
    timestamp: timestamp('timestamp').defaultNow(),
});

export type GiveawayRewards = InferSelectModel<typeof giveaway_rewards>;
export type InsertGiveawayRewards = InferInsertModel<typeof giveaway_rewards>;

export const rw_alerts = pgTable('rw_alerts', {
    id: serial('id').primaryKey(),
    server_id: varchar('server_id').notNull(),
    title: varchar('title').notNull(),
    message: text('message').notNull(),
    timestamp: timestamp('timestamp').defaultNow(),
    active: boolean('active').default(true),
    sent: boolean('sent').default(false),
    icon: varchar('icon').notNull().default('FaBell'),
    severity: varchar('severity', { enum: ['low', 'medium', 'high'] })
        .notNull()
        .default('low'),
    type: varchar('type', { enum: ['system', 'user', 'maintenance'] })
        .notNull()
        .default('system'),
    archived_at: timestamp('archived_at'),
    archived_by: varchar('archived_by'),
    alert_id: varchar('alert_id', { length: 50 }),
    last_occurrence: timestamp('last_occurrence').defaultNow(),
});

export type RwAlerts = InferSelectModel<typeof rw_alerts>;
export type InsertRwAlerts = InferInsertModel<typeof rw_alerts>;

export const plugin_data = pgTable('plugin_data', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull().unique(),
    current_version: varchar('current_version').notNull().default('none'),
    highest_seen_version: varchar('highest_seen_version').notNull(),
    author: varchar('author'),
    updated_at: timestamp('updated_at').defaultNow(),
    created_at: timestamp('created_at').defaultNow(),
});

export type PluginData = InferSelectModel<typeof plugin_data>;
export type InsertPluginData = InferInsertModel<typeof plugin_data>;
