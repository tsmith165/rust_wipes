'use client';

import * as React from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { FaSync } from 'react-icons/fa';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { VersionComparisonResult } from '@/app/api/cron/check/plugins/Plugin.Versions';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

interface PluginsTableProps {
    data: VersionComparisonResult[];
    columns: ColumnDef<VersionComparisonResult>[];
    onRefresh: () => void;
    isRefreshing: boolean;
}

export function PluginsTable({ data, columns, onRefresh, isRefreshing }: PluginsTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
        author: false, // Hide author column by default
    });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    });

    // Debug logging
    React.useEffect(() => {
        console.log('Status column config:', table.getColumn('status')?.getCanSort());
        console.log(
            'All columns:',
            table.getAllColumns().map((col) => ({ id: col.id, canSort: col.getCanSort() })),
        );
        console.log('Current sorting state:', sorting);
    }, [table, sorting]);

    return (
        <div className="flex w-full flex-col space-y-4">
            {/* Table Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-2">
                    {/* Refresh Button */}
                    {onRefresh && (
                        <motion.button
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className="flex-end group flex h-10 items-center justify-center space-x-2 rounded-lg bg-stone-300 px-3 py-2 text-stone-900 transition-colors hover:bg-stone-600"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FaSync
                                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : 'transition-transform group-hover:rotate-180'}`}
                            />
                        </motion.button>
                    )}

                    {/* Search Bar */}
                    <Input
                        placeholder="Search plugin names..."
                        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            table.getColumn('name')?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm p-2 text-stone-300"
                    />
                </div>

                <div className="flex items-end gap-2">
                    {/* Active Columns Dropdown Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto bg-stone-600 text-stone-300 hover:bg-stone-700">
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-stone-900 text-stone-300">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value: boolean) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table */}
            <div className="relative h-[500px] rounded-md border border-stone-700">
                <div className="absolute inset-0 overflow-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const columnWidth =
                                            header.column.id === 'status'
                                                ? 'w-[60px] min-w-[60px]'
                                                : header.column.id === 'name'
                                                  ? 'w-[200px] min-w-[200px]'
                                                  : 'w-[calc((100%-260px)/4)] min-w-[120px]';

                                        return (
                                            <TableHead
                                                key={header.id}
                                                className={`select-none ${columnWidth}`}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div className="flex items-center space-x-2">
                                                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                                        {header.column.getCanSort() && (
                                                            <span className="ml-1">
                                                                {{
                                                                    asc: <FaSortUp className="h-4 w-4" />,
                                                                    desc: <FaSortDown className="h-4 w-4" />,
                                                                }[header.column.getIsSorted() as string] ?? (
                                                                    <FaSort className="h-4 w-4 opacity-50" />
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                        {row.getVisibleCells().map((cell) => {
                                            const columnWidth =
                                                cell.column.id === 'status'
                                                    ? 'w-[60px] min-w-[60px]'
                                                    : cell.column.id === 'name'
                                                      ? 'w-[250px] min-w-[250px]'
                                                      : 'w-[calc((100%-310px)/4)] min-w-[120px]';

                                            return (
                                                <TableCell key={cell.id} className={columnWidth}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No plugins found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
