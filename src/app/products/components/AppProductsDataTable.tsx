'use client'

import { useQuery } from "@tanstack/react-query";
import { createProductsColumns } from "./columns";
import { DataTable } from "./data-table";
import { ProductListResponse, ProductType } from "@/types";
import { getProducts } from "@/api/products/getProducts";
import { EditProductDialog } from "@/components/EditProductDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AppProductsDataTable() {
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data, isLoading, error, refetch } = useQuery<ProductListResponse>({
    queryKey: ['products'],
    queryFn: async () => {
      const products = await getProducts();
      return {
        list: products,
        pageInfo: {
          totalRows: products.length,
          page: 1,
          pageSize: products.length,
          isFirstPage: true,
          isLastPage: true
        }
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[#FDF9EF]">Carregando produtos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Erro ao carregar produtos</div>
      </div>
    )
  }

  const allProducts = data?.list ? 
    [...data.list].sort((a, b) => {
      const dateA = new Date(a.CreatedAt || 0);
      const dateB = new Date(b.CreatedAt || 0);
      return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
    }) : [];

  // Cálculos de paginação
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const products = allProducts.slice(startIndex, endIndex);

  // Funções de navegação
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEditProduct = (product: ProductType) => {
    setSelectedProduct(product)
    setIsEditModalOpen(true)
  }

  const handleProductUpdated = () => {
    refetch()
  }

  const columns = createProductsColumns(handleEditProduct)

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-[#FDF9EF]/70">
          Total de produtos: {allProducts.length} | Exibindo: {products.length}
        </div>
        {totalPages > 1 && (
          <div className="text-sm text-[#FDF9EF]/70">
            Página {currentPage} de {totalPages}
          </div>
        )}
      </div>
      
      <DataTable columns={columns} data={products} />
      
      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNumber)}
                  className="w-8 h-8 p-0"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <EditProductDialog
        product={selectedProduct}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  );
}