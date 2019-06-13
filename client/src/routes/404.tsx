import * as React from 'react';
import useRouter from 'use-react-router';

export default function() {
    const router = useRouter();
    console.error('404 Not Found', router);
    return <div>Tockler Error: 404 Not Found</div>;
}
