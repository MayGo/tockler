import React from 'react';
import useRouter from 'use-react-router';
import { Logger } from '../logger';

export const NotFound = () => {
    const router = useRouter();
    Logger.error('404 Not Found', router);
    return <div>Tockler Error: 404 Not Found</div>;
};
