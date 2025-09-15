import AppAreaChart from "./AppAreaChart";
import AppPieChart from "./AppPieChart";

const PaymentsCharts = () => {
    return (
        <div className="flex justify-between gap-4">
            <div className="bg-[#FDF9EF] w-full p-4 rounded-lg">
                <AppAreaChart />
            </div>
            <div className="bg-primary-foreground text-[#FDF9EF] w-full p-6 rounded-lg">
                <AppPieChart />
            </div>
        </div>
    )
}
export default PaymentsCharts;
