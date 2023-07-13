import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

export function useGoogleAnalytics() {
    const location = useLocation();

    useEffect(() => {
        console.info('Setting page', location.pathname);
        ReactGA.set({ path: location.pathname, search: location.search }); // Update the user's current page
        ReactGA.send({ hitType: 'pageview', page: location.pathname });
    }, [location]);
}
