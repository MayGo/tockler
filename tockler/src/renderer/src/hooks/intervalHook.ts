import { useEffect, useRef } from 'react';

export function useInterval(callback, delay) {
    const savedCallback = useRef<any>();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null && delay > 0) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
        return;
    }, [delay]);
}
