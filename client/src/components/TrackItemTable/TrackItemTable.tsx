// tslint:disable-next-line: no-submodule-imports

import React, { useState, useRef, useEffect } from 'react';
import Moment from 'react-moment';
import { DATE_TIME_FORMAT, TIME_FORMAT } from '../../constants';
import { TrackItemType } from '../../enum/TrackItemType';
import { diffAndFormatShort } from '../../utils';
import { filterItems } from '../Timeline/timeline.utils';
import { TotalCount } from './TrackItemTable.styles';
import { Logger } from '../../logger';
import { deleteByIds } from '../../services/trackItem.api';
import { checkIfOneDay } from '../../timeline.util';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { Box, Flex, Text } from '@chakra-ui/layout';
import { Button, IconButton } from '@chakra-ui/button';
import { Table, Tbody, Td, Tfoot, Th, Thead, Tr } from '@chakra-ui/table';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TriangleDownIcon,
    TriangleUpIcon,
} from '@chakra-ui/icons';
import { useTable, useSortBy, usePagination, useFilters, useRowSelect } from 'react-table';
import { chakra } from '@chakra-ui/system';
import { Tooltip } from '@chakra-ui/tooltip';
import { Select } from '@chakra-ui/select';
import {
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
} from '@chakra-ui/number-input';
import { calculateTotal, fuzzyTextFilterFn } from './TrackItemTable.utils';
import { SelectColumnFilter } from './SelectColumnFilter';
import { DefaultColumnFilter } from './DefaultColumnFilter';
import { IndeterminateCheckbox } from './IndeterminateCheckbox';

export const TrackItemTable = () => {
    const timeItems = useStoreState(state => state.timeItems);
    const visibleTimerange = useStoreState(state => state.visibleTimerange);
    const fetchTimerange = useStoreActions(actions => actions.fetchTimerange);

    const dateToValue = ({ value }) => {
        return <Moment format={isOneDay ? TIME_FORMAT : DATE_TIME_FORMAT}>{value}</Moment>;
    };

    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
        }),
        [],
    );

    const columns = React.useMemo(
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
                    const total = React.useMemo(() => calculateTotal(info.data), [info.data]);
                    return <TotalCount>Total: {total}</TotalCount>;
                },
            },
        ],
        [],
    );

    const filterTypes = React.useMemo(
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
        { columns, defaultColumn, filterTypes, data: timeItems.appItems },
        useFilters,
        useSortBy,
        usePagination,
        useRowSelect,
        hooks => {
            hooks.visibleColumns.push(columns => [
                // Let's make a column for selection
                {
                    id: 'selection',
                    // The header can use the table's getToggleAllRowsSelectedProps method
                    // to render a checkbox
                    Header: ({ getToggleAllRowsSelectedProps }) => (
                        <div>
                            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                        </div>
                    ),
                    // The cell can use the individual row's getToggleRowSelectedProps method
                    // to the render a checkbox
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

    const deleteTimelineItems = async ids => {
        Logger.debug('Delete timeline items', ids);

        if (ids) {
            await deleteByIds(ids);
            Logger.debug('Deleted timeline items', ids);
            fetchTimerange();
        } else {
            Logger.error('No ids, not deleting from DB');
        }
    };

    const filterByAppType = type =>
        type === TrackItemType.AppTrackItem
            ? filterItems(timeItems.appItems, visibleTimerange)
            : filterItems(timeItems.logItems, visibleTimerange);

    const deleteSelectedItems = () => {
        deleteTimelineItems(selectedFlatRows.map(({ original }) => original.id));
    };

    const isOneDay = checkIfOneDay(visibleTimerange);
    const hasSelected = Object.keys(selectedRowIds).length > 0;

    return (
        <div>
            <Flex p={1}>
                <Box pr={1}>
                    {hasSelected && (
                        <Button
                            variant="solid"
                            onClick={deleteSelectedItems}
                            disabled={!hasSelected}
                        >
                            Delete <b> {Object.keys(selectedRowIds).length} </b> items
                        </Button>
                    )}
                </Box>
                <Box pr={1}>
                    <Button onClick={() => setAllFilters([])}>Clear filters</Button>
                </Box>
                <Box pr={1}>
                    <Button
                        onClick={() => {
                            setSortBy([]);
                            setAllFilters([]);
                        }}
                    >
                        Clear filters and sorters
                    </Button>
                </Box>
            </Flex>
            <Flex p={1}>
                <Box pr={1} />
            </Flex>

            <Table {...getTableProps()}>
                <Thead>
                    {headerGroups.map(headerGroup => (
                        <Tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <Th
                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                    isNumeric={column.isNumeric}
                                >
                                    {column.render('Header')}
                                    <chakra.span pl="4">
                                        {column.isSorted ? (
                                            column.isSortedDesc ? (
                                                <TriangleDownIcon aria-label="sorted descending" />
                                            ) : (
                                                <TriangleUpIcon aria-label="sorted ascending" />
                                            )
                                        ) : null}
                                    </chakra.span>
                                    <div>{column.canFilter ? column.render('Filter') : null}</div>
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
            <Flex justifyContent="space-between" m={4} alignItems="center">
                <Flex>
                    <Tooltip label="First Page">
                        <IconButton
                            aria-label="First Page"
                            onClick={() => gotoPage(0)}
                            isDisabled={!canPreviousPage}
                            icon={<ArrowLeftIcon h={3} w={3} />}
                            mr={4}
                        />
                    </Tooltip>
                    <Tooltip label="Previous Page">
                        <IconButton
                            aria-label="Previous Page"
                            onClick={previousPage}
                            isDisabled={!canPreviousPage}
                            icon={<ChevronLeftIcon h={6} w={6} />}
                        />
                    </Tooltip>
                </Flex>

                <Flex alignItems="center">
                    <Text flexShrink={0} mr={8}>
                        Page{' '}
                        <Text fontWeight="bold" as="span">
                            {pageIndex + 1}
                        </Text>{' '}
                        of{' '}
                        <Text fontWeight="bold" as="span">
                            {pageOptions.length}
                        </Text>
                    </Text>
                    <Text flexShrink={0}>Go to page:</Text>{' '}
                    <NumberInput
                        ml={2}
                        mr={8}
                        w={28}
                        min={1}
                        max={pageOptions.length}
                        onChange={value => {
                            const page = value ? value - 1 : 0;
                            gotoPage(page);
                        }}
                        defaultValue={pageIndex + 1}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    <Select
                        w={32}
                        value={pageSize}
                        onChange={e => {
                            setPageSize(Number(e.target.value));
                        }}
                    >
                        {[10, 20, 30, 40, 50].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                Show {pageSize}
                            </option>
                        ))}
                    </Select>
                </Flex>

                <Flex>
                    <Tooltip label="Next Page">
                        <IconButton
                            aria-label="Next Page"
                            onClick={nextPage}
                            isDisabled={!canNextPage}
                            icon={<ChevronRightIcon h={6} w={6} />}
                        />
                    </Tooltip>
                    <Tooltip label="Last Page">
                        <IconButton
                            aria-label="Last Page"
                            onClick={() => gotoPage(pageCount - 1)}
                            isDisabled={!canNextPage}
                            icon={<ArrowRightIcon h={3} w={3} />}
                            ml={4}
                        />
                    </Tooltip>
                </Flex>
            </Flex>
        </div>
    );
};
