# Importação de catálogo

## Fontes Giancar

A página pública da Giancar aponta atualmente para:

- Linha Geral: `https://www.giancar.com.br/pdf/catalogo2020.pdf`
- Oportunidades: `https://www.giancar.com.br/pdf/oportunidades.pdf`
- Linha Distribuição 2022: `https://www.giancar.com.br/pdf/Cat%C3%A1logo2022completo.pdf`

Página central:

`https://www.giancar.com.br/catalogo`

## Estratégia

Não acoplamos o banco diretamente ao layout do PDF.

O fluxo é:

```text
PDF / planilha / ERP
        |
extração
        |
normalização
        |
validação
        |
POST /api/catalog/import
        |
PostgreSQL
```

Isso permite trocar ou adicionar fornecedores sem alterar o CRM.

## Modelo normalizado

Cada item deve ter, no mínimo:

- SKU
- nome

Pode ter:

- categoria
- fabricante
- marca
- código original
- código de barras
- descrição
- preço
- custo
- estoque
- aplicações

Cada aplicação pode ter:

- marca
- modelo
- ano inicial/final
- motor
- versão
- transmissão
- combustível
- lado
- eixo
- posição

## Preço

Preço não é inferido do catálogo. Se não vier de uma fonte confiável cadastrada, o sistema responde que a peça foi localizada, mas o preço ainda não está disponível.
