'use client'

import { useQuery } from "@tanstack/react-query";
import {  SessionResponseType } from "@/types";
import { sessionsHistoryColumns } from "./columns";
import { getSessions } from "@/api/sessions/getSessions";
import { SessionDataTable } from "./session-data-table";

export default function AppSessionDataTable() {
  const { data } = useQuery<SessionResponseType>({
    queryKey: ['sessions'],
    queryFn: () => getSessions(),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 30000, // Polling a cada 30 segundos
    refetchIntervalInBackground: true, // Continua revalidando mesmo quando a aba não está ativa
  })

  const sessions = data?.list ? 
    [...data.list].sort((a, b) => {
      // Primeiro critério: status true primeiro
      if (a.status !== b.status) {
        return a.status ? -1 : 1; // true (-1) vem antes de false (1)
      }
      
      // Segundo critério: data mais recente primeiro (dentro do mesmo status)
      const createdA = new Date(a.CreatedAt || 0);
      const createdB = new Date(b.CreatedAt || 0);
      
      // Se UpdatedAt existe e é válido, usa ele, senão usa CreatedAt
      const updatedA = a.UpdatedAt && a.UpdatedAt !== null ? new Date(a.UpdatedAt) : createdA;
      const updatedB = b.UpdatedAt && b.UpdatedAt !== null ? new Date(b.UpdatedAt) : createdB;
      
      // Pega a data mais recente entre criação e atualização para cada sessão
      const mostRecentA = Math.max(createdA.getTime(), updatedA.getTime());
      const mostRecentB = Math.max(createdB.getTime(), updatedB.getTime());
      
      return mostRecentB - mostRecentA; // Mais recente primeiro
    }) : [];

  return (
    <div>
      <SessionDataTable columns={sessionsHistoryColumns} data={sessions} />
    </div>
  );
}