# Design da Integração do E-book de Protocolos e Ativos no LashBot

Data: 2026-06-11
Autor: Antigravity AI
Status: Aprovado pelo Usuário

## 1. Objetivo
Integrar o conteúdo do e-book oficial de protocolos e produtos da Lash and Beauty (Marina Cota) à base de conhecimento da Consultora IA (LashBot) localizada no arquivo `js/lashbot.js`. A integração deve evitar duplicidades e otimizar o consumo de tokens da API do Gemini, mantendo o prompt conciso e altamente informativo.

## 2. Design Aprovado

### Unificação das Seções do Complex 3D
As seções `## 7. LASH COMPLEX 3D` e `## 11. COMPLEX 3D — COMPOSIÇÃO DETALHADA E PROTOCOLOS AVANÇADOS` do prompt de sistema original do LashBot serão substituídas por uma única seção robusta estruturada da seguinte forma:

- **## 7. LASH COMPLEX 3D (BOTOX & NANO LAMINATION)**
  - **O que é e Filosofia**: Definição geral do SOS dos fios.
  - **Ativos e Composição Química Detalhada (13 Ativos)**: Enriquecida com a descrição do e-book.
  - **O Mecanismo Atômico da Nanoencapsulação**: Detalhe físico da atração eletrostática entre a carga positiva da nanocápsula e a carga negativa do fio para penetração no córtex.
  - **Funcionalidade das Etapas**: Diferenciação entre Passo 1 e Passo 2, com aviso crítico sobre alongamentos posteriores (aplicar apenas Passo 1 e enxaguar).
  - **Protocolos e Aplicações Práticas**: Unificação do protocolo em cabine, finalização de design, remoção de alongamento, e revitalização/reconstrução.
  - **Associações Físicas e Químicas**: LED, Dermapen, argiloterapia.
  - **Produtos de Apoio Lash and Beauty**: Total Care, Primer 3 em 1, Balm Fix, Perfect Glue Balm, Lash Filler, com características de aroma e benefícios comerciais do e-book.

### Reordenação das Seções
Com a incorporação da antiga seção `## 11` na seção `## 7`, a numeração das seções posteriores do prompt do sistema em `js/lashbot.js` será reordenada sequencialmente:
- `## 7` - Lash Complex 3D (Unificado)
- `## 8` - Processo de Reversão do Brow Lamination
- `## 9` - As Sobrancelhas Perfeitas — Medição e Simetria
- `## 10` - Como Vender o Brow Lamination
- `## 11` - Lami System Complex 3D (antiga 12)
- `## 12` - Extensão de Cílios — Fio a Fio Clássico (antiga 13)
- `## 13` - Protocolo Prático — Lash Lifting com Lami System (antiga 14)
- `## 14` - Protocolo Prático — Brow Lamination com Lami System (antiga 15)
- `## 15` - Estética Facial & Skin Care (antiga 16)
- `## 16` - Manicure & Alongamento de Unhas (antiga 17)
- `## 17` - Recursos do Sistema Studio Beauty (antiga 18)

## 3. Plano de Verificação
- Garantir que a sintaxe JS do arquivo `js/lashbot.js` permaneça íntegra após as edições da constante literal `SYSTEM_PROMPT`.
- Fazer o commit da alteração e o push para deploy.
