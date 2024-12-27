export function formatTimeDifference(targetTimestamp: number, currentTimestamp: number): string {
    const diffMs = targetTimestamp - currentTimestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) return 'Passed';

    if (diffDays > 0) {
        return `${diffDays}d ${diffHours % 24}h ${diffMins % 60}m`;
    } else if (diffHours > 0) {
        return `${diffHours}h ${diffMins % 60}m`;
    } else {
        return `${diffMins}m`;
    }
}
