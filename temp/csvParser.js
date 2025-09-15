"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCSVText = parseCSVText;
exports.parseCSVFile = parseCSVFile;
exports.validateCSVFile = validateCSVFile;
// Função para validar uma linha do CSV
function validateCSVRow(row, lineNumber) {
    const errors = [];
    console.log(`🔍 Validando linha ${lineNumber + 2}: Handle="${row.Handle}", Title="${row.Title}"`);
    // Validar Handle (obrigatório e deve ser string não vazia)
    if (!row.Handle || typeof row.Handle !== 'string' || row.Handle.trim() === '') {
        const error = `Linha ${lineNumber + 2}: Handle é obrigatório e deve ser uma string válida`;
        console.log(`❌ ${error}`);
        errors.push(error);
    }
    // Validar Title (obrigatório para produtos principais)
    if (!row.Title || typeof row.Title !== 'string' || row.Title.trim() === '') {
        const error = `Linha ${lineNumber + 2}: Title é obrigatório para produtos principais`;
        console.log(`❌ ${error}`);
        errors.push(error);
    }
    // Validar preço (opcional - se fornecido, deve ser válido)
    const price = row['Variant Price'];
    if (price && price.trim() !== '' && price.toLowerCase() !== 'manual') {
        const cleanPrice = price.toString().replace(',', '.');
        const numericPrice = parseFloat(cleanPrice);
        if (isNaN(numericPrice)) {
            const error = `Linha ${lineNumber + 2}: Preço não é um número válido: "${price}"`;
            console.log(`❌ ${error}`);
            errors.push(error);
        }
        else if (numericPrice < 0) {
            const error = `Linha ${lineNumber + 2}: Preço não pode ser negativo: ${numericPrice}`;
            console.log(`❌ ${error}`);
            errors.push(error);
        }
        else {
            console.log(`✅ Preço válido: ${numericPrice}`);
        }
    }
    else {
        console.log(`ℹ️ Linha ${lineNumber + 2}: Produto sem preço - será incluído para definição posterior`);
    }
    const isValid = errors.length === 0;
    console.log(`${isValid ? '✅' : '❌'} Validação da linha ${lineNumber + 2}: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
    return {
        isValid,
        errors
    };
}
// Função para converter CSV text para array de objetos
function parseCSVText(csvText) {
    const result = {
        success: false,
        data: [],
        errors: [],
        totalRows: 0,
        validRows: 0
    };
    console.log('🔍 Iniciando parseCSVText...');
    try {
        // Dividir em linhas
        const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        console.log(`📊 Total de linhas encontradas: ${lines.length}`);
        if (lines.length < 2) {
            result.errors.push('CSV deve ter pelo menos uma linha de cabeçalho e uma linha de dados');
            return result;
        }
        // Primeira linha são os cabeçalhos - usar parser mais robusto
        const headers = parseCSVLine(lines[0]);
        console.log(`📋 Cabeçalhos encontrados: ${headers.join(', ')}`);
        // Verificar se tem os cabeçalhos essenciais
        const requiredHeaders = ['Handle', 'Title', 'Variant Price'];
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        if (missingHeaders.length > 0) {
            result.errors.push(`Cabeçalhos obrigatórios ausentes: ${missingHeaders.join(', ')}`);
            return result;
        }
        result.totalRows = lines.length - 1; // Excluir linha de cabeçalho
        console.log(`📈 Total de linhas de dados para processar: ${result.totalRows}`);
        let skippedVariants = 0;
        let skippedNoPrice = 0;
        let validationErrors = 0;
        // Processar cada linha de dados
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            console.log(`🔄 Processando linha ${i}: ${line.substring(0, 100)}...`);
            // Usar parser mais robusto
            const values = parseCSVLine(line);
            // Criar objeto com os dados da linha
            const rowData = {};
            headers.forEach((header, index) => {
                rowData[header] = values[index] || '';
            });
            console.log(`📝 Dados da linha ${i}: Handle="${rowData.Handle}", Title="${rowData.Title}", Price="${rowData['Variant Price']}"`);
            // Ignorar variantes (linhas sem título)
            if (!rowData.Title || rowData.Title.trim() === '') {
                console.log(`⏭️ Linha ${i}: Ignorando variante (sem título)`);
                skippedVariants++;
                continue;
            }
            // Verificar preço - permitir produtos sem preço (podem ser definidos depois)
            const priceField = rowData['Variant Price'] || '';
            let hasValidPrice = false;
            if (priceField && priceField.trim() !== '' && priceField.toLowerCase() !== 'manual') {
                const priceValue = parseFloat(priceField.replace(',', '.'));
                if (!isNaN(priceValue) && priceValue >= 0) {
                    hasValidPrice = true;
                    console.log(`💰 Linha ${i}: Preço válido: ${priceValue}`);
                }
                else {
                    console.log(`⚠️ Linha ${i}: Preço inválido "${priceField}" - Produto será incluído sem preço`);
                }
            }
            else {
                console.log(`⚠️ Linha ${i}: Produto sem preço - Será incluído para definição posterior`);
            }
            // Validar a linha
            const validation = validateCSVRow(rowData, i - 1);
            if (validation.isValid) {
                console.log(`✅ Linha ${i}: Produto válido adicionado - Handle: "${rowData.Handle}"`);
                result.data.push(rowData);
                result.validRows++;
            }
            else {
                console.log(`❌ Linha ${i}: Falha na validação - Erros: ${validation.errors.join(', ')}`);
                result.errors.push(...validation.errors);
                validationErrors++;
            }
        }
        console.log(`📊 Resumo do processamento:`);
        console.log(`   - Variantes ignoradas: ${skippedVariants}`);
        console.log(`   - Produtos sem preço: ${skippedNoPrice}`);
        console.log(`   - Erros de validação: ${validationErrors}`);
        console.log(`   - Produtos válidos: ${result.validRows}`);
        result.success = result.errors.length === 0 && result.validRows > 0;
        if (result.validRows === 0 && result.errors.length === 0) {
            result.errors.push('Nenhuma linha válida encontrada no CSV');
        }
    }
    catch (error) {
        console.error('💥 Erro ao processar CSV:', error);
        result.errors.push(`Erro ao processar CSV: ${error}`);
    }
    console.log(`🏁 parseCSVText finalizado. Produtos válidos: ${result.validRows}`);
    return result;
}
// Função auxiliar para fazer parse robusto de uma linha CSV
function parseCSVLine(line) {
    const values = [];
    let currentValue = '';
    let insideQuotes = false;
    let i = 0;
    while (i < line.length) {
        const char = line[i];
        if (char === '"') {
            if (insideQuotes && i + 1 < line.length && line[i + 1] === '"') {
                // Aspas duplas escapadas
                currentValue += '"';
                i += 2;
            }
            else {
                // Início ou fim de campo com aspas
                insideQuotes = !insideQuotes;
                i++;
            }
        }
        else if (char === ',' && !insideQuotes) {
            // Separador de campo
            values.push(currentValue.trim());
            currentValue = '';
            i++;
        }
        else {
            currentValue += char;
            i++;
        }
    }
    // Adicionar o último valor
    values.push(currentValue.trim());
    return values;
}
// Função para processar arquivo CSV
function parseCSVFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvText = e.target?.result;
            const result = parseCSVText(csvText);
            resolve(result);
        };
        reader.onerror = () => {
            resolve({
                success: false,
                data: [],
                errors: ['Erro ao ler o arquivo'],
                totalRows: 0,
                validRows: 0
            });
        };
        reader.readAsText(file, 'utf-8');
    });
}
// Função para validar se o arquivo é um CSV válido
function validateCSVFile(file) {
    // Verificar extensão
    if (!file.name.toLowerCase().endsWith('.csv')) {
        return { isValid: false, error: 'Arquivo deve ter extensão .csv' };
    }
    // Verificar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
        return { isValid: false, error: 'Arquivo muito grande. Máximo 10MB' };
    }
    // Verificar se não está vazio
    if (file.size === 0) {
        return { isValid: false, error: 'Arquivo está vazio' };
    }
    return { isValid: true };
}
