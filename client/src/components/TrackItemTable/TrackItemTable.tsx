// tslint:disable-next-line: no-submodule-imports

import { useStoreState } from '../../store/easyPeasy';
import { checkIfOneDay } from '../../timeline.util';
import { filterItems } from '../Timeline/timeline.utils';
import { ItemsTable } from './ItemsTable';

export const TrackItemTable = ({ type, resetButtonsRef }) => {
    const timeItems = useStoreState((state) => state.timeItems);
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);

    const data = filterItems(timeItems[type], visibleTimerange);

    const isOneDay = checkIfOneDay(visibleTimerange);

    return (
        <ItemsTable
            data={data}
            resetButtonsRef={resetButtonsRef}
            isOneDay={isOneDay}
            isSearchTable={false}
            total={0}
            manualSortBy={false}
        />
    );
};
