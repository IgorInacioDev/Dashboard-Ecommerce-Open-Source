import AnimatedContent from "@/blocks/Animations/AnimatedContent/AnimatedContent";
import AppSessionDataTable from "@/components/sessionsDataTable/AppSessionDataTable";

export default async function SessionsPage() {
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
      <div className="px-8">
        <h1 className="text-2xl font-bold mb-6 text-[#FDF9EF]">Sessions</h1>
        
        <AppSessionDataTable />
      </div>
    </AnimatedContent>
  );
};