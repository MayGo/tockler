import { DateTime } from 'luxon';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchOptions } from '../components/SearchResults/SearchOptions';
import { SearchResults } from '../components/SearchResults/SearchResults';
import { TrackItemType } from '../enum/TrackItemType';
import { exportFromItems, searchFromItems, SearchResultI } from '../services/trackItem.api';

import { Box, Button, Flex, HStack, Input } from '@chakra-ui/react';
import { CardBox } from '../components/CardBox';
import { Loader } from '../components/Timeline/Loader';
import { TypeSelect } from '../components/TypeSelect';

export function SearchPage() {
    const resetButtonsRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const fetchIdRef = useRef(0);
    const [searchText, setSearchText] = useState('');
    const [taskName, setTaskName] = useState(TrackItemType.AppTrackItem);

    const [isLoading, setIsLoading] = useState(false);
    const [searchPaging, setSearchPaging] = useState({ pageSize: 20, pageIndex: 0 });

    const [searchResult, setSearchResult] = useState<SearchResultI>({ results: [], total: 0 });
    const [total, setTotal] = useState(0);
    const [timerange, setTimerange] = useState([
        DateTime.now().startOf('day').minus({ days: 10 }),
        DateTime.now().endOf('day'),
    ]);

    const loadItems = async (searchStr: string) => {
        const fetchId = ++fetchIdRef.current;
        setIsLoading(true);
        const [from, to] = timerange;
        const items = await searchFromItems({
            from,
            to,
            taskName,
            searchStr,
            paging: searchPaging,
        });

        // When sumTotal is true, the API returns a different format
        const sum = await searchFromItems({
            from,
            to,
            taskName,
            searchStr,
            paging: {},
            sumTotal: true,
        });

        console.info('Sum data', sum);
        const sumColumn = 'sum(endDate-beginDate)';

        // Only update the data if this is the latest fetch
        if (fetchId === fetchIdRef.current) {
            setSearchResult(items);
            setTotal(sum.results?.length > 0 ? sum.results[0][sumColumn] : 0);
            console.info('searching with paging', searchPaging, timerange, items);
        }

        setIsLoading(false);

        return;
    };

    const fetchData = useCallback(
        ({
            pageSize,
            pageIndex,
            sortBy,
        }: {
            pageSize: number;
            pageIndex: number;
            sortBy: { id: string; desc: boolean }[];
        }) => {
            const pageProps = { pageSize, pageIndex };
            if (sortBy && sortBy.length > 0) {
                const [sort] = sortBy;

                pageProps['sortByKey'] = sort.id;
                pageProps['sortByOrder'] = sort.desc ? 'desc' : 'asc';
            }

            setSearchPaging(pageProps);
        },
        [],
    );

    const exportItems = async (searchStr) => {
        setIsLoading(true);
        const [from, to] = timerange;
        await exportFromItems({
            from,
            to,
            taskName,
            searchStr,
        });

        setIsLoading(false);
        return;
    };

    const refreshData = useCallback(() => {
        // Reset to first page and reload items
        setSearchPaging({ ...searchPaging, pageIndex: 0 });
        // loadItems will be called via the useEffect that depends on searchPaging
    }, [searchPaging]);

    useEffect(() => {
        console.info('searchPaging in page changed');
        loadItems(searchText);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchPaging]);

    const onSubmit = (event) => {
        event.preventDefault();
        setSearchPaging({ ...searchPaging, pageIndex: 0 });
    };

    return (
        <form onSubmit={onSubmit}>
            <Flex p={3} flexDirection="column">
                <CardBox position="relative" p={0}>
                    {isLoading && <Loader />}
                    <Box p={4} pb={0}>
                        <SearchOptions setTimerange={setTimerange} timerange={timerange} />
                    </Box>
                    <HStack p={4}>
                        <TypeSelect value={taskName} onChange={(event) => setTaskName(event.target.value)} />
                        <Input
                            placeholder="Search from all items"
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                        />

                        <Button type="submit" bg="brand.mainColor" w="100px">
                            Search
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => {
                                exportItems(searchText);
                            }}
                        >
                            Export to CSV
                        </Button>
                    </HStack>
                    <Box px={4} ref={resetButtonsRef} />
                    <SearchResults
                        searchResult={searchResult}
                        fetchData={fetchData}
                        pageIndex={searchPaging.pageIndex}
                        total={total}
                        resetButtonsRef={resetButtonsRef}
                        refreshData={refreshData}
                    />
                </CardBox>
            </Flex>
        </form>
    );
}
