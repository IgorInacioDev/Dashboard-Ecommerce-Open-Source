"use client"

import { SessionDataType } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import CellWithCopy from "./components/CellWithCopy"

// Função para calcular tempo relativo
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const createdAt = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s atrás`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m atrás`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h atrás`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d atrás`;
  }
};

export const sessionsHistoryColumns: ColumnDef<SessionDataType>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <CellWithCopy 
        value={row.getValue("status")} 
        columnId="status"
      />
    ),
  },
  {
    accessorKey: "ip",
    header: "IP",
  },
  {
    accessorKey: "utm_medium",
    header: "UTM Medium",
    cell: ({ row }) => {
      const value = row.getValue("utm_medium") as string;
      const decodedValue = value ? decodeURIComponent(value) : "-";
      return (
        <CellWithCopy 
          value={decodedValue} 
          columnId="utm_medium"
        />
      );
    },
  },
  {
    accessorKey: "utm_content",
    header: "UTM Content",
    cell: ({ row }) => {
      const value = row.getValue("utm_content") as string;
      const decodedValue = value ? decodeURIComponent(value) : "-";
      return (
        <CellWithCopy 
          value={decodedValue} 
          columnId="utm_content"
        />
      );
    },
  },
  {
    accessorKey: "utm_term",
    header: "UTM Term",
    cell: ({ row }) => {
      const value = row.getValue("utm_term") as string;
      const decodedValue = value ? decodeURIComponent(value) : "-";
      return (
        <CellWithCopy 
          value={decodedValue} 
          columnId="utm_term"
        />
      );
    },
  },
  {
    accessorKey: "lastPage",
    header: "Last Page",
    cell: ({ row }) => {
      const value = row.getValue("lastPage") as string;
      return (
        <div 
          className="max-w-[200px] truncate" 
          title={value}
        >
          {value || "-"}
        </div>
      );
    },
    size: 200,
    maxSize: 200,
  },
  {
    accessorKey: "createOrder",
    header: "Create Order",
    cell: ({ row }) => (
      <CellWithCopy 
        value={row.getValue("createOrder")} 
        columnId="createOrder"
      />
    ),
  },
  {
    accessorKey: "deviceType",
    header: "Device Type",
  },
  {
    accessorKey: "fingerPrint",
    header: "Finger Print",
    cell: ({ row }) => (
      <CellWithCopy 
        value={row.getValue("fingerPrint")} 
        columnId="fingerPrint"
      />
    ),
  },
  {
    accessorKey: "metadata",
    header: "Metadata",
    cell: ({ row }) => (
      <CellWithCopy 
        value={row.getValue("metadata")} 
        columnId="metadata"
      />
    ),
  },
  {
    accessorKey: "CreatedAt",
    header: "Criado em",
    cell: ({ row }) => {
      const dateValue = row.getValue("CreatedAt") as string;
      return dateValue ? getTimeAgo(dateValue) : "-";
    },
  },
  {
    accessorKey: "UpdatedAt",
    header: "Atualizado em",
    cell: ({ row }) => {
      const dateValue = row.getValue("UpdatedAt") as string;
      return dateValue ? getTimeAgo(dateValue) : "-";
    },
  }
]
