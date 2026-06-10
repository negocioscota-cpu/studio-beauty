# Melhorias do Módulo Portfólio — Plano de Implementação

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar marca d'água automática em imagens de Antes & Depois usando Canvas API, corrigir incompatibilidade de campos no portfólio público, e adicionar links de compartilhamento elegantes com auto-lightbox para impulsionar conversões de agendamento.

**Architecture:** 
1. Adicionar processamento no upload de imagens em `pages/portfolio.js` para estampar a marca d'água (logo do estúdio ou nome textual) na imagem final enviada ao Firestore.
2. Modificar o portfólio público `portfolio.html` para ler ambos os padrões de campos (`photoBefore`/`photoAfter` e `beforeUrl`/`afterUrl`).
3. Implementar lógica de query parameter `?ver=id` na inicialização do portfólio público para abrir automaticamente o Lightbox do trabalho e adicionar botões de compartilhamento social.
4. Adicionar ação de cópia de link de divulgação no painel administrativo.

**Tech Stack:** HTML5, CSS3, Vanilla JS (PWA), Canvas API, Firebase Firestore.

---

### Task 1: Carregar Dados do Estúdio no Portfólio Interno

**Files:**
- Modify: `C:\Users\conec\OneDrive\Documentos\projetos connectai\studio Beauty\pages\portfolio.js`

**Step 1: Carregar studioData na inicialização do render**
Modificar o método `render(container)` em `pages/portfolio.js` para ler as configurações da coleção `studios` com o UID logado do estúdio e salvar no escopo do objeto `Portfolio`.

```javascript
    async render(container) {
        Portfolio.currentClients = await Store.getClients();
        let items = await Store.getPortfolio();
        
        // Carrega dados do estúdio para marca d'água e links
        try {
            const uid = Store._uid();
            const studioDoc = await db.collection('studios').doc(uid).get();
            Portfolio.studioData = studioDoc.exists ? studioDoc.data() : {};
        } catch (e) {
            console.error('Erro ao carregar dados do estúdio:', e);
            Portfolio.studioData = {};
        }
```

**Step 2: Verificar se renderiza com sucesso**
Recarregar o app no painel de Portfólio e certificar-se de que os dados do estúdio foram inicializados sem erros no console.

**Step 3: Commit**
```bash
git add pages/portfolio.js
git commit -m "feat: load studioData for watermarking in portfolio"
```

---

### Task 2: Implementar Marca D'água na Compressão via Canvas API

**Files:**
- Modify: `C:\Users\conec\OneDrive\Documentos\projetos connectai\studio Beauty\pages\portfolio.js`

**Step 1: Atualizar a função `compressImage` para estampar a marca d'água**
Estender `compressImage(file, maxWidth, quality)` para aplicar o logotipo com transparência ou o nome do estúdio no Canvas antes de gerar o dataURL de salvamento.

```javascript
    compressImage(file, maxWidth, quality) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width, h = img.height;
                    if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);

                    // Lógica da Marca d'água
                    const studioName = Portfolio.studioData?.studioName || 'Studio Beauty';
                    const logoUrl = Portfolio.studioData?.logoUrl;

                    if (logoUrl) {
                        try {
                            const logoImg = new Image();
                            logoImg.crossOrigin = "anonymous";
                            await new Promise((res, rej) => {
                                logoImg.onload = res;
                                logoImg.onerror = rej;
                                logoImg.src = logoUrl;
                            });
                            // Desenha logo no canto inferior direito
                            const logoSize = Math.min(w, h) * 0.15; // 15% da menor dimensão
                            const margin = 16;
                            ctx.globalAlpha = 0.45;
                            ctx.drawImage(logoImg, w - logoSize - margin, h - logoSize - margin, logoSize, logoSize);
                            ctx.globalAlpha = 1.0;
                        } catch (err) {
                            console.warn('Falha ao carregar logo para marca d'água, aplicando fallback textual:', err);
                            Portfolio._drawTextWatermark(ctx, w, h, studioName);
                        }
                    } else {
                        Portfolio._drawTextWatermark(ctx, w, h, studioName);
                    }

                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    },

    _drawTextWatermark(ctx, w, h, text) {
        const fontSize = Math.max(12, Math.round(w * 0.03)); // Escala com a largura da imagem
        ctx.font = `bold ${fontSize}px "Inter", sans-serif`;
        
        // Medir tamanho
        const fullText = `© ${text}`;
        const textWidth = ctx.measureText(fullText).width;
        const margin = 16;
        
        // Desenha sombra/fundo translúcido para contraste
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(w - textWidth - margin - 8, h - fontSize - margin - 4, textWidth + 16, fontSize + 8);
        
        // Texto
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillText(fullText, w - textWidth - margin, h - margin - 2);
    },
```

