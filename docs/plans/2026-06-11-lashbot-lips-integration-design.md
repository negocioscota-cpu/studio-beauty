# Design da Integração do E-book Lips no LashBot

Data: 2026-06-11
Autor: Antigravity AI
Status: Aprovado pelo Usuário

## 1. Objetivo
Integrar o conteúdo do e-book oficial da linha *Lash and Beauty Lips* (Marina Cota) à base de conhecimento da Consultora IA (LashBot) no arquivo `js/lashbot.js`. A integração deve descrever os 4 passos do kit Lips, a técnica do Hidragloss, ativos detalhados, protocolos de Spa dos Lábios com associações e orientações de revenda/home care.

## 2. Design Aprovado

### Nova Seção de Cuidados Labiais
Será inserida uma nova seção dedicada aos cuidados labiais no prompt de sistema (`SYSTEM_PROMPT` em `js/lashbot.js`), posicionada estrategicamente após a Estética Facial e antes da Manicure/Unhas para manter a coesão de tratamentos faciais:

- **## 16. CUIDADOS LABIAIS & LINHA LASH AND BEAUTY LIPS (LIPS)**
  - **O que é o Kit Lips**: Esfoliação, Hidratação/Sérum, Proteção/Butter, Finalização/Gloss.
  - **A Técnica Hidragloss & Spa dos Lábios**: Conceito e indicação.
  - **Ativos e Composição (8 Ingredientes)**: Manteiga de Cacau, Karité, Óleo de Coco, Pracaxi, Macadâmia, Uva, Vitamina E, Squalane.
  - **O Gloss Labial**: Formulação (Ácido Hialurônico, Squalane, Vitamina E) e as duas versões de sabor/cor (Fresh Mint, Coco & Vanilla).
  - **Protocolos e Associações Avançadas**: Higienização (Total Care), esfoliação mecânica e Nano Agulhamento com Sérum Coco Boost.
  - **Dicas Práticas e Vendas**: Clima, cuidados noturnos e cupom LIPS10.

### Reordenação das Seções Subsequentes
- `## 16. MANICURE & ALONGAMENTO DE UNHAS` -> passa a ser `## 17`
- `## 17. RECURSOS DO SISTEMA STUDIO BEAUTY` -> passa a ser `## 18`

## 3. Plano de Verificação
- Verificar a integridade sintática de `js/lashbot.js` após a edição do prompt de sistema.
- Commitar e efetuar o deploy (git push) para a branch `main`.
