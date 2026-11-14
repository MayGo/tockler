import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { diffAndFormatShort, formatDurationInternal } from '../../utils';

import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import {
    Column,
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    RowData,
    SortingState,
    Updater,
    useReactTable,
} from '@tanstack/react-table';

import { Portal } from '@chakra-ui/react';
import { DATE_TIME_FORMAT } from '../../constants';
import { IndeterminateCheckbox } from './IndeterminateCheckbox';
import { OverflowTextCell } from './OverflowText';
import { SelectColumnFilter } from './SelectColumnFilter';
import { TextColumnFilter } from './TextColumnFilter';
import { containsAllWordsFilter, TableButtonsProps } from './TrackItemTable.utils';
import { TrackItemTablePager } from './TrackItemTablePager';

import { differenceInMilliseconds, format } from 'date-fns';
import { ITrackItem } from '../../@types/ITrackItem';
import { TIME_FORMAT } from '../../constants';

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        Filter?: React.ComponentType<{ column: Column<TData, TValue> }>;
    }
}

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
    /** Shown above the footer totals, e.g. to explain filtering applied outside the table. */
    footerNote?: React.ReactNode;
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
    footerNote,
}: ItemsTableProps) => {
    const dateToValue = useCallback(
        ({ cell }) => format(cell.getValue() as number, isOneDay ? TIME_FORMAT : DATE_TIME_FORMAT),
        [isOneDay],
    );

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
                filterFn: 'equalsString',
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
                filterFn: containsAllWordsFilter,
                enableColumnFilter: !isSearchTable,
                size: 250,
                minSize: 100,
                maxSize: 500,
            },
            {
                header: 'URL',
                accessorKey: 'url',
                cell: (info) => <OverflowTextCell value={info.getValue() as string} />,
                filterFn: containsAllWordsFilter,
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
                id: 'duration',
                header: 'Duration',
                // Sort by the number of milliseconds, not by the formatted text.
                accessorFn: (record: ITrackItem) => record.endDate - record.beginDate,
                cell: ({ row }) => diffAndFormatShort(row.original.beginDate, row.original.endDate),
                enableColumnFilter: false,
                enableSorting: !manualSortBy,
                size: 60,
                minSize: 60,
                maxSize: 80,
            },
            ...extraColumns,
        ],
        [extraColumns, dateToValue, manualSortBy, isSearchTable],
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

    // New filters or sort order make the current page meaningless, so start from the first page.
    const handleColumnFiltersChange = useCallback((updater: Updater<ColumnFiltersState>) => {
        setColumnFilters(updater);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, []);
    const handleSortingChange = useCallback(
        (updater: Updater<SortingState>) => {
            setSorting(updater);
            if (!isSearchTable) {
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }
        },
        [isSearchTable],
    );

    // Configure the table
    const table = useReactTable({
        data,
        columns,
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
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: handleColumnFiltersChange,
        onPaginationChange: setPagination,
        // Live view replaces `data` every few seconds; keep the page the user is on.
        autoResetPageIndex: false,
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

    // Drop selected rows that no longer exist (deleted, or outside the new range). Keep the rest.
    useEffect(() => {
        const ids = new Set(data.map((item) => item.id?.toString()));
        setRowSelection((prev) => {
            const kept = Object.fromEntries(Object.entries(prev).filter(([id]) => ids.has(id)));
            return Object.keys(kept).length === Object.keys(prev).length ? prev : kept;
        });
    }, [data]);

    // Data can shrink under the current page (live view, deletes); go to the last page that exists.
    const pageCount = table.getPageCount();
    useEffect(() => {
        if (!isSearchTable && pageCount > 0 && pagination.pageIndex >= pageCount) {
            setPagination((prev) => ({ ...prev, pageIndex: pageCount - 1 }));
        }
    }, [isSearchTable, pageCount, pagination.pageIndex]);

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
    const selectedRows = table.getSelectedRowModel().rows;
    const tableButtonsProps: TableButtonsProps = {
        selectedFlatRows: selectedRows,
        selectedRowIds: Object.fromEntries(selectedRows.map((row) => [row.id, true])),
        setAllFilters: () => setColumnFilters([]),
        setSortBy: (sortByState: SortingState) => setSorting(sortByState),
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        fetchData,
    };

    const hasFilters = table.getAllLeafColumns().some((column) => column.getCanFilter());
    const isFiltered = columnFilters.length > 0;
    const visibleRows = table.getRowModel().rows;

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
                                        </Flex>
                                    )}
                                </Th>
                            ))}
                        </Tr>
                    ))}
                    {hasFilters && (
                        <Tr>
                            {table.getLeafHeaders().map((header) => {
                                const Filter = header.column.columnDef.meta?.Filter ?? TextColumnFilter;
                                return (
                                    <Th key={header.id} pt={0} pb={3}>
                                        {header.column.getCanFilter() && <Filter column={header.column} />}
                                    </Th>
                                );
                            })}
                        </Tr>
                    )}
                </Thead>
                <Tbody>
                    {visibleRows.length === 0 && (
                        <Tr>
                            <Td colSpan={table.getLeafHeaders().length} textAlign="center" color="gray.500" py={8}>
                                {isFiltered || data.length > 0 ? 'No items match the filters.' : 'No items.'}
                            </Td>
                        </Tr>
                    )}
                    {visibleRows.map((row) => (
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
            <Box display="flex" justifyContent="end" alignItems="center" pt={5}>
                {footerNote && (
                    <Box pr={5} color="gray.500" fontSize="sm">
                        {footerNote}
                    </Box>
                )}
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
