import { useEffect, useState } from 'react';

export const useWindowFocused = () => {
    const [windowIsActive, setWindowIsActive] = useState(true);

    function handleActivity(forcedFlag) {
        if (typeof forcedFlag === 'boolean') {
            return forcedFlag ? setWindowIsActive(true) : setWindowIsActive(false);
        }

        return document.hidden ? setWindowIsActive(false) : setWindowIsActive(true);
    }

    useEffect(() => {
        document.addEventListener('visibilitychange', handleActivity);
        document.addEventListener('blur', () => handleActivity(false));
        window.addEventListener('blur', () => handleActivity(false));
        window.addEventListener('focus', () => handleActivity(true));
        document.addEventListener('focus', () => handleActivity(true));

        return () => {
            window.removeEventListener('blur', handleActivity);
            document.removeEventListener('blur', handleActivity);
            window.removeEventListener('focus', handleActivity);
            document.removeEventListener('focus', handleActivity);
            document.removeEventListener('visibilitychange', handleActivity);
        };
    }, []);

    return { windowIsActive };
};
