export function getTimestamp(dateString: string): number {
    return new Date(dateString).getTime();
}

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
