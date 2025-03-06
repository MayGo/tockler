import { useCallback, useEffect, useState } from 'react';

export const useWindowFocused = () => {
    const [windowIsActive, setWindowIsActive] = useState(true);

    // Use useCallback to ensure stable reference across renders
    const handleActivity = useCallback((forcedFlag?: boolean) => {
        if (typeof forcedFlag === 'boolean') {
            setWindowIsActive(forcedFlag);
            return;
        }

        setWindowIsActive(!document.hidden);
    }, []);

    useEffect(() => {
        // Initial state
        handleActivity();

        const handleVisibilityChange = () => handleActivity();
        const handleBlur = () => handleActivity(false);
        const handleFocus = () => handleActivity(true);

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('blur', handleBlur);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [handleActivity]);

    return { windowIsActive };
};
