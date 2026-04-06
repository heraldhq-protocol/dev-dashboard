"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  // Memoize table options to prevent unnecessary re-renders
  const tableOptions = useMemo(
    () => ({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    }),
    [data, columns]
  );

  const table = useReactTable(tableOptions);

  const rows = table.getRowModel().rows;
  const headerGroups = table.getHeaderGroups();

  return (
    <div className="rounded-xl border border-border bg-card overflow-x-auto">
      <table className="w-full text-left text-sm text-text-secondary min-w-[600px]">
        <thead className="bg-card-2 text-xs uppercase tracking-widest text-text-muted">
          {headerGroups.map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-6 py-4 font-semibold">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length ? (
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-card-2/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-text-muted">
                No results found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}