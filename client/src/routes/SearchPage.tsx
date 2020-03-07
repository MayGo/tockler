import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { Flex, Box } from '@rebass/grid';
import { Input, Spin, Button } from 'antd';
import { useFormState } from 'react-use-form-state';
import { searchFromItems, exportFromItems } from '../services/trackItem.api';
import moment from 'moment';
import { TrackItemType } from '../enum/TrackItemType';
import { SearchResults } from '../components/SearchResults/SearchResults';
import { SearchOptions } from '../components/SearchResults/SearchOptions';
import { Spinner } from '../components/Timeline/Timeline.styles';

export function SearchPage({ location }: any) {
    const [formState, { text }] = useFormState({ search: '' });

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

    const loadItems = async searchStr => {
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
        loadItems(formState.values.search);
    }, [searchPaging]);

    return (
        <MainLayout location={location}>
            <Flex p={1} w={1} flexDirection="column">
                <Flex p={1}>
                    <Input
                        placeholder="Search from all items"
                        {...text({
                            name: 'search',
                        })}
                    />
                    <Box pl={1}>
                        <Button
                            onClick={() => {
                                loadItems(formState.values.search);
                            }}
                            type="primary"
                        >
                            Search
                        </Button>
                    </Box>
                    <Box pl={1}>
                        <Button
                            onClick={() => {
                                exportItems(formState.values.search);
                            }}
                            type="default"
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
                        <Spinner>
                            <Spin />
                        </Spinner>
                    )}
                    <SearchResults
                        searchResult={searchResult}
                        searchPaging={searchPaging}
                        setSearchPaging={setSearchPaging}
                    />
                </Box>
            </Flex>
        </MainLayout>
    );
}
