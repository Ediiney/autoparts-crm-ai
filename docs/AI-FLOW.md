# Motor de identificação de peças

## Princípio
A IA interpreta linguagem; o banco de dados confirma produto, aplicação e preço.

## Fluxo
1. Extrair intenção de compra/consulta.
2. Normalizar sinônimos e erros de escrita da peça.
3. Extrair marca, modelo, ano, motor, versão, lado e posição.
4. Buscar candidatos no catálogo.
5. Identificar quais atributos realmente diferenciam os candidatos.
6. Perguntar somente o atributo faltante necessário para eliminar a ambiguidade.
7. Só apresentar SKU, compatibilidade e preço vindos da base.
8. Registrar pergunta, resposta, candidatos e confiança para auditoria.

## Exemplo
Cliente: “quanto tá a bandeija do civic?”

Interpretação: peça provável = bandeja de suspensão; veículo = Honda Civic; ano ausente.

Pergunta: “Qual é o ano do seu Civic? Se souber, informe também se procura o lado esquerdo ou direito.”

## Política anti-alucinação
Nunca gerar preço, estoque, SKU, código original ou aplicação a partir do conhecimento do modelo. Esses campos devem vir exclusivamente do catálogo/ERP cadastrado.
