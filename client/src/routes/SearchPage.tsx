import { DateTime } from 'luxon';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchOptions } from '../components/SearchResults/SearchOptions';
import { SearchResults } from '../components/SearchResults/SearchResults';
import { TrackItemType } from '../enum/TrackItemType';
import { exportFromItems, searchFromItems, SearchResultI } from '../services/trackItem.api';

import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, HStack, Input, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { useDebouncedCallback } from 'use-debounce';
import { CardBox } from '../components/CardBox';
import { Loader } from '../components/Timeline/Loader';
import { TypeSelect } from '../components/TypeSelect';

interface SearchPagingState {
    pageSize: number;
    pageIndex: number;
    sortByKey?: string;
    sortByOrder?: 'asc' | 'desc';
}

export function SearchPage() {
    const resetButtonsRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const fetchIdRef = useRef(0);

    const [searchText, setSearchText] = useState('');
    const [taskName, setTaskName] = useState(TrackItemType.AppTrackItem);
    const [isLoading, setIsLoading] = useState(false);
    const [searchPaging, setSearchPaging] = useState<SearchPagingState>({
        pageSize: 20,
        pageIndex: 0,
        sortByKey: 'endDate',
        sortByOrder: 'desc',
    });

    const [searchResult, setSearchResult] = useState<SearchResultI>({ data: [], total: 0 });

    const [timerange, setTimerange] = useState([
        DateTime.now().startOf('day').minus({ days: 10 }),
        DateTime.now().endOf('day'),
    ]);

    const loadItems = async (searchStr: string) => {
        const fetchId = ++fetchIdRef.current;
        setIsLoading(true);
        const [from, to] = timerange;

        const pagingParams = {
            limit: searchPaging.pageSize,
            offset: searchPaging.pageIndex * searchPaging.pageSize,
            sortByKey: searchPaging.sortByKey || 'endDate',
            sortByOrder: searchPaging.sortByOrder || 'desc',
        };

        const results = await searchFromItems({
            from,
            to,
            taskName,
            searchStr,
            paging: pagingParams,
            sumTotal: true,
        });

        console.info('Sum data', results);

        if (fetchId === fetchIdRef.current) {
            setSearchResult(results);
            console.info('searching with paging', searchPaging, timerange, results);
        }

        setIsLoading(false);
    };

    const debouncedLoadItems = useDebouncedCallback(loadItems, 300);

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
            const pageProps: SearchPagingState = { pageSize, pageIndex };
            if (sortBy && sortBy.length > 0) {
                const [sort] = sortBy;
                pageProps.sortByKey = sort.id;
                pageProps.sortByOrder = sort.desc ? 'desc' : 'asc';
            } else {
                pageProps.sortByKey = 'endDate';
                pageProps.sortByOrder = 'desc';
            }

            setSearchPaging(pageProps);
        },
        [],
    );

    const exportItems = async (searchStr, format = 'csv') => {
        setIsLoading(true);
        const [from, to] = timerange;
        await exportFromItems({
            from,
            to,
            taskName,
            searchStr,
            format,
        });
        setIsLoading(false);
    };

    const refreshData = useCallback(() => {
        // Reset to first page and reload items
        setSearchPaging({ ...searchPaging, pageIndex: 0 });
        // loadItems will be called via the useEffect that depends on searchPaging
    }, [searchPaging]);

    useEffect(() => {
        console.info('searchPaging, searchText or timerange has changed');
        debouncedLoadItems(searchText);
    }, [debouncedLoadItems, searchPaging, searchText, timerange]);

    const onSubmit = (event) => {
        event.preventDefault();
        setSearchPaging((prev) => ({ ...prev, pageIndex: 0 }));
    };

    return (
        <form onSubmit={onSubmit}>
            <Flex p={4} flexDirection="column">
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

                        <Menu>
                            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                                Export
                            </MenuButton>
                            <MenuList>
                                <MenuItem onClick={() => exportItems(searchText, 'csv')}>Export to CSV</MenuItem>
                                <MenuItem onClick={() => exportItems(searchText, 'json')}>Export to JSON</MenuItem>
                            </MenuList>
                        </Menu>
                    </HStack>
                    <Box px={4} ref={resetButtonsRef} />
                    <SearchResults
                        searchResult={searchResult}
                        fetchData={fetchData}
                        pageIndex={searchPaging.pageIndex}
                        resetButtonsRef={resetButtonsRef}
                        refreshData={refreshData}
                    />
                </CardBox>
            </Flex>
        </form>
    );
}
