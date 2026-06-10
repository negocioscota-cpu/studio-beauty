# Design Doc: Marca d'água Automática e Compartilhamento Elegante no Portfólio

**Data:** 28 de Maio de 2026  
**Status:** Aprovado  
**Autor:** Antigravity (Gemini)

---

## 1. Objetivo

Aprimorar o módulo de Portfólio do **Studio Beauty** para que a profissional possa proteger suas fotos com marca d'água de forma automatizada e possa compartilhar resultados de Antes & Depois de forma elegante e com foco em conversão de clientes.

---

## 2. Requisitos Técnicos e Arquitetura

### 2.1 Marca d'água Automática na Imagem (Canvas API)
A marca d'água será gerada diretamente no painel administrativo ([portfolio.js](file:///C:/Users/conec/OneDrive/Documentos/projetos%20connectai/studio%20Beauty/pages/portfolio.js)) durante o fluxo de compressão de imagens (`compressImage`), para garantir que as fotos originais limpas nunca sejam enviadas ao banco de dados Firestore.

* **Abordagem (Opção 1):**
  - Checar a existência de `Store.studioData.logoUrl` (ou se o logo está cadastrado nas configurações).
  - Se a logo estiver disponível, desenhá-la no canto inferior direito da imagem com opacidade de 40%.
  - Se a logo não estiver disponível, desenhar o texto dinâmico `© [Nome do Estúdio]` com fonte semibold elegante, cor branca e uma sombra suave para assegurar contraste em fundos claros e escuros.

### 2.2 Unificação de Campos do Portfólio Público
Ajustar o portfólio público ([portfolio.html](file:///C:/Users/conec/OneDrive/Documentos/projetos%20connectai/studio%20Beauty/portfolio.html)) para ler e suportar de forma transparente ambos os pares de propriedades, garantindo retrocompatibilidade total:
* `photoBefore` / `photoAfter` (padrão de gravação do painel)
* `beforeUrl` / `afterUrl` (padrão legado lido pela página pública)

### 2.3 Link de Compartilhamento Direto com Auto-Lightbox (Deep Linking)
* O portfólio público verificará na inicialização (`PF.init()`) a presença da query string `?ver=[ID_DO_TRABALHO]`.
* Caso o parâmetro exista, após renderizar a grade de portfólio, o sistema disparará a abertura automática do Lightbox do trabalho específico em tela cheia (`PF.openLightbox(index)`).
* O botão de CTA principal *"✨ Quero agendar este procedimento"* será posicionado de forma chamativa abaixo da comparação de Antes & Depois.
* Um botão "Copiar Link de Divulgação" será adicionado na interface do painel da profissional para facilitar o envio rápido.

### 2.4 Botões Sociais e Compartilhamento Integrado
Abaixo dos detalhes de Antes & Depois na visualização pública do Lightbox, criaremos uma barra com ícones minimalistas e modernos:
* **WhatsApp:** Gera uma mensagem formatada com o link elegante e o nome do estúdio.
* **Instagram:** Fornece um modal rápido com instruções/dicas elegantes de como salvar e postar no Stories (uma vez que o Instagram não permite postagem direta de fotos via web API em PWAs).
* **Pinterest:** Botão Pin-it clássico para coleções de beleza.

---

## 3. Plano de Testes e Validação

* **Validação do Upload com Marca d'água:** Enviar fotos no painel administrativo e conferir se a imagem salva no Firestore possui o logo ou o nome textual incorporado na imagem.
* **Validação do Link Direto:** Acessar a URL `/portfolio/slug?ver=ID` e atestar se o portfólio carrega e abre o lightbox correto instantaneamente.
* **Compatibilidade Retroativa:** Garantir que itens antigos cadastrados com `beforeUrl` / `afterUrl` continuem renderizando normalmente na grade do portfólio.
