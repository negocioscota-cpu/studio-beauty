# Design da Integração do E-book BioSpik no LashBot

Data: 2026-06-11
Autor: Antigravity AI
Status: Aprovado pelo Usuário

## 1. Objetivo
Integrar o conteúdo do e-book oficial do *BioSpik Therapy* (Microagulhamento em Creme) à base de conhecimento da Consultora IA (LashBot) no arquivo `js/lashbot.js`. A integração deve descrever os 4 ativos chave (Micro PDRN, MoistShield, Needle Renew, Nano Hyaluronic Acid), os protocolos em cabine (facial, labial e sobrancelhas), tabelas de compatibilidade com outros tratamentos e orientações home care.

## 2. Design Aprovado

### Nova Seção de Microagulhamento em Creme e BioSpik
Será inserida uma nova seção dedicada ao BioSpik no prompt de sistema (`SYSTEM_PROMPT` em `js/lashbot.js`), posicionada estrategicamente após o ReVita (`## 17`) e antes da Manicure/Unhas para manter a coesão de tratamentos faciais:

- **## 18. MICROAGULHAMENTO EM CREME & LINHA BIOSPIK THERAPY (BIOSPIK)**
  - **O que é**: Peeling bioativo inteligente e microagulhamento em creme (sem dor/sem agulhas).
  - **Ativos Chave**: Micro PDRN (salmão), MoistShield, Nano Hyaluronic Acid, Needle Renew.
  - **Protocolos Práticos**: Aplicação padrão facial, Hidragloss labial com BioSpik, Rejuvenescimento facial, Uniformização de sobrancelhas.
  - **Tabela de Compatibilidade**: Peelings, LED, microcorrentes, limpeza de pele, dermaplaning.
  - **Dicas Práticas & Vendas**: Argumentos, contraindicações, home care (2x por semana para potencializar skincare).

### Reordenação das Seções Subsequentes
- `## 18. MANICURE & ALONGAMENTO DE UNHAS` -> passa a ser `## 19`
- `## 19. RECURSOS DO SISTEMA STUDIO BEAUTY` -> passa a ser `## 20`

## 3. Plano de Verificação
- Verificar a integridade sintática de `js/lashbot.js` após a edição do prompt de sistema.
- Commitar e efetuar o deploy (git push) para a branch `main`.
