import { addDays, setHours, startOfDay } from 'date-fns';

export function calculateNextWipe(wipeDays: string, wipeTime: number) {
    const today = new Date();
    const currentDay = today.getDay();

    const nextWipeDays = wipeDays
        .split(',')
        .map(Number)
        .sort((a, b) => a - b);

    let nextWipeDay = nextWipeDays.find((day) => day > currentDay);
    if (!nextWipeDay) {
        nextWipeDay = nextWipeDays[0];
    }

    const daysUntilWipe = nextWipeDay > currentDay ? nextWipeDay - currentDay : 7 - (currentDay - nextWipeDay);

    const nextWipeDate = addDays(startOfDay(today), daysUntilWipe);
    return setHours(nextWipeDate, wipeTime || 11);
}
