// tslint:disable-next-line: no-submodule-imports

import { useEffect, useMemo } from 'react';
import { diffAndFormatShort, formatDurationInternal } from '../../utils';

import { Box, Flex } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { useTable, useSortBy, usePagination, useFilters, useRowSelect } from 'react-table';

import { calculateTotal, fuzzyTextFilterFn } from './TrackItemTable.utils';
import { SelectColumnFilter } from './SelectColumnFilter';
import { DefaultColumnFilter } from './DefaultColumnFilter';
import { IndeterminateCheckbox } from './IndeterminateCheckbox';
import { Portal } from '@chakra-ui/react';
import { TrackItemTableButtons } from './TrackItemTableButtons';
import { TrackItemTablePager } from './TrackItemTablePager';
import { OverflowTextCell } from './OverflowText';

interface ItemsTableProps {
    data: any[];
    resetButtonsRef?: any;
    isOneDay: boolean;
    isSearchTable: boolean;
    pageCount?: number;
    pageIndex?: number;
    fetchData?: any;
    extraColumns?: any[];
    total: number;
    manualSortBy: boolean;
}

export const ItemsTable = ({
    data,
    resetButtonsRef,
    isSearchTable,
    pageCount: controlledPageCount,
    pageIndex: controlledPageIndex,
    fetchData,
    extraColumns = [],
    total,
    manualSortBy = false,
}: ItemsTableProps) => {
    const dateToValue = ({ value }) => {
        return value;
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
                width: 100,
                minWidth: 100,
                maxWidth: 120,
            },
            {
                Header: 'Title',
                accessor: 'title',
                Cell: OverflowTextCell,
                width: 250,
                minWidth: 100,
                maxWidth: 500,
            },
            {
                Header: 'URL',
                accessor: 'url',
                Cell: OverflowTextCell,
                width: 150,
                minWidth: 70,
                maxWidth: 400,
            },
            {
                Header: 'Begin',
                accessor: 'beginDate',
                Cell: dateToValue,
                width: 80,
                minWidth: 80,
                maxWidth: 120,
            },
            {
                Header: 'End',
                accessor: 'endDate',
                Cell: dateToValue,
                width: 80,
                minWidth: 80,
                maxWidth: 120,
            },
            {
                Header: 'Duration',
                disableSortBy: manualSortBy,
                accessor: (record) => diffAndFormatShort(record.beginDate, record.endDate),
                width: 80,
                minWidth: 80,
                maxWidth: 80,
            },
            ...extraColumns,
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
                return rows.filter((row) => {
                    const rowValue = row.values[id];
                    return rowValue !== undefined
                        ? String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase())
                        : true;
                });
            },
        }),
        [],
    );

    const pagingProps = isSearchTable
        ? {
              initialState: { pageIndex: controlledPageIndex },
              disableFilters: true,
              manualPagination: true,
              pageCount: controlledPageCount,
          }
        : {};

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
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
        state: { pageIndex, pageSize, selectedRowIds, sortBy },
    } = useTable(
        {
            columns,
            defaultColumn,
            filterTypes,
            data,
            manualSortBy,
            ...pagingProps,
        },
        useFilters,
        useSortBy,
        usePagination,
        useRowSelect,
        (hooks) => {
            hooks.visibleColumns.push((columns) => [
                {
                    id: 'selection',
                    width: 10,
                    minWidth: 10,
                    maxWidth: 10,

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

    useEffect(() => {
        if (isSearchTable) {
            console.info('Change paging', { pageIndex, pageSize, sortBy });
            fetchData({ pageIndex, pageSize, sortBy });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageIndex, pageSize]);

    useEffect(() => {
        if (manualSortBy) {
            fetchData({ pageIndex, pageSize, sortBy });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchData, sortBy, manualSortBy]);

    const subTotal = useMemo(() => calculateTotal(data), [data]);

    return (
        <>
            <Portal containerRef={resetButtonsRef}>
                {!isSearchTable && (
                    <TrackItemTableButtons {...{ setAllFilters, setSortBy, selectedFlatRows, selectedRowIds }} />
                )}
            </Portal>

            <Table {...getTableProps()}>
                <Thead>
                    {headerGroups.map((headerGroup) => {
                        const { key, ...rest } = headerGroup.getHeaderGroupProps();
                        return (
                            <Tr key={key} {...rest}>
                                {headerGroup.headers.map((column) => (
                                    <Th
                                        {...column.getHeaderProps({
                                            style: {
                                                minWidth: column.minWidth,
                                                width: column.width,
                                                maxWidth: column.maxWidth,
                                            },
                                        })}
                                        isNumeric={column.isNumeric}
                                    >
                                        {column.name}
                                        {column.id === 'selection' && column.render('Header')}
                                        {column.id !== 'selection' && (
                                            <Flex alignItems="center">
                                                <Button
                                                    variant="ghost"
                                                    fontWeight="bold"
                                                    {...column.getSortByToggleProps()}
                                                >
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
                                        )}
                                    </Th>
                                ))}
                            </Tr>
                        );
                    })}
                </Thead>
                <Tbody {...getTableBodyProps()}>
                    {page.map((row) => {
                        prepareRow(row);
                        return (
                            <Tr {...row.getRowProps()}>
                                {row.cells.map((cell) => (
                                    <Td {...cell.getCellProps()} isNumeric={cell.column.isNumeric}>
                                        {cell.render('Cell')}
                                    </Td>
                                ))}
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>
            <Box display="flex" justifyContent="end" pt={5}>
                <Box pr={5} whiteSpace={'nowrap'}>
                    Total: {subTotal} / <b>{formatDurationInternal(total)}</b>
                </Box>
            </Box>

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
        </>
    );
};
