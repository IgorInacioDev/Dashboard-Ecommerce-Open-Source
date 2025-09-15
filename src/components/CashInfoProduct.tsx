'use client';

import { getSalesMetrics, SalesMetrics } from "@/api/products/getSalesMetrics";
import CountUp from "@/blocks/TextAnimations/CountUp/CountUp";
import { useEffect, useState } from "react";

const CashInfoProduct = () => {
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesMetrics = async () => {
      try {
        const metrics = await getSalesMetrics();
        setSalesMetrics(metrics);
      } catch (error) {
        console.error('Erro ao carregar métricas de vendas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-[#FDF9EF] px-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="bg-primary-foreground/50 p-4 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-6 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!salesMetrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-[#FDF9EF] px-4">
        <div className="col-span-full text-center text-red-400">
          Erro ao carregar dados de vendas
        </div>
      </div>
    );
  }

  const salesData = [{
    title: "Total Sales",
    value: salesMetrics.totalSales || 0,
    bgColor: "bg-[#FDF9EF]",
    textColor: "text-[#b8cfac]"
  }, {
    title: "Total Paid Sales", 
    value: salesMetrics.totalPaidSales || 0,
    bgColor: "bg-[#FDF9EF]",
    textColor: "text-[#645394]"
  }, {
    title: "Total Orders",
    value: salesMetrics.totalOrders || 0,
    bgColor: "bg-[#FDF9EF]",
    textColor: "text-[#b8cfac]"
  }];

return (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-[#FDF9EF] px-4">
    {salesData.map((item, index) => (
      <div key={index} className={`bg-primary-foreground/50 p-4 rounded-lg`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[#FDF9EF] text-md font-bold">{item.title}</p>
            <div className={`flex gap-1 text-2xl font-bold ${item.textColor}`}>
              {item.title === "Total Orders" ? (
                <CountUp
                  from={0}
                  to={item.value}
                  separator=","
                  direction="up"
                  duration={1}
                  className={`count-up-text`}
                />
              ) : (
                <>
                  R$ 
                  <CountUp
                    from={0}
                    to={parseFloat(item.value.toFixed(2))}
                    separator=","
                    direction="up"
                    duration={1}
                    className={`count-up-text`}
                  />
                </>
              )}
            </div>
          </div>
          <div></div>
        </div>
      </div>
    ))}
  </div>
);
}

export default CashInfoProduct
