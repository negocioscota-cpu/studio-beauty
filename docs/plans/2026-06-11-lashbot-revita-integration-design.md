# Design da Integração do E-book ReVita no LashBot

Data: 2026-06-11
Autor: Antigravity AI
Status: Aprovado pelo Usuário

## 1. Objetivo
Integrar o conteúdo do e-book oficial da linha *ReVita Complex 3D* (Marina Cota) à base de conhecimento da Consultora IA (LashBot) no arquivo `js/lashbot.js`. A integração deve descrever os 12 ativos da fórmula capilar, o protocolo de 5 passos com Dermapen/Alta Frequência, e as orientações de uso home care e cupom REVITA10.

## 2. Design Aprovado

### Nova Seção de Reconstrução Capilar e ReVita
Será inserida uma nova seção dedicada à reconstrução capilar e à linha ReVita no prompt de sistema (`SYSTEM_PROMPT` em `js/lashbot.js`), posicionada estrategicamente após os Cuidados Labiais (`## 16`) e antes da Manicure/Unhas para manter a coesão de tratamentos capilares/faciais:

- **## 17. RECONSTRUÇÃO CAPILAR & LINHA REVITA COMPLEX 3D (REVITA)**
  - **O que é**: Blend reconstrutor e bioestimulador capilar em nanotecnologia.
  - **Ativos e Composição Química Detalhada (12 Componentes)**: Nutrimel Skin, Fiber.CARE X, Proteína do Trigo Hidrolisada, Queratina Hidrolisada, Biotin SOL, Bioecolia, Pantenol, Cressatine, H-VIT PLUS, Extratos Glicólicos (Mandioca, Jaborandi, Alecrim, Quiabo), ReparAge, Kerastim S.
  - **Protocolo de Reconstrução Exclusivo ReVita**: Higienização/Preparação (Total Care, Primer 3 em 1), Aplicação do sérum (Cílios, Sobrancelhas, Barba, Couro Cabeludo), Estímulo da penetração (massagem, Dermapen nano, LED, Alta Frequência), Reposição de massa (Complex 3D Passos 1 e 2).
  - **Orientações Home Care**: Aplicação de 2 a 3 vezes por semana em casa e cupom REVITA10.

### Reordenação das Seções Subsequentes
- `## 17. MANICURE & ALONGAMENTO DE UNHAS` -> passa a ser `## 18`
- `## 18. RECURSOS DO SISTEMA STUDIO BEAUTY` -> passa a ser `## 19`

## 3. Plano de Verificação
- Verificar a integridade sintática de `js/lashbot.js` após a edição do prompt de sistema.
- Commitar e efetuar o deploy (git push) para a branch `main`.
