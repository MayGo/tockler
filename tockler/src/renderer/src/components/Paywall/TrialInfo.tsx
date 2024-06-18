import * as React from 'react';

import { UserContext } from './UserProvider';
import { CardBox } from '../CardBox';

export const TrialInfo: React.FC<any> = () => {
    const { hasTrial, trialDays } = React.useContext(UserContext);

    if (!hasTrial) {
        return null;
    }

    return (
        <CardBox title="Trial" divider>
            You have {Math.max(trialDays, 0)} days of <b>Premium</b> left.
        </CardBox>
    );
};
