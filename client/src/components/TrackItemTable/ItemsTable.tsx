import React, { useEffect, useMemo, useState } from 'react';
import { diffAndFormatShort, formatDurationInternal } from '../../utils';

import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import {
    ColumnDef,
    ColumnFiltersState,
    FilterFn,
    flexRender,
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';

import { Portal } from '@chakra-ui/react';
import { DATE_TIME_FORMAT } from '../../constants';
import { DefaultColumnFilter } from './DefaultColumnFilter';
import { IndeterminateCheckbox } from './IndeterminateCheckbox';
import { OverflowTextCell } from './OverflowText';
import { SelectColumnFilter } from './SelectColumnFilter';
import { fuzzyTextFilterFn, TableButtonsProps } from './TrackItemTable.utils';
import { TrackItemTablePager } from './TrackItemTablePager';

import { differenceInMilliseconds, format } from 'date-fns';
import { ITrackItem } from '../../@types/ITrackItem';
import { TIME_FORMAT } from '../../constants';

interface ItemsTableProps {
    data: ITrackItem[];
    resetButtonsRef?: React.RefObject<HTMLDivElement>;
    isOneDay: boolean;
    isSearchTable: boolean;
    pageCount?: number;
    pageIndex?: number;
    fetchData?: (options: { pageIndex: number; pageSize: number; sortBy: SortingState }) => void;
    extraColumns?: ColumnDef<ITrackItem>[];
    sumTotal: number;
    manualSortBy: boolean;
    customTableButtons?: React.ReactElement<TableButtonsProps>;
}

const defaultSorting: SortingState = [
    {
        id: 'endDate',
        desc: true,
    },
];

export const ItemsTable = ({
    data,
    resetButtonsRef,
    isSearchTable,
    pageCount: controlledPageCount,
    pageIndex: controlledPageIndex,
    fetchData,
    extraColumns = [],
    sumTotal,
    manualSortBy = false,
    isOneDay,
    customTableButtons,
}: ItemsTableProps) => {
    const dateToValue = ({ cell }) => {
        const value = cell.getValue() as number;
        return format(value, isOneDay ? TIME_FORMAT : DATE_TIME_FORMAT);
    };

    const columns = useMemo<ColumnDef<ITrackItem>[]>(
        () => [
            {
                id: 'selection',
                header: ({ table }) => (
                    <IndeterminateCheckbox
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        onChange={(e) => table.toggleAllRowsSelected(e.target.checked)}
                    />
                ),
                cell: ({ row }) => (
                    <IndeterminateCheckbox
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        indeterminate={row.getIsSomeSelected()}
                        onChange={(e) => row.toggleSelected(e.target.checked)}
                    />
                ),
                enableSorting: false,
                size: 10,
                minSize: 10,
                maxSize: 10,
            },
            {
                header: 'App',
                accessorKey: 'app',
                filterFn: 'includesString',
                enableColumnFilter: !isSearchTable,
                meta: {
                    Filter: SelectColumnFilter,
                },
                size: 100,
                minSize: 100,
                maxSize: 120,
            },
            {
                header: 'Title',
                accessorKey: 'title',
                cell: (info) => <OverflowTextCell value={info.getValue() as string} />,
                enableColumnFilter: !isSearchTable,
                size: 250,
                minSize: 100,
                maxSize: 500,
            },
            {
                header: 'URL',
                accessorKey: 'url',
                cell: (info) => <OverflowTextCell value={info.getValue() as string} />,
                enableColumnFilter: !isSearchTable,
                size: 150,
                minSize: 70,
                maxSize: 400,
            },
            {
                header: 'Begin',
                accessorKey: 'beginDate',
                cell: dateToValue,
                enableColumnFilter: false,
                size: 80,
                minSize: 80,
                maxSize: 120,
            },
            {
                header: 'End',
                accessorKey: 'endDate',
                cell: dateToValue,
                enableColumnFilter: false,
                size: 80,
                minSize: 80,
                maxSize: 120,
            },
            {
                header: 'Duration',
                accessorFn: (record: ITrackItem) => diffAndFormatShort(record.beginDate, record.endDate),
                enableColumnFilter: false,
                enableSorting: !manualSortBy,
                size: 60,
                minSize: 60,
                maxSize: 80,
            },
            ...extraColumns,
        ],
        [extraColumns, dateToValue, manualSortBy],
    );

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>(defaultSorting);
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: controlledPageIndex || 0,
        pageSize: 10,
    });

    // Use the state of the pagination when it is controlled from outside
    useEffect(() => {
        if (isSearchTable && typeof controlledPageIndex === 'number') {
            setPagination((prev) => ({
                ...prev,
                pageIndex: controlledPageIndex,
            }));
        }
    }, [isSearchTable, controlledPageIndex]);

    // Configure the table
    const table = useReactTable({
        data,
        columns,
        filterFns: {
            fuzzyText: fuzzyTextFilterFn as FilterFn<ITrackItem>,
        },
        state: {
            sorting,
            columnFilters,
            rowSelection,
            pagination,
        },
        enableRowSelection: true,
        enableMultiRowSelection: true,
        getRowId: (row: ITrackItem) => row.id?.toString(),
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(), //if you need a list of values for a column (other faceted row models depend on this one)
        getFacetedMinMaxValues: getFacetedMinMaxValues(), //if you need min/max values
        getFacetedUniqueValues: getFacetedUniqueValues(), //if you need a list o
        manualPagination: isSearchTable,
        manualSorting: manualSortBy,
        manualFiltering: isSearchTable,
        pageCount: isSearchTable
            ? typeof controlledPageCount === 'number' && controlledPageCount > 0
                ? Math.ceil(controlledPageCount / pagination.pageSize)
                : 0
            : undefined,
    });

    // Reset row selection when data changes
    useEffect(() => {
        setRowSelection({});
    }, [data]);

    // Handle server-side pagination
    useEffect(() => {
        if (isSearchTable) {
            console.info('Change paging', {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                sortBy: sorting,
            });
            fetchData?.({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize, sortBy: sorting });
        }
    }, [isSearchTable, fetchData, pagination, sorting]);

    // Handle server-side sorting
    useEffect(() => {
        if (manualSortBy && !isSearchTable) {
            fetchData?.({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize, sortBy: sorting });
        }
    }, [manualSortBy, fetchData, sorting, pagination, isSearchTable]);

    // Sum of all table data
    const subTotal = table
        .getFilteredRowModel()
        .rows.map((row) => row.original)
        .reduce((total, item) => total + differenceInMilliseconds(item.endDate, item.beginDate), 0);

    // Get the selected rows information for buttons/actions
    const tableButtonsProps: TableButtonsProps = {
        selectedFlatRows: table.getSelectedRowModel().rows,
        selectedRowIds: table.getState().rowSelection,
        setAllFilters: () => setColumnFilters([]),
        setSortBy: (sortByState: SortingState) => setSorting(sortByState),
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        fetchData,
    };

    return (
        <>
            <Portal containerRef={resetButtonsRef}>
                {customTableButtons && React.cloneElement(customTableButtons, tableButtonsProps)}
            </Portal>

            <Table>
                <Thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <Th
                                    key={header.id}
                                    style={{
                                        minWidth: header.column.getSize(),
                                        width: header.column.getSize(),
                                        maxWidth: header.column.columnDef.maxSize,
                                    }}
                                    isNumeric={false} // Set this based on column type if needed
                                >
                                    {header.column.id === 'selection' ? (
                                        flexRender(header.column.columnDef.header, header.getContext())
                                    ) : (
                                        <Flex alignItems="center">
                                            {header.column.getCanSort() ? (
                                                <Button
                                                    variant="ghost"
                                                    fontWeight="bold"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    <Box pl="4">
                                                        {{
                                                            asc: <TriangleUpIcon aria-label="sorted ascending" />,
                                                            desc: <TriangleDownIcon aria-label="sorted descending" />,
                                                        }[header.column.getIsSorted() as string] ?? null}
                                                    </Box>
                                                </Button>
                                            ) : (
                                                <Button variant="ghost" fontWeight="bold" disabled>
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </Button>
                                            )}
                                            <Box flex={1} />
                                            {header.column.getCanFilter() ? (
                                                // Use a safer type check and conditional rendering
                                                // @ts-expect-error - We know this is correct based on our column definitions
                                                header.column.columnDef.meta?.Filter ? (
                                                    // @ts-expect-error - We know this component exists
                                                    <header.column.columnDef.meta.Filter column={header.column} />
                                                ) : (
                                                    <DefaultColumnFilter column={header.column} />
                                                )
                                            ) : null}
                                        </Flex>
                                    )}
                                </Th>
                            ))}
                        </Tr>
                    ))}
                </Thead>
                <Tbody>
                    {table.getRowModel().rows.map((row) => (
                        <Tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <Td key={cell.id} isNumeric={false}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </Td>
                            ))}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            <Box display="flex" justifyContent="end" pt={5}>
                <Box pr={5} whiteSpace={'nowrap'}>
                    {formatDurationInternal(subTotal)} / <b>{formatDurationInternal(sumTotal)}</b>
                </Box>
            </Box>

            <TrackItemTablePager
                {...{
                    gotoPage: table.setPageIndex,
                    canPreviousPage: table.getCanPreviousPage(),
                    previousPage: table.previousPage,
                    pageIndex: pagination.pageIndex,
                    pageSize: pagination.pageSize,
                    nextPage: table.nextPage,
                    canNextPage: table.getCanNextPage(),
                    pageCount: table.getPageCount(),
                    setPageSize: table.setPageSize,
                }}
            />
        </>
    );
};
