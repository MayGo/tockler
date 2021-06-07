import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { searchFromItems, exportFromItems } from '../services/trackItem.api';
import moment from 'moment';
import { TrackItemType } from '../enum/TrackItemType';
import { SearchResults } from '../components/SearchResults/SearchResults';
import { SearchOptions } from '../components/SearchResults/SearchOptions';

import { Box, Flex } from '@chakra-ui/layout';
import { Input } from '@chakra-ui/input';
import { Button } from '@chakra-ui/button';
import { Spinner } from '@chakra-ui/spinner';
import { SpinnerContainer } from '../components/Timeline/Timeline.styles';

export function SearchPage({ location }: any) {
    const [searchText, setSearchText] = useState('');

    const [isLoading, setIsLoading] = useState<any>(false);
    const [searchPaging, setSearchPaging] = useState<any>({ pageSize: 20, page: 1 });

    const [searchResult, setSearchResult] = useState([]);
    const [timerange, setTimerange] = useState([
        moment()
            .startOf('day')
            .subtract(10, 'days'),
        moment().endOf('day'),
    ]);

    const taskName = TrackItemType.AppTrackItem;

    const loadItems = async (searchStr, firstPage = false) => {
        setIsLoading(true);
        const [from, to] = timerange;
        const items = await searchFromItems({
            from,
            to,
            taskName,
            searchStr,
            paging: searchPaging,
        });

        setSearchResult(items);
        console.info('searching with pa', searchPaging, items);
        setIsLoading(false);

        return;
    };

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
        loadItems(searchText);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchPaging]);

    const onSubmit = event => {
        setSearchPaging({ ...searchPaging, page: 1 });

        event.preventDefault();
    };

    return (
        <MainLayout location={location}>
            <form onSubmit={onSubmit}>
                <Flex p={1} flexDirection="column">
                    <Flex p={1}>
                        <Input
                            placeholder="Search from all items"
                            value={searchText}
                            onChange={event => setSearchText(event.target.value)}
                        />
                        <Box px={2}>
                            <Button type="submit">Search</Button>
                        </Box>

                        <Box px={2}>
                            <Button
                                onClick={() => {
                                    exportItems(searchText);
                                }}
                            >
                                Export to CSV
                            </Button>
                        </Box>
                    </Flex>
                    <Box p={1}>
                        <SearchOptions setTimerange={setTimerange} timerange={timerange} />
                    </Box>
                    <Box p={1}>
                        {isLoading && (
                            <SpinnerContainer>
                                <Spinner />
                            </SpinnerContainer>
                        )}
                        <SearchResults searchResult={searchResult} />
                    </Box>
                </Flex>
            </form>
        </MainLayout>
    );
}
