'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileJson, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface ImportResult {
  total: number;
  processed: number;
  created: number;
  skipped: number;
  errors: string[];
}

interface AmazonJsonImporterProps {
  onImportComplete?: () => void;
}

export function AmazonJsonImporter({ onImportComplete }: AmazonJsonImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const queryClient = useQueryClient();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Verifica se é um arquivo JSON
      if (!selectedFile.name.endsWith('.json')) {
        setError('Por favor, selecione um arquivo JSON válido.');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo JSON.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      // Lê o arquivo JSON
      const fileContent = await file.text();
      let amazonData;
      
      try {
        amazonData = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error('Arquivo JSON inválido. Verifique a sintaxe do arquivo.');
      }

      setProgress(25);

      // Envia para a API
      const response = await fetch('/api/products/import-amazon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amazonData }),
      });

      setProgress(75);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao importar produtos');
      }

      setProgress(100);
      setResult(data.results);
      
      // Invalida cache para atualizar lista de produtos
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Chama callback se fornecido
      if (onImportComplete) {
        onImportComplete();
      }

    } catch (err) {
      console.error('Erro na importação:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const resetImporter = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    
    // Reset do input file
    const fileInput = document.getElementById('json-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          Importar Produtos do Amazon JSON
        </CardTitle>
        <CardDescription>
          Faça upload de um arquivo JSON com dados de produtos do Amazon para importação automática.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload de arquivo */}
        <div className="space-y-2">
          <Label htmlFor="json-file-input">Arquivo JSON</Label>
          <Input
            id="json-file-input"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              Arquivo selecionado: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button 
            onClick={handleImport} 
            disabled={!file || isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Importando...' : 'Importar Produtos'}
          </Button>
          
          {(file || result || error) && (
            <Button 
              variant="outline" 
              onClick={resetImporter}
              disabled={isUploading}
            >
              Limpar
            </Button>
          )}
        </div>

        {/* Barra de progresso */}
        {isUploading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Processando produtos... {progress}%
            </p>
          </div>
        )}

        {/* Resultado da importação */}
        {result && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-green-800">Importação concluída com sucesso!</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Total de itens:</strong> {result.total}</p>
                    <p><strong>Processados:</strong> {result.processed}</p>
                  </div>
                  <div>
                    <p><strong>Criados:</strong> {result.created}</p>
                    <p><strong>Ignorados:</strong> {result.skipped}</p>
                  </div>
                </div>
                
                {result.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium text-orange-800 mb-1">Avisos:</p>
                    <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                      {result.errors.slice(0, 5).map((error, index) => (
                        <li key={index} className="text-orange-700">• {error}</li>
                      ))}
                      {result.errors.length > 5 && (
                        <li className="text-orange-600 italic">
                          ... e mais {result.errors.length - 5} avisos
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">Erro na importação:</p>
              <p className="text-sm mt-1">{error}</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Instruções */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Como usar:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Exporte os dados de produtos do Amazon em formato JSON</li>
              <li>Selecione o arquivo JSON usando o botão acima</li>
              <li>Clique em &quot;Importar Produtos&quot; para processar</li>
              <li>Os produtos serão automaticamente adicionados ao sistema</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}