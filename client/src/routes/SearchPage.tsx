import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { searchFromItems, exportFromItems } from '../services/trackItem.api';
import moment from 'moment';
import { TrackItemType } from '../enum/TrackItemType';
import { SearchResults } from '../components/SearchResults/SearchResults';
import { SearchOptions } from '../components/SearchResults/SearchOptions';

import { Box, Flex } from '@chakra-ui/layout';
import { Input } from '@chakra-ui/input';
import { Button } from '@chakra-ui/button';
import { Loader } from '../components/Timeline/Loader';
import { CardBox } from '../components/CardBox';

export function SearchPage() {
    const fetchIdRef = useRef(0);
    const [searchText, setSearchText] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [searchPaging, setSearchPaging] = useState({ pageSize: 20, pageIndex: 1 });

    const [searchResult, setSearchResult] = useState([]);
    const [timerange, setTimerange] = useState([
        moment()
            .startOf('day')
            .subtract(10, 'days'),
        moment().endOf('day'),
    ]);

    const taskName = TrackItemType.AppTrackItem;

    const loadItems = async (searchStr, firstPage = false) => {
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
        // Only update the data if this is the latest fetch
        if (fetchId === fetchIdRef.current) {
            setSearchResult(items);
            console.info('searching with paging', searchPaging, timerange, items);
        }
        setIsLoading(false);

        return;
    };

    const changePaging = useCallback(({ pageSize, pageIndex }) => {
        setSearchPaging({ ...searchPaging, pageSize, pageIndex });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const exportItems = async searchStr => {
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

    useEffect(() => {
        console.info('searchPaging in page changed');
        loadItems(searchText);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchPaging]);

    const onSubmit = event => {
        event.preventDefault();
        setSearchPaging({ ...searchPaging, pageIndex: 1 });
    };

    return (
        <MainLayout>
            <form onSubmit={onSubmit}>
                <Flex p={3} flexDirection="column">
                    <CardBox position="relative" p={0}>
                        {isLoading && <Loader />}
                        <Box p={4} pb={0}>
                            <SearchOptions setTimerange={setTimerange} timerange={timerange} />
                        </Box>
                        <Flex p={4}>
                            <Input
                                placeholder="Search from all items"
                                value={searchText}
                                onChange={event => setSearchText(event.target.value)}
                            />
                            <Box px={2}>
                                <Button type="submit" bg="brand.mainColor" w="100px">
                                    Search
                                </Button>
                            </Box>

                            <Box px={2}>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        exportItems(searchText);
                                    }}
                                >
                                    Export to CSV
                                </Button>
                            </Box>
                        </Flex>
                        <SearchResults
                            searchResult={searchResult}
                            changePaging={changePaging}
                            pageIndex={searchPaging.pageIndex}
                        />
                    </CardBox>
                </Flex>
            </form>
        </MainLayout>
    );
}
