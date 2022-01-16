import { IconButton, Tooltip } from '@chakra-ui/react';
import moment from 'moment';
import React, { memo } from 'react';
import { AiOutlineUnorderedList } from 'react-icons/ai';
import { useHistory } from 'react-router';
import { useStoreActions } from '../../store/easyPeasy';
import { ItemsTable } from '../TrackItemTable/ItemsTable';

const ActionCell = ({ cell }) => {
    const { beginDate, endDate } = cell.row.original;

    const loadTimerange = useStoreActions((state) => state.loadTimerange);
    const setVisibleTimerange = useStoreActions((state) => state.setVisibleTimerange);

    const history = useHistory();

    const goToTimelinePage = (record) => {
        loadTimerange([moment(record.beginDate).startOf('day'), moment(record.beginDate).endOf('day')]);
        setVisibleTimerange([
            moment(record.beginDate).subtract(15, 'minutes'),
            moment(record.endDate).add(15, 'minutes'),
        ]);
        history.push('/app/timeline');
    };

    return (
        <Tooltip placement="left" label="Select date and go to timeline view">
            <IconButton
                variant="ghost"
                aria-label="Go to timeline"
                icon={<AiOutlineUnorderedList />}
                onClick={() => goToTimelinePage({ beginDate, endDate })}
            />
        </Tooltip>
    );
};

const extraColumns = [
    {
        Cell: ActionCell,
        id: 'actions',
        accessor: 'title',
        width: 20,
        minWidth: 20,
        maxWidth: 20,
    },
];
const SearchResultsPlain = ({ searchResult, changePaging, pageIndex, total }) => {
    return (
        <ItemsTable
            data={searchResult.results || []}
            isOneDay={false}
            isSearchTable
            changePaging={changePaging}
            pageCount={searchResult.total}
            pageIndex={pageIndex}
            extraColumns={extraColumns}
            total={total}
        />
    );

    /* return (
        <Td>
        <Tooltip placement="left" label="Select date and go to timeline view">
            <AiOutlineUnorderedList
                onClick={() => goToTimelinePage({ beginDate, endDate })}
            />
        </Tooltip>
    </Td>
    );*/
};

export const SearchResults = memo(SearchResultsPlain);
