// tslint:disable-next-line: no-submodule-imports

import React, { useMemo } from 'react';
import Moment from 'react-moment';
import { DATE_TIME_FORMAT, TIME_FORMAT } from '../../constants';
import { TrackItemType } from '../../enum/TrackItemType';
import { diffAndFormatShort } from '../../utils';
import { filterItems } from '../Timeline/timeline.utils';
import { TotalCount } from './TrackItemTable.styles';
import { checkIfOneDay } from '../../timeline.util';
import { useStoreState } from '../../store/easyPeasy';
import { Box, Flex } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { Table, Tbody, Td, Tfoot, Th, Thead, Tr } from '@chakra-ui/table';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { useTable, useSortBy, usePagination, useFilters, useRowSelect } from 'react-table';

import { calculateTotal, fuzzyTextFilterFn } from './TrackItemTable.utils';
import { SelectColumnFilter } from './SelectColumnFilter';
import { DefaultColumnFilter } from './DefaultColumnFilter';
import { IndeterminateCheckbox } from './IndeterminateCheckbox';
import { Portal } from '@chakra-ui/react';
import { TrackItemTableButtons } from './TrackItemTableButtons';
import { TrackItemTablePager } from './TrackItemTablePager';

export const TrackItemTable = ({ type, resetButtonsRef }) => {
    const timeItems = useStoreState(state => state.timeItems);
    const visibleTimerange = useStoreState(state => state.visibleTimerange);

    const data = useMemo(
        () =>
            type === TrackItemType.AppTrackItem
                ? filterItems(timeItems.appItems, visibleTimerange)
                : filterItems(timeItems.logItems, visibleTimerange),
        [type, timeItems.appItems, timeItems.logItems, visibleTimerange],
    );

    const dateToValue = ({ value }) => {
        return <Moment format={isOneDay ? TIME_FORMAT : DATE_TIME_FORMAT}>{value}</Moment>;
    };

    const defaultColumn = useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
        }),
        [],
    );

    const columns = useMemo(
        () => [
            {
                Header: 'App',
                accessor: 'app',
                Filter: SelectColumnFilter,
                filter: 'includes',
            },
            {
                Header: 'Title',
                accessor: 'title',
            },
            {
                Header: 'URL',
                accessor: 'url',
            },
            {
                Header: 'Begin',
                accessor: 'beginDate',
                Cell: dateToValue,
            },
            {
                Header: 'End',
                accessor: 'endDate',
                Cell: dateToValue,
            },
            {
                Header: 'Dur',
                accessor: record => diffAndFormatShort(record.beginDate, record.endDate),
                Footer: info => {
                    const total = useMemo(() => calculateTotal(info.data), [info.data]);
                    return <TotalCount>Total: {total}</TotalCount>;
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const filterTypes = useMemo(
        () => ({
            // Add a new fuzzyTextFilterFn filter type.
            fuzzyText: fuzzyTextFilterFn,
            // Or, override the default text filter to use
            // "startWith"
            text: (rows, id, filterValue) => {
                return rows.filter(row => {
                    const rowValue = row.values[id];
                    return rowValue !== undefined
                        ? String(rowValue)
                              .toLowerCase()
                              .startsWith(String(filterValue).toLowerCase())
                        : true;
                });
            },
        }),
        [],
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        footerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        setAllFilters,
        setSortBy,
        selectedFlatRows,
        state: { pageIndex, pageSize, selectedRowIds },
    } = useTable(
        { columns, defaultColumn, filterTypes, data },
        useFilters,
        useSortBy,
        usePagination,
        useRowSelect,
        hooks => {
            hooks.visibleColumns.push(columns => [
                {
                    id: 'selection',

                    Header: ({ getToggleAllRowsSelectedProps }) => (
                        <div>
                            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                        </div>
                    ),

                    Cell: ({ row }) => (
                        <div>
                            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                        </div>
                    ),
                },
                ...columns,
            ]);
        },
    );

    const isOneDay = checkIfOneDay(visibleTimerange);

    return (
        <div>
            <Portal containerRef={resetButtonsRef}>
                <TrackItemTableButtons
                    {...{ setAllFilters, setSortBy, selectedFlatRows, selectedRowIds }}
                />
            </Portal>

            <Table {...getTableProps()}>
                <Thead>
                    {headerGroups.map(headerGroup => (
                        <Tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <Th {...column.getHeaderProps()} isNumeric={column.isNumeric}>
                                    {column.name}
                                    <Flex alignItems="center">
                                        <Button variant="ghost" {...column.getSortByToggleProps()}>
                                            {column.render('Header')}
                                            <Box pl="4">
                                                {column.isSorted ? (
                                                    column.isSortedDesc ? (
                                                        <TriangleDownIcon aria-label="sorted descending" />
                                                    ) : (
                                                        <TriangleUpIcon aria-label="sorted ascending" />
                                                    )
                                                ) : null}
                                            </Box>
                                        </Button>
                                        <Box flex={1} />
                                        {column.canFilter ? column.render('Filter') : null}
                                    </Flex>
                                </Th>
                            ))}
                        </Tr>
                    ))}
                </Thead>
                <Tbody {...getTableBodyProps()}>
                    {page.map(row => {
                        prepareRow(row);
                        return (
                            <Tr {...row.getRowProps()}>
                                {row.cells.map(cell => (
                                    <Td {...cell.getCellProps()} isNumeric={cell.column.isNumeric}>
                                        {cell.render('Cell')}
                                    </Td>
                                ))}
                            </Tr>
                        );
                    })}
                </Tbody>
                <Tfoot>
                    {footerGroups.map(group => (
                        <Tr {...group.getFooterGroupProps()}>
                            {group.headers.map(column => (
                                <Td {...column.getFooterProps()}>{column.render('Footer')}</Td>
                            ))}
                        </Tr>
                    ))}
                </Tfoot>
            </Table>

            <TrackItemTablePager
                {...{
                    gotoPage,
                    canPreviousPage,
                    previousPage,
                    pageIndex,
                    pageOptions,
                    pageSize,
                    nextPage,
                    canNextPage,
                    pageCount,
                    setPageSize,
                }}
            />
        </div>
    );
};
