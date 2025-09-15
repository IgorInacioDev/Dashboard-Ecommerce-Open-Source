import AnimatedContent from "@/blocks/Animations/AnimatedContent/AnimatedContent";
import AppProductsDataTable from "./components/AppProductsDataTable";
import { AmazonJsonImporter } from "@/components/AmazonJsonImporter";


export default async function ProductsPage() {
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
        <h1 className="text-2xl font-bold mb-6 text-[#FDF9EF]">Lista de Produtos</h1>
        
        {/* Importador de JSON do Amazon */}
        <div className="mb-8">
          <AmazonJsonImporter />
        </div>
        
        <AppProductsDataTable />
      </div>
    </AnimatedContent>
  );
};