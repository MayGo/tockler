import { IconButton, Tooltip } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { memo } from 'react';
import { AiOutlineUnorderedList } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

import { SearchResultI } from '../../services/trackItem.api';
import { useStoreActions } from '../../store/easyPeasy';
import { ItemsTable } from '../TrackItemTable/ItemsTable';
import { SearchDeleteButtons } from './SearchDeleteButtons';

const ActionCell = ({ cell }) => {
    const { beginDate, endDate } = cell.row.original;

    const loadTimerange = useStoreActions((state) => state.loadTimerange);
    const setVisibleTimerange = useStoreActions((state) => state.setVisibleTimerange);

    const navigate = useNavigate();

    const goToTimelinePage = (record) => {
        const beginDateTime = DateTime.fromMillis(record.beginDate);
        loadTimerange([beginDateTime.startOf('day'), beginDateTime.endOf('day')]);
        setVisibleTimerange([
            DateTime.fromMillis(record.beginDate).minus({ minutes: 15 }),
            DateTime.fromMillis(record.endDate).plus({ minutes: 15 }),
        ]);
        navigate('/app/timeline');
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

interface SearchResultsProps {
    searchResult: SearchResultI;
    fetchData: (params: { pageSize: number; pageIndex: number; sortBy: { id: string; desc: boolean }[] }) => void;
    pageIndex: number;
    total: number;
    resetButtonsRef: React.RefObject<HTMLDivElement>;
    refreshData: () => void;
}

const SearchResultsPlain = ({
    searchResult,
    fetchData,
    pageIndex,
    total,
    resetButtonsRef,
    refreshData,
}: SearchResultsProps) => {
    return (
        <ItemsTable
            data={searchResult.results || []}
            isOneDay={false}
            isSearchTable
            fetchData={fetchData}
            pageCount={searchResult.total}
            pageIndex={pageIndex}
            extraColumns={extraColumns}
            total={total}
            manualSortBy
            resetButtonsRef={resetButtonsRef}
            customTableButtons={<SearchDeleteButtons refreshData={refreshData} />}
        />
    );
};

export const SearchResults = memo(SearchResultsPlain);