**Step 2: Testar upload**
Subir uma nova foto de Antes ou Depois no painel e conferir se ela é gerada com o texto ou logo estampados no canto inferior direito.

**Step 3: Commit**
```bash
git add pages/portfolio.js
git commit -m "feat: implement canvas-based automatic watermarking on upload"
```

---

### Task 3: Unificar Campos e Retrocompatibilidade no Portfólio Público

**Files:**
- Modify: `C:\Users\conec\OneDrive\Documentos\projetos connectai\studio Beauty\portfolio.html`

**Step 1: Atualizar renderização da grade e lightbox para compatibilidade**
Garantir que a página pública leia tanto `photoBefore`/`photoAfter` quanto `beforeUrl`/`afterUrl`.

```javascript
  _grid(items) {
    const grid = document.getElementById('pf-grid');
    if (!items.length) { grid.innerHTML='<div class="pf-empty"><div style="font-size:3rem;opacity:.35">📷</div><strong>Nenhum trabalho cadastrado ainda</strong></div>'; return; }
    grid.innerHTML = items.map((item,idx)=>{
      const before = item.photoBefore || item.beforeUrl || '';
      const after = item.photoAfter || item.afterUrl || '';
      return `
      <div class="pf-card" onclick="PF.openLightbox(${idx})">
        ${after&&before
          ?`<div class="pf-before-after"><img class="pf-img" src="${before}" alt="Antes" loading="lazy"/><img class="pf-img" src="${after}" alt="Depois" loading="lazy"/><div class="pf-ba-badge">B|D</div></div>`
          :`<img class="pf-img-single" src="${after||before||''}" alt="${item.procedure||'Trabalho'}" loading="lazy"/>`}
        <div class="pf-info">
          <div class="pf-procedure">${item.procedure||''}</div>
          ${item.notes||item.caption?`<div class="pf-caption">${item.notes||item.caption}</div>`:''}
        </div>
      </div>`}).join('');
  },
  openLightbox(idx) {
    const list = PF.currentFilter?PF.items.filter(i=>i.procedure===PF.currentFilter):PF.items;
    const item = list[idx]; if(!item) return;
    const bk = `/booking/${PF.studioData.bookingSlug}`;
    const before = item.photoBefore || item.beforeUrl;
    const after = item.photoAfter || item.afterUrl;
    
    document.getElementById('lb-inner').innerHTML=`
      ${after&&before
        ?`<div class="lb-ba"><img class="lb-img" src="${before}" alt="Antes"/><img class="lb-img" src="${after}" alt="Depois"/></div>`
        :`<img class="lb-single" src="${after||before}" alt="${item.procedure||''}"/>`}
      <div class="lb-info">
        ${item.procedure?`<div class="lb-proc">${item.procedure}</div>`:''}
        ${item.notes||item.caption?`<div class="lb-caption">${item.notes||item.caption}</div>`:''}
        <a class="lb-book" href="${bk}">✨ Quero agendar este procedimento</a>
      </div>`;
    document.getElementById('pf-lightbox').classList.add('open');
  },
```

**Step 2: Verificar se exibe fotos**
Verificar se o portfólio público passa a renderizar corretamente as fotos antigas e novas.

**Step 3: Commit**
```bash
git add portfolio.html
git commit -m "fix: restore compatibility for photoBefore/photoAfter fields"
```

---

### Task 4: Implementar Deep Linking com Auto-Lightbox no Portfólio Público

**Files:**
- Modify: `C:\Users\conec\OneDrive\Documentos\projetos connectai\studio Beauty\portfolio.html`

**Step 1: Adicionar suporte a `?ver=id` na inicialização do portfólio público**
```javascript
    try {
      const snap = await db.collection('studios').where('bookingSlug','==',slug).limit(1).get();
      if (snap.empty) { PF.notFound(); return; }
      const doc = snap.docs[0];
      PF.studioUid = doc.id; PF.studioData = doc.data();
      let items = [];
      try {
        const is = await db.collection('portfolio').where('userId','==',PF.studioUid).orderBy('date','desc').limit(80).get();
        items = is.docs.map(d => ({id:d.id,...d.data()}));
      } catch(e){}
      PF.items = items;
      PF._header(); PF._filters(); PF._grid(items);
      document.getElementById('pf-loading').style.display = 'none';
      document.getElementById('pf-app').style.display = 'block';
      
      // Auto-open Lightbox se "ver" estiver presente na URL
      const urlParams = new URLSearchParams(window.location.search);
      const verId = urlParams.get('ver');
      if (verId) {
        const idx = PF.items.findIndex(item => item.id === verId);
        if (idx !== -1) {
          setTimeout(() => PF.openLightbox(idx), 300);
        }
      }
    }
```

**Step 2: Commit**
```bash
git add portfolio.html
git commit -m "feat: add ?ver=id parameter for automatic lightbox deep linking"
```

