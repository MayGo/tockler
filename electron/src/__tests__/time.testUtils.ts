export function getTimestamp(dateString: string): number {
    return new Date(dateString).getTime();
}
