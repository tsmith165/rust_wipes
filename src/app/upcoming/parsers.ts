import { parseAsStringEnum, parseAsString } from 'nuqs/server';
import { DEFAULT_PARAMS } from './constants';

// Create type-safe parsers for each param
export const regionParser = parseAsStringEnum(['US', 'EU', 'AS'] as const).withDefault(DEFAULT_PARAMS.region);

export const resourceRateParser = parseAsStringEnum(['any', '1x', '1.5x', '2x', '3x', '5x', '10x', '100x', '1000x'] as const).withDefault(
    DEFAULT_PARAMS.resource_rate,
);

export const groupLimitParser = parseAsStringEnum(['any', 'solo', 'duo', 'trio', 'quad', 'no limit'] as const).withDefault(
    DEFAULT_PARAMS.group_limit,
);

export const gameModeParser = parseAsStringEnum(['any', 'pvp', 'pve', 'arena', 'build'] as const).withDefault(DEFAULT_PARAMS.game_mode);

export const minRankParser = parseAsString.withDefault(DEFAULT_PARAMS.min_rank);

export const timeZoneParser = parseAsString.withDefault(DEFAULT_PARAMS.time_zone);

export const dateParser = parseAsString.withDefault(DEFAULT_PARAMS.date);

// Types for the parsed parameters
export type ParsedParams = {
    region: NonNullable<ReturnType<typeof regionParser.parseServerSide>>;
    resource_rate: NonNullable<ReturnType<typeof resourceRateParser.parseServerSide>>;
    group_limit: NonNullable<ReturnType<typeof groupLimitParser.parseServerSide>>;
    game_mode: NonNullable<ReturnType<typeof gameModeParser.parseServerSide>>;
    min_rank: NonNullable<ReturnType<typeof minRankParser.parseServerSide>>;
    time_zone: NonNullable<ReturnType<typeof timeZoneParser.parseServerSide>>;
    date: NonNullable<ReturnType<typeof dateParser.parseServerSide>>;
};

// Update interface for sidebar props to match nuqs types
export interface SearchParamsType {
    date: string;
    min_rank: string;
    time_zone: string;
    region: 'US' | 'EU' | 'AS';
    resource_rate: 'any' | '1x' | '1.5x' | '2x' | '3x' | '5x' | '10x' | '100x' | '1000x';
    group_limit: 'any' | 'solo' | 'duo' | 'trio' | 'quad' | 'no limit';
    game_mode: 'any' | 'pvp' | 'pve' | 'arena' | 'build';
}
