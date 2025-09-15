"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  getPaginationRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SessionDataTableProps } from "./interface/interfaces"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTablePagination } from "@/components/TablePagination"


export function SessionDataTable<TData, TValue>({
  columns,
  data,
}: SessionDataTableProps<TData, TValue>) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Renderização mobile com cards
  if (isMobile) {
    return (
      <div className="space-y-4">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row, index) => (
            <Card key={row.id} className="w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Session #{(table.getState().pagination.pageIndex * table.getState().pagination.pageSize) + index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {columns.map((column: ColumnDef<TData, TValue>, index: number) => {
                  const accessorKey = (column as { accessorKey?: string }).accessorKey;
                  const header = typeof column.header === 'string' ? column.header : `Column ${index + 1}`;
                  const value = accessorKey ? row.original[accessorKey as keyof typeof row.original] : null;
                  
                  let displayValue = String(value || '-');
                  
                  // Decodificar valores UTM
                  if (accessorKey && 
                      ['utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term'].includes(accessorKey) &&
                      value) {
                    try {
                      displayValue = decodeURIComponent(value as string);
                    } catch (e) {
                      displayValue = String(value);
                    }
                  }
                  
                  return (
                    <div key={accessorKey || index} className="flex justify-between items-start">
                      <span className="text-xs text-muted-foreground font-medium min-w-[80px]">
                        {header}:
                      </span>
                      <span className="text-xs text-right flex-1 ml-2 break-words">
                        {displayValue}
                      </span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No results.</p>
            </CardContent>
          </Card>
        )}
        <div className="mt-4">
          <DataTablePagination table={table} />
        </div>
      </div>
    )
  }

  // Renderização desktop com scroll horizontal melhorado
  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-md border bg-background">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const columnDef = header.column.columnDef as { size?: number; width?: number; maxWidth?: number };
                    const width = columnDef.size || columnDef.width;
                    const maxWidth = columnDef.maxWidth;
                    
                    return (
                      <TableHead 
                        key={header.id}
                        className="whitespace-nowrap px-4 py-3"
                        style={{
                          width: width ? `${width}px` : undefined,
                          maxWidth: maxWidth ? `${maxWidth}px` : undefined,
                          minWidth: '120px'
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const columnDef = cell.column.columnDef as { size?: number; width?: number; maxWidth?: number };
                      const width = columnDef.size || columnDef.width;
                      const maxWidth = columnDef.maxWidth;
                      
                      return (
                        <TableCell 
                          key={cell.id}
                          className="px-4 py-3 text-sm"
                          style={{
                            width: width ? `${width}px` : undefined,
                            maxWidth: maxWidth ? `${maxWidth}px` : undefined,
                            minWidth: '120px',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                          }}
                        >
                          <div className="max-w-[200px] truncate" title={String(cell.getValue() || '')}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="mt-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}