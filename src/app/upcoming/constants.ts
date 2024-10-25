import moment from 'moment-timezone';

export const DEFAULT_PARAMS = {
    region: 'US',
    resource_rate: 'any',
    group_limit: 'any',
    game_mode: 'any',
    min_rank: '5000',
    time_zone: '-7',
    date: moment().format('YYYY-MM-DD'),
} as const;

export const standardTimeOptions: [string, string][] = [
    ['-10', 'Hawaii-Aleutian Standard Time (UTC-10:00)'],
    ['-9', 'Alaska Standard Time (UTC-09:00)'],
    ['-8', 'Pacific Standard Time (UTC-08:00)'],
    ['-7', 'Mountain Standard Time (UTC-07:00)'],
    ['-6', 'Central Standard Time (UTC-06:00)'],
    ['-5', 'Eastern Standard Time (UTC-05:00)'],
    ['-4', 'Atlantic Standard Time (UTC-04:00)'],
    ['0', 'Coordinated Universal Time (UTC)'],
    ['1', 'Central European Time (UTC+01:00)'],
    ['2', 'Eastern European Time (UTC+02:00)'],
    ['3', 'Moscow Standard Time (UTC+03:00)'],
    ['4', 'Gulf Standard Time (UTC+04:00)'],
    ['5', 'Pakistan Standard Time (UTC+05:00)'],
    ['6', 'Bangladesh Standard Time (UTC+06:00)'],
    ['7', 'Indochina Time (UTC+07:00)'],
    ['8', 'China Standard Time (UTC+08:00)'],
    ['9', 'Japan Standard Time (UTC+09:00)'],
    ['10', 'Australian Eastern Standard Time (UTC+10:00)'],
    ['11', 'Solomon Islands Time (UTC+11:00)'],
    ['12', 'New Zealand Standard Time (UTC+12:00)'],
    ['13', 'Samoa Standard Time (UTC+13:00)'],
];

export const daylightTimeOptions: [string, string][] = [
    ['-9', 'Hawaii-Aleutian Daylight Time (UTC-09:00)'],
    ['-8', 'Alaska Daylight Time (UTC-08:00)'],
    ['-7', 'Pacific Daylight Time (UTC-07:00)'],
    ['-6', 'Mountain Daylight Time (UTC-06:00)'],
    ['-5', 'Central Daylight Time (UTC-05:00)'],
    ['-4', 'Eastern Daylight Time (UTC-04:00)'],
    ['-3', 'Atlantic Daylight Time (UTC-03:00)'],
    ['0', 'Coordinated Universal Time (UTC)'],
    ['2', 'Central European Summer Time (UTC+02:00)'],
    ['3', 'Eastern European Summer Time (UTC+03:00)'],
    ['4', 'Moscow Daylight Time (UTC+04:00)'],
    ['5', 'Gulf Daylight Time (UTC+05:00)'],
    ['6', 'Pakistan Daylight Time (UTC+06:00)'],
    ['7', 'Bangladesh Daylight Time (UTC+07:00)'],
    ['8', 'Indochina Daylight Time (UTC+08:00)'],
    ['9', 'China Daylight Time (UTC+09:00)'],
    ['10', 'Japan Daylight Time (UTC+10:00)'],
    ['11', 'Australian Eastern Daylight Time (UTC+11:00)'],
    ['12', 'Solomon Islands Daylight Time (UTC+12:00)'],
    ['13', 'New Zealand Daylight Time (UTC+13:00)'],
    ['14', 'Samoa Daylight Time (UTC+14:00)'],
];

export const regionSelectOptions: [string, string][] = [
    ['US', 'US'],
    ['EU', 'EU'],
    ['AS', 'AS'],
];

export const rateSelectOptions: [string, string][] = [
    ['any', 'Any Resource Rate'],
    ['1x', '1x'],
    ['1.5x', '1.5x'],
    ['2x', '2x'],
    ['3x', '3x'],
    ['5x', '5x'],
    ['10x', '10x'],
    ['100x', '100x'],
    ['1000x', '1000x'],
];

export const groupSelectOptions: [string, string][] = [
    ['any', 'Any Group Limit'],
    ['solo', 'Solo'],
    ['duo', 'Duo'],
    ['trio', 'Trio'],
    ['quad', 'Quad'],
    ['no limit', 'No Limit'],
];

export const modeSelectOptions: [string, string][] = [
    ['any', 'Any Game Mode'],
    ['pvp', 'PvP'],
    ['pve', 'PvE'],
    ['arena', 'Arena'],
    ['build', 'Build'],
];
