import { ColumnDef } from "@tanstack/react-table"

export interface SessionDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export interface CellWithCopyProps {
  value: unknown
  columnId?: string
}

export interface MetadataViewerProps {
  metadata: Record<string, unknown>
}