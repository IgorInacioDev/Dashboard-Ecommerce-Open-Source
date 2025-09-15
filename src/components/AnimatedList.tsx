'use client'

import React, { useRef, useState, useEffect, ReactNode, MouseEventHandler } from 'react';
import { motion, useInView } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { getRecentOrders } from '@/api/products';
import { TbBrandCashapp } from "react-icons/tb";

interface OrderData {
  CreatedAt: string;
  UpdatedAt?: string | null;
}

// Função para calcular tempo relativo baseado na data mais recente
const getTimeAgo = (order: OrderData): string => {
  const now = new Date();
  const createdAt = new Date(order.CreatedAt);
  const updatedAt = order.UpdatedAt && order.UpdatedAt !== null ? new Date(order.UpdatedAt) : createdAt;
  
  // Usa a data mais recente entre criação e atualização
  const mostRecentDate = updatedAt.getTime() > createdAt.getTime() ? updatedAt : createdAt;
  const diffInSeconds = Math.floor((now.getTime() - mostRecentDate.getTime()) / 1000);
  
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

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className="mb-4 cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListProps {
  items?: string[];
  onItemSelect?: (item: string, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  className = '',
  displayScrollbar = false,
  initialSelectedIndex = -1
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false);

  const { data } = useQuery({
    queryKey: ['orders'],
    queryFn: () => getRecentOrders(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  })

  const orders = (data?.list || []).sort((a, b) => {
    // Considera tanto CreatedAt quanto UpdatedAt, priorizando o mais recente
    const createdA = new Date(a.CreatedAt || 0);
    const createdB = new Date(b.CreatedAt || 0);
    
    // Se UpdatedAt existe e é válido, usa ele, senão usa CreatedAt
    const updatedA = a.UpdatedAt && a.UpdatedAt !== null ? new Date(a.UpdatedAt) : createdA;
    const updatedB = b.UpdatedAt && b.UpdatedAt !== null ? new Date(b.UpdatedAt) : createdB;
    
    // Pega a data mais recente entre criação e atualização para cada pedido
    const mostRecentA = Math.max(createdA.getTime(), updatedA.getTime());
    const mostRecentB = Math.max(createdB.getTime(), updatedB.getTime());
    
    return mostRecentB - mostRecentA; // Mais recente primeiro
  });

  console.log(orders)

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: 'smooth'
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className={`relative w-[500px] ${className}`}>
      <div
        ref={listRef}
        className={`max-h-[400px] overflow-y-auto p-4 ${
          displayScrollbar
            ? '[&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#060010] [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-thumb]:rounded-[4px]'
            : 'scrollbar-hide'
        }`}
        style={{
          scrollbarWidth: displayScrollbar ? 'thin' : 'none',
          scrollbarColor: '#222 #060010'
        }}
      >
        {orders?.map((order, index) => (
          <AnimatedItem
            key={index}
            delay={0.1}
            index={index}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => { }}
          >
          <div className={`p-4 border-[#FDF9EF] bg-primary-foreground/30 rounded-md border items-center flex justify-between`} >
            <TbBrandCashapp className="w-6 h-6 text-[#539463]" />

            <div className='flex text-center items-center gap-4 font-bold text-xs text-[#FDF9EF]'>
              Order {order.Id} is
              <h1 className={`font-bold text-xs tracking-widest uppercase m-0 ${
                order.status === 'waiting_payment' || order.status === 'pending' ? 'text-orange-500' :
                order.status === 'paid' ? 'text-green-500' :
                'text-[#645394]'
              }`}>{order.status === 'waiting_payment' ? 'pending' : order.status}</h1>
            </div>

            <span className='text-zinc-500 text-xs font-bold tracking-widest'>{getTimeAgo(order)}</span>
          </div>
          </AnimatedItem>
        ))}
      </div>
    </div>
  );
};

export default AnimatedList;
