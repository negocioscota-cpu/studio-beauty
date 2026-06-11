# LashBot BioSpik Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrar o conteúdo do e-book BioSpik (Lash and Beauty) à base de conhecimento do LashBot no arquivo `js/lashbot.js` de forma estruturada e reordenar as seções subsequentes.

**Architecture:** A string constante `SYSTEM_PROMPT` no arquivo `js/lashbot.js` será modificada. Inseriremos a nova seção `## 18. MICROAGULHAMENTO EM CREME & LINHA BIOSPIK THERAPY (BIOSPIK)` após o ReVita (`## 17`). As seções de Manicure (`## 18` antiga) e Recursos do Estúdio (`## 19` antiga) serão renomeadas para `## 19` e `## 20`.

**Tech Stack:** JavaScript (ES6), HTML5/CSS3.

---

### Task 1: Atualizar SYSTEM_PROMPT no lashbot.js

**Files:**

- Modify: [lashbot.js](file:///C:/Users/conec/OneDrive/Documentos/projetos%20connectai/studio%20Beauty/js/lashbot.js)

**Step 1: Modificar as numerações das seções subsequentes e inserir a nova seção 18**

- Atualizar `## 18. MANICURE & ALONGAMENTO DE UNHAS (NAILS)` antiga para `## 19. MANICURE & ALONGAMENTO DE UNHAS (NAILS)`
- Inserir a nova seção `## 18. MICROAGULHAMENTO EM CREME & LINHA BIOSPIK THERAPY (BIOSPIK)` imediatamente antes dela.
- Atualizar `## 19. RECURSOS DO SISTEMA STUDIO BEAUTY (COMO INSTRUIR A USUÁRIA)` antiga para `## 20. RECURSOS DO SISTEMA STUDIO BEAUTY (COMO INSTRUIR A USUÁRIA)`

**Step 2: Verificar sintaxe do arquivo lashbot.js**

Garantir que a constante literal `SYSTEM_PROMPT` permaneça devidamente fechada e sem erros de sintaxe JS.
Executar: `node -c "C:\Users\conec\OneDrive\Documentos\projetos connectai\studio Beauty\js\lashbot.js"`
Expected: Sucesso (sem erros de compilação ou de sintaxe retornados pelo interpretador de Node.js).

**Step 3: Commit das alterações**

```bash
git add js/lashbot.js docs/plans/2026-06-11-lashbot-biospik-integration-design.md
git commit -m "feat: integrar e-book labial/facial BioSpik à base de conhecimento do LashBot"
```

---

### Task 2: Verificação de Funcionalidade e Deploy

**Files:**
- Modify: N/A
- Test: Manualmente através do painel.

**Step 1: Testar resposta do bot localmente**
Validar que o bot responde perguntas baseadas nos ativos do BioSpik (ex. Micro PDRN, Needle Renew, MoistShield) ou home care 2x por semana.

**Step 2: Enviar alterações para repositório remoto**

```bash
git push origin main
```
Expected: Commit enviado com sucesso para a branch remota desencadeando o deploy automático.
