import { useEffect, useState } from 'react';
import { useInterval } from '@chakra-ui/react';
import { shortTime } from '../../time.util';

const NO_VALUE = '-';

export const ShortTimeInterval = ({ totalMs }) => {
    const [time, setTime] = useState(totalMs);

    useEffect(() => {
        setTime(totalMs);
    }, [totalMs]);

    useInterval(() => {
        setTime((oldTime) => oldTime + 1000);
    }, 1000);

    return shortTime(time, { largest: 2, units: ['d', 'h', 'm', 's'] }) || NO_VALUE;
};
