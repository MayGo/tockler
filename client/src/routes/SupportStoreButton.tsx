import { Button } from '@chakra-ui/button';
import { FaStore } from 'react-icons/fa';
import { sendSupportLinkClickedEvent } from '../useGoogleAnalytics.utils';
import { useCallback } from 'react';

const storeUrl = 'https://trimatechdesigns.etsy.com/';

export function SupportStoreButton({ trayButton = false }) {
    const onClick = useCallback(() => {
        sendSupportLinkClickedEvent();
        window.open(storeUrl, '_blank');
    }, []);
    return (
        <Button variant="outline" leftIcon={<FaStore />} onClick={onClick} textDecoration="none !important" color="red">
            {trayButton ? 'Visit Store' : 'Support Tockler by visiting my Store'}
        </Button>
    );
}
