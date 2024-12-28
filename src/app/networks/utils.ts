export function formatTimeDifference(timestamp: Date | null | undefined, isNextWipe: boolean): string {
    if (!timestamp) return 'Unknown';

    const now = new Date();
    const diffMs = isNextWipe
        ? timestamp.getTime() - now.getTime() // Future date - now for next wipe
        : now.getTime() - timestamp.getTime(); // Now - past date for last wipe

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    // If the difference is negative for next wipe, it's in the past
    if (isNextWipe && diffMs < 0) {
        return 'Passed';
    }

    if (diffDays > 0) {
        return `${diffDays}d ${diffHours % 24}h ${diffMins % 60}m`;
    } else if (diffHours > 0) {
        return `${diffHours}h ${diffMins % 60}m`;
    } else {
        return `${diffMins}m`;
    }
}
