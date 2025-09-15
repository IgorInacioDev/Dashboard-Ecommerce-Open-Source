import React, { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "./ui/textarea";
import { createProduct } from "@/api/products";
import { parseCSVFile, validateCSVFile, ParsedCSVResult } from "@/lib/csvParser";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface para resultado da importação
interface ImportResult {
  success: boolean;
  errors: string[];
  created: number;
  details: Array<{
    productName: string;
    status: 'success' | 'error';
    error?: string;
  }>;
}

// Schema de validação com Zod
const productColorSchema = z.object({
  title: z.string().optional().or(z.literal('')),
  hex: z.string().optional().or(z.literal('')),
}).refine((data) => {
  // Se algum campo estiver preenchido, todos devem estar preenchidos
  const hasAnyField = data.title || data.hex;
  if (hasAnyField) {
    return data.title && data.hex;
  }
  return true;
}, {
  message: "Se você preencher uma variação, todos os campos (Nome e Hex) são obrigatórios",
});

const productSchema = z.object({
  name: z.string().min(1, "Nome do produto é obrigatório").min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(1, "Descrição é obrigatória").min(10, "Descrição deve ter pelo menos 10 caracteres"),
  original_price: z.number().min(0.01, "Preço original deve ser maior que zero"),
  sale_price: z.number().min(0, "Preço promocional deve ser positivo").optional().nullable(),
  colors: z.array(productColorSchema).min(0).optional(),
  info_sections: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AppRegisterProductDialogProps {
  children: React.ReactNode;
}

export function AppRegisterProductDialog({ children }: AppRegisterProductDialogProps) {
  const queryClient = useQueryClient();
  const [imageUrls, setImageUrls] = useState<string>("");
  const [videoUrls, setVideoUrls] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados para importação em massa
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<ParsedCSVResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>("single");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Funções para importação em massa
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const validation = validateCSVFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }
    
    setCsvFile(file);
    setImportResult(null);
    
    // Parse do arquivo CSV
    const result = await parseCSVFile(file);
    setCsvData(result);
  };
  
  const handleImportCSV = async () => {
    if (!csvData || !csvData.success) return;
    
    setIsImporting(true);
    
    try {
      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvData: csvData.data }),
      });
      
      const result = await response.json();
      setImportResult(result);
      
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    } catch (error) {
      setImportResult({
        success: false,
        errors: ['Erro ao importar produtos'],
        created: 0,
        details: []
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  const resetImport = () => {
    setCsvFile(null);
    setCsvData(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Função para gerar dados aleatórios de teste
  const generateRandomData = () => {
    const randomNames = ['Smartphone Premium', 'Notebook Gamer', 'Fone Bluetooth', 'Smartwatch', 'Tablet Pro', 'Câmera Digital'];
    const randomDescriptions = [
      'Produto de alta qualidade com tecnologia avançada',
      'Design moderno e funcionalidade excepcional',
      'Perfeito para uso profissional e pessoal',
      'Inovação e praticidade em um só produto'
    ];
    const randomColors = [
      [{ title: 'Vermelho', hex: '#FF0000' }, { title: 'Verde', hex: '#00FF00' }, { title: 'Azul', hex: '#0000FF' }],
      [{ title: 'Amarelo', hex: '#FFFF00' }, { title: 'Magenta', hex: '#FF00FF' }],
      [{ title: 'Preto', hex: '#000000' }, { title: 'Branco', hex: '#FFFFFF' }]
    ];
    
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomDescription = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
    const randomOriginalPrice = Math.floor(Math.random() * 1000) + 100;
    const randomSalePrice = Math.floor(randomOriginalPrice * 0.8);
    const randomColorSet = randomColors[Math.floor(Math.random() * randomColors.length)];
    
    setValue('name', randomName);
    setValue('description', randomDescription);
    setValue('original_price', randomOriginalPrice);
    setValue('sale_price', randomSalePrice);
    setValue('colors', randomColorSet.map((color) => ({
      title: color.title,
      hex: color.hex
    })));
    setValue('info_sections', 'Informações detalhadas sobre o produto geradas automaticamente para teste.');
  };
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    control
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      original_price: 0,
      sale_price: null,
      colors: [],
      info_sections: ""
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "colors",
  });

  // Função para processar URLs de imagens e vídeos
  const processUrls = (urlString: string): string[] => {
    if (!urlString.trim()) return [];
    return urlString
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsUploading(true);
      
      if(!data.sale_price) {
        data.sale_price = 0;
      }

      // Processar URLs de imagens
      const processedImageUrls = processUrls(imageUrls);
      console.log('URLs de imagem processadas:', processedImageUrls);

      // Processar URLs de vídeos
      const processedVideoUrls = processUrls(videoUrls);
      console.log('URLs de vídeo processadas:', processedVideoUrls);

      // Converter URLs de imagem para objetos com propriedade url
      const formattedImages = processedImageUrls.length > 0 ? processedImageUrls.map(url => ({
        path: url,
        title: 'Product Image',
        mimetype: 'image/jpeg',
        size: 0,
        width: 0,
        height: 0,
        id: Math.random().toString(36).substr(2, 9),
        thumbnails: {
          tiny: { signedPath: url },
          small: { signedPath: url },
          card_cover: { signedPath: url }
        },
        signedPath: url
      })) : [];

      const productData = {
        name: data.name || 'Produto sem nome',
        description: data.description || 'Descrição não informada',
        original_price: data.original_price || 0, // Já vem em centavos do setValueAs
        sale_price: data.sale_price || 0, // Já vem em centavos do setValueAs
        colors: data.colors && data.colors.length > 0 ? data.colors
          .filter(color => color.title && color.hex) // Filtrar apenas cores completas
          .map(color => ({
            title: color.title!,
            hex: color.hex!
          })) : null,
        info_sections: data.info_sections ? [{ title: "Informações", content: data.info_sections }] : [{ title: "Informações", content: "Nenhuma informação adicional" }],
        Images: formattedImages,
        video_reviews: processedVideoUrls
      };

      console.log('Dados do produto a serem enviados:', productData);
      
      try {
        await createProduct(productData);
        
        // Invalida o cache para forçar revalidação em todas as aplicações
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['cardList'] });
        
        reset();
        setImageUrls("");
        setVideoUrls("");
        alert("Produto criado com sucesso!");
      } catch (createError) {
        console.error('Erro ao criar produto na API:', createError);
        
        // Log do erro para debugging
        
        alert(`Erro ao criar produto: ${createError instanceof Error ? createError.message : 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro geral:", error);
      alert("Erro inesperado. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Gerenciar Produtos
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Crie produtos individualmente ou importe em massa via CSV.
              </DialogDescription>
            </div>
            {activeTab === "single" && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={generateRandomData}
                className="text-xs hover:bg-accent transition-colors"
              >
                Dados Teste
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Produto Individual
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Importação em Massa
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="flex flex-col flex-1 min-h-0 mt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="grid gap-6 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            <div className="bg-card/50 p-4 rounded-lg border border-border/50">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Informações Básicas
              </h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">Nome do Produto</Label>
                  <Input 
                    id="name" 
                    {...register("name")} 
                    placeholder="Digite o nome do produto" 
                    className={`transition-all duration-200 ${errors.name ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                  />
                  {errors.name && (
                    <span className="text-destructive text-xs flex items-center gap-1">
                      <div className="w-1 h-1 bg-destructive rounded-full"></div>
                      {errors.name.message}
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-sm font-medium text-foreground">Descrição</Label>
                  <Textarea 
                    id="description" 
                    {...register("description")} 
                    placeholder="Descreva o produto detalhadamente" 
                    rows={3}
                    className={`transition-all duration-200 resize-none ${errors.description ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                  />
                  {errors.description && (
                    <span className="text-destructive text-xs flex items-center gap-1">
                      <div className="w-1 h-1 bg-destructive rounded-full"></div>
                      {errors.description.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-card/50 p-4 rounded-lg border border-border/50">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
                Preços
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="original_price" className="text-sm font-medium text-foreground">Preço Original (R$)</Label>
                  <Input 
                    id="original_price" 
                    {...register("original_price", { 
                      setValueAs: (value) => {
                        // Converte de reais para centavos (99.00 -> 9900)
                        const numValue = parseFloat(value);
                        return isNaN(numValue) ? 0 : Math.round(numValue * 100);
                      }
                    })} 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="99.00"
                    className={`transition-all duration-200 ${errors.original_price ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                  />
                  {errors.original_price && (
                    <span className="text-destructive text-xs flex items-center gap-1">
                      <div className="w-1 h-1 bg-destructive rounded-full"></div>
                      {errors.original_price.message}
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="sale_price" className="text-sm font-medium text-foreground">Preço Promocional (R$)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-6 px-2 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 hover:from-green-600 hover:to-green-700"
                      onClick={() => {
                        const originalPrice = parseFloat((document.getElementById('original_price') as HTMLInputElement)?.value || '0');
                        if (originalPrice > 0) {
                          const discountedPrice = originalPrice * 0.3; // 70% de desconto = 30% do valor original
                          setValue('sale_price', discountedPrice); // Não converte aqui, deixa o setValueAs fazer
                          // Atualiza o campo visual
                          const salePriceInput = document.getElementById('sale_price') as HTMLInputElement;
                          if (salePriceInput) {
                            salePriceInput.value = discountedPrice.toFixed(2);
                          }
                        }
                      }}
                    >
                      70% OFF
                    </Button>
                  </div>
                  <Input 
                    id="sale_price" 
                    {...register("sale_price", { 
                      setValueAs: (value) => {
                        // Converte de reais para centavos (29.70 -> 2970)
                        const numValue = parseFloat(value);
                        return isNaN(numValue) ? 0 : Math.round(numValue * 100);
                      }
                    })} 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="29.70"
                    className={`transition-all duration-200 ${errors.sale_price ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                  />
                  {errors.sale_price && (
                    <span className="text-destructive text-xs flex items-center gap-1">
                      <div className="w-1 h-1 bg-destructive rounded-full"></div>
                      {errors.sale_price.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                💡 Os valores são automaticamente convertidos para centavos no banco de dados (ex: R$ 99,00 = 9900 centavos)
              </div>
            </div>
            
            {/* Seção de Cores/Variações */}
            <div className="bg-card/50 p-4 rounded-lg border border-border/50">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                Variações do Produto
              </h3>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-start p-3 bg-background/50 rounded-md border border-border/30">
                    <div className="flex-1 grid gap-2">
                      <Label className="text-xs text-muted-foreground">Nome da Cor</Label>
                      <Input
                        {...register(`colors.${index}.title`)}
                        placeholder="Nome (ex: Amora, Rosa Malva)"
                        className={`transition-all duration-200 focus:border-primary ${
                          errors.colors?.[index]?.title ? 'border-destructive' : ''
                        }`}
                      />
                      {errors.colors?.[index]?.title && (
                        <span className="text-destructive text-xs flex items-center gap-1">
                          <div className="w-1 h-1 bg-destructive rounded-full"></div>
                          {errors.colors[index].title.message}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 grid gap-2">
                      <Label className="text-xs text-muted-foreground">Código Hex</Label>
                      <Input
                        {...register(`colors.${index}.hex`)}
                        placeholder="#FF0000"
                        className={`transition-all duration-200 focus:border-primary ${
                          errors.colors?.[index]?.hex ? 'border-destructive' : ''
                        }`}
                      />
                      {errors.colors?.[index]?.hex && (
                        <span className="text-destructive text-xs flex items-center gap-1">
                          <div className="w-1 h-1 bg-destructive rounded-full"></div>
                          {errors.colors[index].hex.message}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-colors mt-6"
                    >
                      Remover
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ title: "", hex: "" })}
                  className="w-full hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors"
                >
                  + Adicionar Variação
                </Button>
                {errors.colors && (
                  <span className="text-destructive text-xs flex items-center gap-1">
                    <div className="w-1 h-1 bg-destructive rounded-full"></div>
                    {typeof errors.colors.message === 'string' 
                      ? errors.colors.message 
                      : 'Erro na validação das variações'
                    }
                  </span>
                )}
              </div>
            </div>
            <div className="bg-card/50 p-4 rounded-lg border border-border/50">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                Mídia do Produto
              </h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="images" className="text-sm font-medium text-foreground">URLs das Imagens</Label>
                  <Textarea 
                    id="images" 
                    value={imageUrls}
                    onChange={(e) => setImageUrls(e.target.value)}
                    placeholder="Cole as URLs das imagens, uma por linha:\nhttps://exemplo.com/imagem1.jpg\nhttps://exemplo.com/imagem2.png"
                    rows={4}
                    className="transition-all duration-200 resize-none focus:border-primary"
                  />
                  {imageUrls.trim() && (
                    <span className="text-xs text-chart-3 flex items-center gap-1">
                      <div className="w-1 h-1 bg-chart-3 rounded-full"></div>
                      {processUrls(imageUrls).length} URL(s) de imagem inserida(s)
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="video_reviews" className="text-sm font-medium text-foreground">URLs dos Vídeos</Label>
                  <Textarea 
                    id="video_reviews" 
                    value={videoUrls}
                    onChange={(e) => setVideoUrls(e.target.value)}
                    placeholder="Cole as URLs dos vídeos, uma por linha:\nhttps://exemplo.com/video1.mp4\nhttps://exemplo.com/video2.webm"
                    rows={3}
                    className="transition-all duration-200 resize-none focus:border-primary"
                  />
                  {videoUrls.trim() && (
                    <span className="text-xs text-chart-3 flex items-center gap-1">
                      <div className="w-1 h-1 bg-chart-3 rounded-full"></div>
                      {processUrls(videoUrls).length} URL(s) de vídeo inserida(s)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-card/50 p-4 rounded-lg border border-border/50">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
                Informações Adicionais
              </h3>
              <div className="grid gap-2">
                <Label htmlFor="info_sections" className="text-sm font-medium text-foreground">Seções de Informação</Label>
                <Textarea 
                  id="info_sections" 
                  {...register("info_sections")} 
                  placeholder="Informações adicionais sobre o produto, especificações técnicas, garantia, etc." 
                  rows={3} 
                  className="transition-all duration-200 resize-none focus:border-primary"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-6 border-t border-border/50 mt-4">
            <div className="flex gap-3 w-full sm:w-auto">
              <DialogClose asChild>
                <Button 
                  variant="outline" 
                  type="button"
                  className="flex-1 sm:flex-none hover:bg-muted transition-colors"
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isSubmitting || isUploading}
                className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                    Fazendo upload...
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                    Criando...
                  </>
                ) : (
                  "Criar Produto"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
          </TabsContent>
          
          <TabsContent value="bulk" className="flex flex-col flex-1 min-h-0 mt-4">
            <div className="space-y-6">
              {/* Upload de arquivo */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!csvFile ? (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-medium">Selecione um arquivo CSV</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Faça upload do arquivo CSV com os dados dos produtos
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Escolher Arquivo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                    <div>
                      <h3 className="text-lg font-medium">Arquivo selecionado</h3>
                      <p className="text-sm text-muted-foreground">{csvFile.name}</p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetImport}
                      >
                        Trocar Arquivo
                      </Button>
                      <Button
                        type="button"
                        onClick={handleImportCSV}
                        disabled={isImporting || !csvData?.success}
                      >
                        {isImporting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                            Importando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Importar Produtos
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Preview dos dados */}
              {csvData && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Preview dos Dados</h4>
                  {csvData.success ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {csvData.data.length} produtos encontrados no arquivo
                      </p>
                      <div className="max-h-40 overflow-y-auto">
                        {csvData.data.slice(0, 5).map((product, index) => (
                           <div key={index} className="text-xs p-2 bg-muted rounded">
                             <strong>{product.Title}</strong> - {product.Handle}
                           </div>
                         ))}
                        {csvData.data.length > 5 && (
                          <p className="text-xs text-muted-foreground">... e mais {csvData.data.length - 5} produtos</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-500">
                      Erro ao processar arquivo: {csvData.errors.join(', ')}
                    </div>
                  )}
                </div>
              )}
              
              {/* Resultado da importação */}
              {importResult && (
                <div className={`border rounded-lg p-4 ${
                  importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {importResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h4 className="font-medium">
                      {importResult.success ? 'Importação Concluída' : 'Erro na Importação'}
                    </h4>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p>Produtos criados: {importResult.created}</p>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div>
                        <p className="font-medium text-red-600">Erros:</p>
                        <ul className="list-disc list-inside text-red-600">
                          {importResult.errors.map((error: string, index: number) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
