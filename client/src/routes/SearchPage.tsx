import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { Flex, Box } from '@rebass/grid';
import { Input, Spin, Button } from 'antd';
import { useFormState } from 'react-use-form-state';
import debounce from 'debounce-promise';
import { searchFromItems } from '../services/trackItem.api';
import moment from 'moment';
import { TrackItemType } from '../enum/TrackItemType';
import { SearchResults } from '../components/SearchResults/SearchResults';
import { SearchOptions } from '../components/SearchResults/SearchOptions';
import { Spinner } from '../components/Timeline/Timeline.styles';
import { Logger } from '../logger';

export function SearchPage({ location }: any) {
    const [formState, { text }] = useFormState({ search: '' });

    const [isLoading, setIsLoading] = useState<any>(false);

    const [dataItems, setDataItems] = useState([]);
    const [timerange, setTimerange] = useState([
        moment()
            .startOf('day')
            .subtract(10, 'days'),
        moment().endOf('day'),
    ]);

    const from = moment()
        .startOf('day')
        .subtract(1, 'days');
    const to = moment().endOf('day');
    const taskName = TrackItemType.AppTrackItem;

    const paging = { limit: 10, offset: 0 };
    const loadItems = async searchStr => {
        setIsLoading(true);
        const items = await searchFromItems({
            from,
            to,
            taskName,
            searchStr,
            paging,
        });
        Logger.debug('Search results:', items);
        setDataItems(items);
        setIsLoading(false);
        return;
    };

    useEffect(() => {
        loadItems('');
    }, []);

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
                    <SearchResults dataItems={dataItems} />
                </Box>
            </Flex>
        </MainLayout>
    );
}
