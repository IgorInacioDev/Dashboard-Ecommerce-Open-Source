import AppAreaChart from "@/components/AppAreaChart";
import AppPieChart from "@/components/AppPieChart";
import CashInfoProduct from "@/components/CashInfoProduct";
import AnimatedList from "@/components/AnimatedList";
import AnimatedContent from "@/blocks/Animations/AnimatedContent/AnimatedContent";
import AppSessionDataTable from "@/components/sessionsDataTable/AppSessionDataTable";

const Homepage = () => {
  return (
    <AnimatedContent
      distance={200}
      direction="vertical"
      reverse={false}
      duration={2}
      initialOpacity={0}
      animateOpacity
      scale={1}
      threshold={0.1}
      delay={0}
    >
      <CashInfoProduct />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 text-[#FDF9EF] w-full max-w-full">
        <div className="bg-primary-foreground/50 backdrop-blur-md w-full py-6 px-4 lg:pr-6 rounded-lg min-w-0">
          <AppAreaChart />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
          <div className="bg-primary-foreground/50 text-[#FDF9EF] p-4 lg:p-6 rounded-lg min-w-0">
            <AppPieChart />
          </div>
          <div className="text-[#1C1C1C] rounded-lg min-w-0">
            <AnimatedList
              showGradients={true}
              enableArrowNavigation={true}
              displayScrollbar={false}
              className="w-full min-w-0"
            />
          </div>
        </div>
      </div>
      <div className="mt-8 lg:mt-16 mb-10 w-full max-w-full">
        <AppSessionDataTable />
      </div>
    </AnimatedContent>
  );
};

export default Homepage;
