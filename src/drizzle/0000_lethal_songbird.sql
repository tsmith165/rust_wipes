CREATE TABLE `rw_parsed_server` (
	`id` int NOT NULL,
	`timestamp` datetime DEFAULT '2024-03-17 15:04:47.760',
	`rank` int,
	`ip` varchar(255),
	`title` varchar(255),
	`region` varchar(255),
	`players` int,
	`wipe_schedule` varchar(255),
	`game_mode` varchar(255),
	`resource_rate` varchar(255),
	`group_limit` varchar(255),
	`last_wipe` varchar(255),
	`last_bp_wipe` varchar(255),
	`next_wipe` varchar(255),
	`next_wipe_full` varchar(255),
	`next_wipe_is_bp` varchar(255),
	`next_wipe_hour` int,
	`next_wipe_dow` int,
	`next_wipe_week` int,
	`main_wipe_hour` int,
	`main_wipe_dow` int,
	`sec_wipe_hour` int,
	`sec_wipe_dow` int,
	`bp_wipe_hour` int,
	`bp_wipe_dow` int,
	CONSTRAINT `rw_parsed_server_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rw_scrapper_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` datetime DEFAULT '2024-03-17 15:04:47.762',
	`scrapper_duration` int,
	`servers_parsed` int,
	`servers_skipped` int,
	`servers_posted` int,
	CONSTRAINT `rw_scrapper_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rw_server_network` (
	`id` int NOT NULL,
	`bm_ids` varchar(255),
	`name` varchar(255),
	`region` varchar(255),
	CONSTRAINT `rw_server_network_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rw_wipe_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bm_id` int,
	`timestamp` datetime DEFAULT '2024-03-17 15:04:47.761',
	`wipe_time` varchar(255),
	`is_bp` varchar(255),
	`title` varchar(255),
	`description` text,
	`attributes` text,
	CONSTRAINT `rw_wipe_history_id` PRIMARY KEY(`id`)
);
