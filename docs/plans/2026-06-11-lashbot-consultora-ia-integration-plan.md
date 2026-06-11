# LashBot Consultora IA Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrar o conteúdo do e-book oficial de protocolos e produtos da Lash and Beauty (Marina Cota) à base de conhecimento do LashBot no arquivo `js/lashbot.js` de forma unificada e livre de duplicações.

**Architecture:** O prompt de sistema do LashBot (`SYSTEM_PROMPT`) no arquivo `js/lashbot.js` será atualizado. As seções `## 7` e `## 11` antigas serão mescladas na nova seção `## 7. LASH COMPLEX 3D (BOTOX & NANO LAMINATION)` contendo todas as descrições químicas, físicas e práticas do e-book. As seções subsequentes serão reordenadas de `## 8` a `## 17` de forma sequencial.

**Tech Stack:** JavaScript (ES6), HTML5/CSS3.

---

### Task 1: Atualizar SYSTEM_PROMPT no lashbot.js

**Files:**

- Modify: [lashbot.js](file:///C:/Users/conec/OneDrive/Documentos/projetos%20connectai/studio%20Beauty/js/lashbot.js#L133-L1190)

**Step 1: Substituir a seção ## 7 original pela nova seção unificada**

Modificar a seção `## 7. LASH COMPLEX 3D` original e remover a seção `## 11. COMPLEX 3D — COMPOSIÇÃO DETALHADA E PROTOCOLOS AVANÇADOS` antiga. As seções posteriores deverão ter suas numerações atualizadas conforme a reordenação proposta:
- `## 12. LAMI SYSTEM` passa a ser `## 11`
- `## 13. EXTENSÃO DE CÍLIOS` passa a ser `## 12`
- `## 14. PROTOCOLO PRÁTICO — LASH LIFTING` passa a ser `## 13`
- `## 15. PROTOCOLO PRÁTICO — BROW LAMINATION` passa a ser `## 14`
- `## 16. ESTÉTICA FACIAL` passa a ser `## 15`
- `## 17. MANICURE` passa a ser `## 16`
- `## 18. RECURSOS DO SISTEMA` passa a ser `## 17`

**Step 2: Verificar sintaxe do arquivo lashbot.js**

Garantir que a string literal `SYSTEM_PROMPT` permaneça devidamente fechada e sem erros de sintaxe JS.
Executar: `node -c "C:\Users\conec\OneDrive\Documentos\projetos connectai\studio Beauty\js\lashbot.js"`
Expected: Sucesso (sem erros de compilação ou de sintaxe retornados pelo interpretador de Node.js).

**Step 3: Commit das alterações**

```bash
git add js/lashbot.js docs/plans/2026-06-11-lashbot-consultora-ia-integration-design.md
git commit -m "feat: integrar conteúdo do e-book oficial de protocolos à base de conhecimento do LashBot"
```

---

### Task 2: Verificação de Funcionalidade e Deploy

**Files:**
- Modify: N/A
- Test: Manualmente através do painel.

**Step 1: Testar resposta do bot localmente**
Validar que o bot responde perguntas baseadas nas novidades inseridas (como ativos específicos ou o mecanismo de nanoencapsulação).

**Step 2: Enviar alterações para repositório remoto**

```bash
git push origin main
```
Expected: Commit enviado com sucesso para a branch remota desencadeando o deploy automático.
