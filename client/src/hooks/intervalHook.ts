import { useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number | null): void {
    const savedCallback = useRef<() => void>(() => {});

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick(): void {
            savedCallback.current();
        }
        if (delay !== null && delay > 0) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
        return;
    }, [delay]);
}
