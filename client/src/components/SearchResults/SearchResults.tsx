import useReactRouter from 'use-react-router';
import moment from 'moment';
import React, { memo } from 'react';
import Moment from 'react-moment';
import { DATE_TIME_FORMAT } from '../../constants';
import { diffAndFormatShort } from '../../utils';
import { useStoreActions } from '../../store/easyPeasy';
import { AiOutlineUnorderedList } from 'react-icons/ai';
import { Tooltip } from '@chakra-ui/tooltip';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

const SearchResultsPlain = ({ searchResult }) => {
    const loadTimerange = useStoreActions(state => state.loadTimerange);
    const setVisibleTimerange = useStoreActions(state => state.setVisibleTimerange);

    const { history } = useReactRouter();

    const goToTimelinePage = record => {
        loadTimerange([
            moment(record.beginDate).startOf('day'),
            moment(record.beginDate).endOf('day'),
        ]);
        setVisibleTimerange([
            moment(record.beginDate).subtract(15, 'minutes'),
            moment(record.endDate).add(15, 'minutes'),
        ]);
        history.push('/app/timeline');
    };

    console.info('searchResult.results?', searchResult);

    return (
        <Table variant="simple">
            <Thead>
                <Tr>
                    <Th>App</Th>
                    <Th>Title</Th>
                    <Th>URL</Th>
                    <Th>Begin Date</Th>
                    <Th>End Date</Th>
                    <Th>Dur</Th>
                    <Th></Th>
                </Tr>
            </Thead>
            <Tbody>
                {searchResult.results?.map(({ app, title, url, beginDate, endDate }) => (
                    <Tr>
                        <Td>{app}</Td>
                        <Td>{title}</Td>
                        <Td>{url}</Td>
                        <Td>
                            <Moment format={DATE_TIME_FORMAT}>{beginDate}</Moment>
                        </Td>
                        <Td>
                            <Moment format={DATE_TIME_FORMAT}>{endDate}</Moment>
                        </Td>
                        <Td>{diffAndFormatShort(beginDate, endDate)}</Td>
                        <Td>
                            <Tooltip placement="left" label="Select date and go to timeline view">
                                <AiOutlineUnorderedList
                                    onClick={() => goToTimelinePage({ beginDate, endDate })}
                                />
                            </Tooltip>
                        </Td>
                    </Tr>
                ))}
            </Tbody>
        </Table>
    );
};

export const SearchResults = memo(SearchResultsPlain);
