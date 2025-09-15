const fs = require('fs');
const { parseCSVText } = require('./temp/csvParser.js');

const csvContent = fs.readFileSync('products_export_1 (2).csv', 'utf8');

console.log('=== TESTANDO PARSER CORRIGIDO ===');
console.log('Arquivo:', 'products_export_1 (2).csv');
console.log('Tamanho:', csvContent.length, 'caracteres');
console.log('Linhas:', csvContent.split('\n').length);

console.log('\n=== EXECUTANDO PARSER ===');
const result = parseCSVText(csvContent);

console.log('\n=== RESULTADO FINAL ===');
console.log('Produtos processados:', result.data.length);
console.log('Sucesso:', result.success);
console.log('Erros:', result.errors.length);

if (result.data && result.data.length > 0) {
  result.data.forEach((product, index) => {
    console.log(`${index + 1}. Handle: ${product.Handle}`);
    console.log(`   Nome: ${product.Title}`);
    console.log(`   Preço: ${product['Variant Price'] || 'Não definido'}`);
    console.log('---');
  });
} else {
  console.log('Nenhum produto foi processado!');
  if (result.errors.length > 0) {
    console.log('Erros encontrados:');
    result.errors.forEach(error => console.log('- ' + error));
  }
}