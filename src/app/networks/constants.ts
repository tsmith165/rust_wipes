export const RESOURCE_RATES = ['1.5x', '2x', '3x', '5x', '10x', 'build', 'creative', 'arena', 'aimtrain'] as const;

export const SERVER_TITLE_RATE_KEYWORDS = {
    '1.5x': ['1.5x'],
    '2x': ['2x'],
    '3x': ['3x'],
    '5x+': ['5x', '10x'],
    'Build / Creative': ['build', 'creative'],
    'Arena / AimTrain': ['arena', 'aimtrain', 'ukn', 'rtg'],
} as const;

export type ResourceRateGroup = keyof typeof SERVER_TITLE_RATE_KEYWORDS | 'Vanilla';
