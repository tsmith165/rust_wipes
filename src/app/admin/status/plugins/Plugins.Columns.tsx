'use client';

import { ColumnDef } from '@tanstack/react-table';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { VersionComparisonResult } from '@/app/api/cron/check-plugins/Plugin.Versions';

export const columns: ColumnDef<VersionComparisonResult>[] = [
    // Status Icon Column
    {
        id: 'status',
        header: 'Status',
        enableSorting: true,
        accessorFn: (row) => !row.needsUpdate, // Convert needsUpdate to boolean for sorting
        cell: ({ row }) => {
            const plugin = row.original;
            const isUpToDate = !plugin.needsUpdate;

            return (
                <div className="flex items-center justify-center">
                    <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full p-1 ${
                            isUpToDate ? 'bg-green-500' : 'bg-red-500'
                        }`}
                    >
                        {isUpToDate ? <FaCheckCircle className="h-4 w-4 text-white" /> : <FaTimesCircle className="h-4 w-4 text-white" />}
                    </div>
                </div>
            );
        },
    },
    // Name Column
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <div className="font-medium text-stone-300">{row.getValue('name')}</div>,
        enableHiding: false,
    },
    // Author Column (hidden by default)
    {
        accessorKey: 'author',
        header: 'Author',
        cell: ({ row }) => <div className="font-medium text-stone-300">{row.getValue('author')}</div>,
        enableHiding: true,
    },
    // Current Version Column
    {
        accessorKey: 'currentVersion',
        header: 'Current Version',
        cell: ({ row }) => {
            const plugin = row.original;
            return (
                <div className={` ${plugin.needsUpdate ? 'font-bold text-red-500' : 'font-medium text-green-500'}`}>
                    {plugin.currentVersion}
                </div>
            );
        },
    },
    // Expected Version Column
    {
        accessorKey: 'expectedVersion',
        header: 'Expected Version',
        cell: ({ row }) => <div className="text-blue-500">{row.getValue('expectedVersion')}</div>,
    },
    // Highest Version Column
    {
        accessorKey: 'highestSeenVersion',
        header: 'Highest Version',
        cell: ({ row }) => <div className="text-purple-500">{row.getValue('highestSeenVersion')}</div>,
    },
];
