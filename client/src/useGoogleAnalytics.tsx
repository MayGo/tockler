import React from 'react';
import { useLocation } from 'react-router-dom';

import { analytics } from './analytics';

export function useGoogleAnalytics() {
    const location = useLocation();

    React.useEffect(() => {
        analytics.page({
            path: location.pathname,
            search: location.search,
        });
    }, [location]);
}