---

### Task 5: Adicionar Botões Sociais e Ação de Compartilhamento no Lightbox e Painel

**Files:**
- Modify: `C:\Users\conec\OneDrive\Documentos\projetos connectai\studio Beauty\portfolio.html`
- Modify: `C:\Users\conec\OneDrive\Documentos\projetos connectai\studio Beauty\pages\portfolio.js`

**Step 1: Adicionar botões de compartilhamento no Lightbox público**
Atualizar `openLightbox` no `portfolio.html` para renderizar botões de WhatsApp, Pinterest e Cópia de Link e adicionar funções auxiliares:
```javascript
  openLightbox(idx) {
    const list = PF.currentFilter?PF.items.filter(i=>i.procedure===PF.currentFilter):PF.items;
    const item = list[idx]; if(!item) return;
    const bk = `/booking/${PF.studioData.bookingSlug}`;
    const before = item.photoBefore || item.beforeUrl;
    const after = item.photoAfter || item.afterUrl;
    const currentUrl = `${window.location.origin}${window.location.pathname}?ver=${item.id}`;
    
    document.getElementById('lb-inner').innerHTML=`
      ${after&&before
        ?`<div class="lb-ba"><img class="lb-img" src="${before}" alt="Antes"/><img class="lb-img" src="${after}" alt="Depois"/></div>`
        :`<img class="lb-single" src="${after||before}" alt="${item.procedure||''}"/>`}
      <div class="lb-info">
        ${item.procedure?`<div class="lb-proc">${item.procedure}</div>`:''}
        ${item.notes||item.caption?`<div class="lb-caption">${item.notes||item.caption}</div>`:''}
        
        <div style="display:flex;gap:12px;margin: 16px 0;border-top:1px solid var(--border);padding-top:12px;justify-content:center;align-items:center">
          <span style="font-size:0.75rem;color:var(--text-muted)">Compartilhar resultado:</span>
          <a href="https://wa.me/?text=${encodeURIComponent('Olha esse antes e depois incrível do procedimento ' + (item.procedure || '') + ' que vi no ' + (PF.studioData.studioName || 'estúdio') + '! 😍 Confira no link: ' + currentUrl)}" target="_blank" style="color:#25D366;display:flex;align-items:center" title="WhatsApp">
            <span class="material-symbols-outlined" style="font-size:22px">chat</span>
          </a>
          <a href="#" onclick="PF.copyLink(event, '${currentUrl}')" style="color:var(--primary-light);display:flex;align-items:center" title="Copiar Link">
            <span class="material-symbols-outlined" style="font-size:22px">link</span>
          </a>
        </div>
        
        <a class="lb-book" href="${bk}">✨ Quero agendar este procedimento</a>
      </div>`;
    document.getElementById('pf-lightbox').classList.add('open');
  },
  copyLink(e, url) {
    e.preventDefault();
    navigator.clipboard.writeText(url).then(() => {
      alert('Link direto copiado com sucesso! 🔗');
    });
  }
```

**Step 2: Adicionar botão e ação de Copiar Link Directo no Painel Administrativo (`pages/portfolio.js`)**
Modificar `Portfolio.cardHtml` para adicionar a ação elegante de cópia:
```javascript
                <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();Portfolio.copyDirectLink('${p.id}')" title="Copiar link de divulgação">
                  <span class="material-symbols-outlined" style="font-size:16px">link</span>
                </button>
```
E implementar o método `copyDirectLink(id)`:
```javascript
    copyDirectLink(id) {
        const slug = Portfolio.studioData?.bookingSlug || '';
        if (!slug) {
            App.showToast('Configure o slug de agendamento nas configurações primeiro!', 'warning');
            return;
        }
        const link = `${window.location.origin}/portfolio/${slug}?ver=${id}`;
        navigator.clipboard.writeText(link).then(() => {
            App.showToast('🔗 Link direto copiado para a área de transferência!', 'success');
        }).catch(err => {
            App.showToast('Erro ao copiar link.', 'error');
        });
    },
```

**Step 3: Commit**
```bash
git add portfolio.html pages/portfolio.js
git commit -m "feat: integrate direct share buttons and admin link copier"
```

---

## Plano de Verificação

### Automated Tests
* Nossos testes manuais cobrirão o fluxo completo por se tratar de lógica Vanilla JS e Canvas no navegador.

### Manual Verification
1. **Marca d'água:** Criar um novo registro de Antes e Depois, subir imagens e checar a inserção do logo do estúdio ou nome no canto inferior direito.
2. **Deep linking:** Acessar o link do portfólio público com o query param `?ver=ID` e confirmar se o lightbox correto abre automaticamente.
3. **Botão de compartilhar:** Clicar em compartilhar e garantir que o link direto gerado funciona.
