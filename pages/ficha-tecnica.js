// === FICHA TÉCNICA — Módulo Exclusivo LashBrow ===
const FichaTecnica = {
    editingId: null,
    currentClients: [],
    currentType: 'cilios',  // 'cilios' | 'lashlifting' | 'sobrancelhas' | 'labios' | 'facial'

    // === Paginação ===
    _pageSize: 30,
    _lastDoc: null,
    _hasMore: false,
    _currentFichas: [],

    async render(container) {
        FichaTecnica.currentClients = await Store.getClients();
        // Paginação: carrega primeira página
        FichaTecnica._lastDoc = null;
        FichaTecnica._hasMore = false;
        const result = await Store.getFichasTecnicasPaginated(FichaTecnica._pageSize);
        const fichas = result.fichas;
        FichaTecnica._currentFichas = fichas;
        FichaTecnica._lastDoc = result.lastVisible;
        FichaTecnica._hasMore = result.hasMore;

        container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          <!-- Toolbar -->
          <div class="toolbar">
            <div style="display:flex;align-items:center;gap:10px">
              <span class="material-symbols-outlined" style="color:var(--primary);font-size:28px">spa</span>
              <span style="font-size:1rem;font-weight:600;color:var(--text-secondary)">Registro completo de procedimentos estéticos faciais</span>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-primary" onclick="FichaTecnica.openModal(null,'cilios')" style="background:var(--primary);border-color:var(--primary)">
                <span class="material-symbols-outlined">add</span> Ficha de Cílios
              </button>
              <button class="btn btn-primary" onclick="FichaTecnica.openModal(null,'lashlifting')" style="background:#E8A838;border-color:#E8A838">
                <span class="material-symbols-outlined">add</span> Ficha Lash Lifting
              </button>
              <button class="btn btn-primary" onclick="FichaTecnica.openModal(null,'sobrancelhas')" style="background:#7B61FF;border-color:#7B61FF">
                <span class="material-symbols-outlined">add</span> Ficha de Sobrancelhas
              </button>
              <button class="btn btn-primary" onclick="FichaTecnica.openModal(null,'labios')" style="background:#E05080;border-color:#E05080">
                <span class="material-symbols-outlined">add</span> Ficha de Lábios
              </button>
              <button class="btn btn-primary" onclick="FichaTecnica.openModal(null,'facial')" style="background:#2E9E6E;border-color:#2E9E6E">
                <span class="material-symbols-outlined">add</span> Ficha Facial
              </button>
              <button class="btn btn-primary" onclick="FichaTecnica.openModal(null,'manicure')" style="background:#ec4899;border-color:#ec4899">
                <span class="material-symbols-outlined">add</span> Ficha de Manicure
              </button>
            </div>
          </div>

          <!-- Fichas -->
          <div id="fichas-grid" class="fichas-grid">
            ${fichas.length === 0
                ? `<div class="empty-state" style="grid-column:1/-1">
                    <span class="material-symbols-outlined empty-state-icon">spa</span>
                    <p class="empty-state-title">Nenhuma ficha técnica ainda</p>
                    <p class="empty-state-desc">Registre os procedimentos para acompanhar o histórico de cada cliente.</p>
                    <button class="btn btn-primary" onclick="FichaTecnica.openModal()">Criar primeira ficha</button>
                   </div>`
                : fichas.map(f => FichaTecnica.cardHtml(f)).join('')
            }
          </div>

          <!-- Paginação Fichas -->
          <div id="fichas-pagination" style="display:flex;justify-content:center;padding:16px;gap:12px;align-items:center"></div>
        </div>

        <!-- Modal -->
        <div id="ficha-modal" class="modal-overlay hidden" onclick="FichaTecnica.closeModal(event)">
          <div class="modal-container modal-large" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title" id="ficha-modal-title">✨ Ficha Técnica de Procedimento</h3>
              <button class="modal-close" onclick="FichaTecnica.closeModal()">✕</button>
            </div>
            <form id="ficha-form" onsubmit="FichaTecnica.handleSave(event)" class="modal-body">
              <div class="form-grid">

                <!-- Cliente e tipo -->
                <div class="form-group">
                  <label class="form-label">Cliente *</label>
                  <select class="form-control" id="ficha-client" required>
                    <option value="">-- Selecione a cliente --</option>
                    ${FichaTecnica.currentClients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Data do Procedimento *</label>
                  <input class="form-control" type="date" id="ficha-date" required value="${new Date().toISOString().split('T')[0]}" />
                </div>
                <div class="form-group">
                  <label class="form-label">Tipo de Procedimento *</label>
                  <select class="form-control" id="ficha-type" required onchange="FichaTecnica._toggleOutroTipo()">
                    <option value="">-- Selecione --</option>
                    <optgroup label="Cílios" data-kind="cilios">
                      <option>Fio a Fio Clássico</option>
                      <option>Volume Russo</option>
                      <option>Volume Brasileiro / Egípcio / Híbrido</option>
                      <option>Efeitos de Tendência (Wispy / Molhado)</option>
                      <option>Manutenção (Refill)</option>
                      <option>Remoção Química</option>
                      <option value="__outro_cilios__">Outro...</option>
                    </optgroup>
                    <optgroup label="Lash Lifting" data-kind="lashlifting">
                      <option>Lash Lifting Tradicional</option>
                      <option>Tintura dos Cílios</option>
                      <option>Lash Botox / Nutrição Profunda</option>
                      <option>Reversão de Lifting</option>
                      <option>Visagismo e Mapeamento (Mapping)</option>
                      <option>Higienização Profunda (Lash Cleansing)</option>
                      <option value="__outro_lifting__">Outro...</option>
                    </optgroup>
                    <optgroup label="Sobrancelhas" data-kind="sobrancelhas">
                      <option>Design Simples (com pinça/linha/cera)</option>
                      <option>Design com Henna</option>
                      <option>Design com Tintura / Coloração Refectocil</option>
                      <option>Brow Lamination</option>
                      <option>Nutrição Profunda / Brow Botox</option>
                      <option>Reconstrução de Sobrancelhas</option>
                      <option>Microblading (Fio a Fio Tebori)</option>
                      <option>Shadow / Shadow Line / Pixel</option>
                      <option>Despigmentação Química ou a Laser</option>
                      <option>Epilação Facial Completa (Egípcia/Linha)</option>
                      <option>Descoloração de Sobrancelhas (Clareamento Sutil)</option>
                      <option value="__outro_sobrancelhas__">Outro...</option>
                    </optgroup>
                    <optgroup label="Lábios — Lips Designer" data-kind="labios">
                      <option>Efeito Batom / Efeito Pixel</option>
                      <option>Efeito Aquarela (Aquarelle Lips)</option>
                      <option>Neutralização de Lábios Escuros / Melânicos</option>
                      <option>Hydra Lips / Hydra Gloss</option>
                      <option>Microagulhamento Labial com Ativos (Vitamina C/Ácido Hialurônico)</option>
                      <option>Revitalização Labial / Peeling Labial</option>
                      <option>Despigmentação de Micropigmentação Labial (Química ou Laser)</option>
                    </optgroup>
                    <optgroup label="Lábios — Procedimentos Injetáveis (Clínicos)" data-kind="labios">
                      <option>Preenchimento Labial com Ácido Hialurônico</option>
                      <option>Lip Flip (Aplicação de Toxina Botulínica)</option>
                      <option value="__outro_labios__">Outro...</option>
                    </optgroup>
                    <optgroup label="Facial — Limpeza e Renovação Celular" data-kind="facial">
                      <option>Limpeza de Pele Profunda</option>
                      <option>Peeling Químico Superficial / Enzimático</option>
                      <option>Microagulhamento (Indução Percutânea de Colágeno)</option>
                    </optgroup>
                    <optgroup label="Facial — Terapias Regenerativas e Gerenciamento" data-kind="facial">
                      <option>Protocolo de Exossomos e Fatores de Crescimento</option>
                      <option>Skinbooster (Hidratação Injetável)</option>
                    </optgroup>
                    <optgroup label="Facial — Estruturação e Sustentação (Injetáveis)" data-kind="facial">
                      <option>Aplicação de Toxina Botulínica (Botox)</option>
                      <option>Bioestimuladores de Colágeno (Sculptra / Radiesse)</option>
                      <option>Preenchimento Facial com Ácido Hialurônico</option>
                      <option>Fios de Sustentação / Fios de PDO</option>
                    </optgroup>
                    <optgroup label="Facial — Tecnologias Avançadas (Aparelhos)" data-kind="facial">
                      <option>Ultrassom Micro e Macrofocado (Ultraformer / Liftera)</option>
                      <option>Laser Lavieen / BB Laser</option>
                      <option>Laser de CO2 Fracionado</option>
                      <option value="__outro_facial__">Outro...</option>
                    </optgroup>
                    <optgroup label="Manicure &amp; Nail Designer" data-kind="manicure">
                      <option>Manicure &amp; Pedicure Tradicional</option>
                      <option>Esmaltação em Gel</option>
                      <option>Blindagem de Unhas</option>
                      <option>Banho de Gel / Banho de Acrílico</option>
                      <option>Alongamento em Gel (Molde/Tip)</option>
                      <option>Alongamento em Fibra de Vidro</option>
                      <option>Alongamento em Acrigel</option>
                      <option>Alongamento Molde F1 (Dual System)</option>
                      <option>Manutenção de Alongamento</option>
                      <option>Remoção de Alongamento / Esmalte em Gel</option>
                      <option>Nail Art / Decoração</option>
                      <option value="__outro_manicure__">Outro...</option>
                    </optgroup>
                  </select>
                  <input class="form-control" id="ficha-type-outro" placeholder="Descreva o procedimento..." style="display:none;margin-top:6px" />
                </div>
                <div class="form-group">
                  <label class="form-label">Próximo Retoque</label>
                  <input class="form-control" type="date" id="ficha-retouch" />
                </div>

                <!-- Laudo dos Cílios Naturais (só cílios) -->
                <div id="ficha-sec-cilios" class="form-group form-group-full ficha-section">
                  <div class="ficha-section-title" style="background:linear-gradient(135deg,var(--primary-xlight),transparent);border-left:3px solid var(--primary);padding-left:10px">
                    <span class="material-symbols-outlined">biotech</span> Laudo dos Cílios Naturais
                    <span style="font-size:0.72rem;font-weight:400;opacity:0.7;margin-left:6px">Registro do estado dos cílios antes do procedimento</span>
                  </div>
                  <div class="form-grid" style="margin-top:12px">
                    <div class="form-group">
                      <label class="form-label">Descrição / Direção dos Cílios *</label>
                      <select class="form-control" id="ficha-nat-desc">
                        <option value="">-- Selecione --</option>
                        <option>Semi curvados</option>
                        <option>Retos</option>
                        <option>Projeção para baixo (droopy)</option>
                        <option>Muito abertos (leque)</option>
                        <option>Cruzados / desorganizados</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Tamanho dos Cílios Naturais</label>
                      <div style="display:flex;gap:8px;margin-top:4px">
                        ${['Curtos','Médios','Longos'].map(t=>`
                        <label style="flex:1;display:flex;align-items:center;gap:5px;padding:9px 10px;border:1.5px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:0.85rem;font-weight:500" id="nat-size-lbl-${t}">
                          <input type="radio" name="ficha-nat-size" value="${t}" onchange="FichaTecnica._highlightNatSize()" style="accent-color:var(--primary)" />${t}
                        </label>`).join('')}
                      </div>
                    </div>
                    <div class="form-group form-group-full">
                      <label class="form-label">Observações sobre os cílios naturais</label>
                      <textarea class="form-control" id="ficha-nat-obs" rows="2" placeholder="Ex: cílios frágeis, histórico de arranhamentos, cobertura irregular..."></textarea>
                    </div>
                    <!-- Mídia do estado inicial -->
                    <div class="form-group form-group-full">
                      <label class="form-label">📸 Mídia — Registro do Estado Inicial
                        <span style="font-size:0.72rem;font-weight:400;color:var(--text-muted)"> (foto ou vídeo para comprovação antes do serviço)</span>
                      </label>
                      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
                        <label style="flex:1;min-width:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:18px;border:2px dashed var(--border);border-radius:10px;cursor:pointer;font-size:0.84rem;color:var(--text-secondary);transition:border-color .2s;text-align:center"
                               onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
                          <span class="material-symbols-outlined" style="font-size:28px;color:var(--primary)">add_a_photo</span>
                          Adicionar Foto / Vídeo
                          <input type="file" id="ficha-nat-media" accept="image/*,video/*" multiple style="display:none" onchange="FichaTecnica._previewMedia(this)" />
                        </label>
                        <div id="ficha-nat-media-preview" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start"></div>
                      </div>
                      <div id="ficha-nat-media-links" style="margin-top:8px;font-size:0.8rem;color:var(--text-muted)"></div>
                      <p style="font-size:0.75rem;color:var(--text-muted);margin:6px 0 0">💡 Dica: registre o estado ANTES do procedimento. Isso é sua proteção em caso de contestações.</p>
                    </div>
                  </div>
                </div>

                <!-- Mapeamento (cílios / lash lifting / sobrancelhas) -->
                <div id="ficha-sec-mapeamento" class="form-group form-group-full ficha-section">
                  <div class="ficha-section-title">
                    <span class="material-symbols-outlined">visibility</span> Mapeamento
                    <span style="font-size:0.72rem;font-weight:400;opacity:0.7;margin-left:6px">Descreva o mapeamento, design, medidas e técnicas utilizadas</span>
                  </div>
                  <div style="margin-top:12px">
                    <textarea class="form-control" id="ficha-mapeamento" rows="4" placeholder="Ex: Curvatura C e D, espessura 0.07, comprimento 9-11-13, design Cat Eye...&#10;Descreva livremente o mapeamento utilizado nesta cliente."></textarea>
                  </div>
                </div>

                <!-- ══ PROTOCOLO LAMI SYSTEM 3D (lashlifting + sobrancelhas) ══ -->
                <div id="ficha-sec-lami" class="form-group form-group-full ficha-section" style="display:none">
                  <div class="ficha-section-title" style="background:linear-gradient(135deg,rgba(232,168,56,0.12),transparent);border-left:3px solid #E8A838;padding-left:10px">
                    <span class="material-symbols-outlined">biotech</span> Protocolo Lami System 3D — 6 Passos
                    <span style="font-size:0.72rem;font-weight:400;opacity:0.7;margin-left:6px">Marque os produtos Lami System utilizados nesta sessão</span>
                  </div>
                  <div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px">
                    ${[
                      {id:'c3d-p1',     label:'Passo 1',          sub:'Limpeza e preparo',        icon:'cleaning_services'},
                      {id:'c3d-p15',    label:'Passo 1.5',         sub:'Nutrição intermediária',   icon:'spa'},
                      {id:'c3d-p2',     label:'Passo 2',           sub:'Fixação e selamento',      icon:'lock'},
                      {id:'c3d-revita', label:'Revita',            sub:'Revitalização dos cílios',  icon:'favorite'},
                      {id:'c3d-cp1',    label:'Complex 3D Passo 1',sub:'Primeiro complexo 3D',     icon:'science'},
                      {id:'c3d-cp2',    label:'Complex 3D Passo 2',sub:'Segundo complexo 3D',      icon:'science'}
                    ].map(p => `
                    <label id="lbl-${p.id}" onclick="FichaTecnica._toggleProtocol('${p.id}')" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1.5px solid var(--border);border-radius:12px;cursor:pointer;transition:all .18s;user-select:none;background:var(--surface)">
                      <input type="checkbox" id="${p.id}" name="c3d-protocol" value="${p.label}" style="display:none" />
                      <span id="icon-${p.id}" class="material-symbols-outlined" style="font-size:22px;color:var(--text-muted);flex-shrink:0;transition:color .18s">${p.icon}</span>
                      <div style="flex:1;min-width:0">
                        <div style="font-size:0.88rem;font-weight:700;color:var(--text-primary);line-height:1.2">${p.label}</div>
                        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px">${p.sub}</div>
                      </div>
                      <span id="chk-${p.id}" class="material-symbols-outlined" style="font-size:20px;color:var(--text-muted);flex-shrink:0;transition:all .18s">check_circle</span>
                    </label>`).join('')}
                  </div>
                </div>

                <!-- Laudo de Sobrancelhas (só sobrancelhas) -->
                <div id="ficha-sec-sobrancelhas" class="form-group form-group-full ficha-section" style="display:none">
                  <div class="ficha-section-title" style="background:linear-gradient(135deg,#7B61FF18,transparent);border-left:3px solid #7B61FF;padding-left:10px">
                    <span class="material-symbols-outlined">face</span> Laudo das Sobrancelhas Naturais
                    <span style="font-size:0.72rem;font-weight:400;opacity:0.7;margin-left:6px">Registro do estado das sobrancelhas antes do procedimento</span>
                  </div>
                  <div class="form-grid" style="margin-top:12px">
                    <div class="form-group">
                      <label class="form-label">Densidade dos Fios</label>
                      <select class="form-control" id="ficha-brow-density">
                        <option value="">-- Selecione --</option>
                        <option>Rala / Muito fina</option>
                        <option>Fina</option>
                        <option>Média</option>
                        <option>Densa</option>
                        <option>Muito densa</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Formato da Arcada Natural</label>
                      <select class="form-control" id="ficha-brow-shape">
                        <option value="">-- Selecione --</option>
                        <option>Reta</option>
                        <option>Levemente arqueada</option>
                        <option>Arqueada</option>
                        <option>Descendente (caída)</option>
                        <option>Irregular</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Direção dos Fios</label>
                      <select class="form-control" id="ficha-brow-direction">
                        <option value="">-- Selecione --</option>
                        <option>Ordenados (crescimento regular)</option>
                        <option>Desorganizados / cruzados</option>
                        <option>Crescimento para baixo</option>
                        <option>Músculo frontal elevado (arqueamento natural)</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Cor / Tom dos Fios</label>
                      <select class="form-control" id="ficha-brow-color">
                        <option value="">-- Selecione --</option>
                        <option>Loiro muito claro</option>
                        <option>Loiro</option>
                        <option>Castanho claro</option>
                        <option>Castanho médio</option>
                        <option>Castanho escuro</option>
                        <option>Preto</option>
                        <option>Grisalho / Branco</option>
                      </select>
                    </div>
                    <div class="form-group form-group-full">
                      <label class="form-label">Observações sobre as sobrancelhas naturais</label>
                      <textarea class="form-control" id="ficha-brow-obs" rows="2" placeholder="Ex: cicatriz, área com falha, micropigmentação antiga, pelos encravados..."></textarea>
                    </div>
                    <!-- Mídia do estado inicial -->
                    <div class="form-group form-group-full">
                      <label class="form-label">📸 Mídia — Registro do Estado Inicial
                        <span style="font-size:0.72rem;font-weight:400;color:var(--text-muted)"> (foto ou vídeo antes do procedimento)</span>
                      </label>
                      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
                        <label style="flex:1;min-width:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:18px;border:2px dashed var(--border);border-radius:10px;cursor:pointer;font-size:0.84rem;color:var(--text-secondary);transition:border-color .2s;text-align:center"
                               onmouseover="this.style.borderColor='#7B61FF'" onmouseout="this.style.borderColor='var(--border)'">
                          <span class="material-symbols-outlined" style="font-size:28px;color:#7B61FF">add_a_photo</span>
                          Adicionar Foto / Vídeo
                          <input type="file" id="ficha-brow-media" accept="image/*,video/*" multiple style="display:none" onchange="FichaTecnica._previewBrowMedia(this)" />
                        </label>
                        <div id="ficha-brow-media-preview" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start"></div>
                      </div>
                      <div id="ficha-brow-media-links" style="margin-top:8px;font-size:0.8rem;color:var(--text-muted)"></div>
                      <p style="font-size:0.75rem;color:var(--text-muted);margin:6px 0 0">💡 Dica: registre o estado ANTES para evitar contestações de clientes após o procedimento.</p>
                    </div>
                  </div>
                </div>

                <!-- Laudo dos Lábios (só lábios) -->
                <div id="ficha-sec-labios" class="form-group form-group-full ficha-section" style="display:none">
                  <div class="ficha-section-title" style="background:linear-gradient(135deg,rgba(224,80,128,0.12),transparent);border-left:3px solid #E05080;padding-left:10px">
                    <span class="material-symbols-outlined">emoji_emotions</span> Laudo Labial — Estado Inicial
                    <span style="font-size:0.72rem;font-weight:400;opacity:0.7;margin-left:6px">Registro do estado dos lábios antes do procedimento</span>
                  </div>
                  <div class="form-grid" style="margin-top:12px">
                    <div class="form-group">
                      <label class="form-label">Coloração Natural</label>
                      <select class="form-control" id="ficha-lip-color">
                        <option value="">-- Selecione --</option>
                        <option>Rosado claro</option>
                        <option>Rosado médio</option>
                        <option>Avermelhado</option>
                        <option>Acastanhado / Escuro</option>
                        <option>Arroxeado / Melânico</option>
                        <option>Desigual (manchado)</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Formato / Contorno</label>
                      <select class="form-control" id="ficha-lip-shape">
                        <option value="">-- Selecione --</option>
                        <option>Simétrico e definido</option>
                        <option>Assimétrico</option>
                        <option>Lábios finos</option>
                        <option>Lábios médios</option>
                        <option>Lábios carnudos</option>
                        <option>Contorno indefinido</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Textura / Hidratação</label>
                      <select class="form-control" id="ficha-lip-texture">
                        <option value="">-- Selecione --</option>
                        <option>Hidratados e lisos</option>
                        <option>Ressecados / Descamando</option>
                        <option>Com rachaduras / Fissuras</option>
                        <option>Cicatrizes visíveis</option>
                        <option>Micropigmentação anterior visível</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Simetria Labial</label>
                      <select class="form-control" id="ficha-lip-symmetry">
                        <option value="">-- Selecione --</option>
                        <option>Simétrica</option>
                        <option>Lábio superior mais fino</option>
                        <option>Lábio inferior mais fino</option>
                        <option>Desvio lateral</option>
                        <option>Arco de cupido acentuado</option>
                        <option>Arco de cupido ausente</option>
                      </select>
                    </div>
                    <div class="form-group form-group-full">
                      <label class="form-label">Observações sobre os lábios</label>
                      <textarea class="form-control" id="ficha-lip-obs" rows="2" placeholder="Ex: herpes recorrente, alergias a pigmentos, micropigmentação antiga, cicatriz, quelóide..."></textarea>
                    </div>
                    <!-- Mídia do estado inicial -->
                    <div class="form-group form-group-full">
                      <label class="form-label">📸 Mídia — Registro do Estado Inicial
                        <span style="font-size:0.72rem;font-weight:400;color:var(--text-muted)"> (foto antes do procedimento)</span>
                      </label>
                      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
                        <label style="flex:1;min-width:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:18px;border:2px dashed var(--border);border-radius:10px;cursor:pointer;font-size:0.84rem;color:var(--text-secondary);transition:border-color .2s;text-align:center"
                               onmouseover="this.style.borderColor='#E05080'" onmouseout="this.style.borderColor='var(--border)'">
                          <span class="material-symbols-outlined" style="font-size:28px;color:#E05080">add_a_photo</span>
                          Adicionar Foto / Vídeo
                          <input type="file" id="ficha-lip-media" accept="image/*,video/*" multiple style="display:none" onchange="FichaTecnica._previewLipMedia(this)" />
                        </label>
                        <div id="ficha-lip-media-preview" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start"></div>
                      </div>
                      <div id="ficha-lip-media-links" style="margin-top:8px;font-size:0.8rem;color:var(--text-muted)"></div>
                      <p style="font-size:0.75rem;color:var(--text-muted);margin:6px 0 0">💡 Dica: registre o estado ANTES para evitar contestações de clientes após o procedimento.</p>
                    </div>
                  </div>
                </div>

                <!-- Laudo Facial (só facial) -->
                <div id="ficha-sec-facial" class="form-group form-group-full ficha-section" style="display:none">
                  <div class="ficha-section-title" style="background:linear-gradient(135deg,rgba(46,158,110,0.12),transparent);border-left:3px solid #2E9E6E;padding-left:10px">
                    <span class="material-symbols-outlined">dermatology</span> Laudo Facial — Estado Inicial
                    <span style="font-size:0.72rem;font-weight:400;opacity:0.7;margin-left:6px">Registro do estado da pele antes do procedimento</span>
                  </div>
                  <div class="form-grid" style="margin-top:12px">
                    <div class="form-group">
                      <label class="form-label">Tipo de Pele</label>
                      <select class="form-control" id="ficha-face-skin">
                        <option value="">-- Selecione --</option>
                        <option>Normal</option>
                        <option>Oleosa</option>
                        <option>Seca</option>
                        <option>Mista</option>
                        <option>Sensível</option>
                        <option>Acneica</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Nível de Hidratação</label>
                      <select class="form-control" id="ficha-face-hydration">
                        <option value="">-- Selecione --</option>
                        <option>Bem hidratada</option>
                        <option>Levemente desidratada</option>
                        <option>Desidratada</option>
                        <option>Muito desidratada / descamando</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Textura da Pele</label>
                      <select class="form-control" id="ficha-face-texture">
                        <option value="">-- Selecione --</option>
                        <option>Lisa e uniforme</option>
                        <option>Poros dilatados</option>
                        <option>Textura irregular / áspera</option>
                        <option>Cicatrizes de acne</option>
                        <option>Rugas finas (linhas de expressão)</option>
                        <option>Rugas profundas / sulcos</option>
                        <option>Flacidez leve</option>
                        <option>Flacidez moderada a acentuada</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Pigmentação / Manchas</label>
                      <select class="form-control" id="ficha-face-pigmentation">
                        <option value="">-- Selecione --</option>
                        <option>Sem manchas visíveis</option>
                        <option>Manchas solares (lentigo)</option>
                        <option>Melasma</option>
                        <option>Hipercromia pós-inflamatória</option>
                        <option>Olheiras pigmentares</option>
                        <option>Vitiligo</option>
                        <option>Rosácea</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Sensibilidade / Alergias</label>
                      <select class="form-control" id="ficha-face-sensitivity">
                        <option value="">-- Selecione --</option>
                        <option>Sem sensibilidade conhecida</option>
                        <option>Sensível a ácidos</option>
                        <option>Alergia a anestésicos tópicos</option>
                        <option>Alergia a cosméticos/perfumes</option>
                        <option>Tendência a quelóide</option>
                        <option>Pele reativa (vermelhidão fácil)</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Fitzpatrick (Fototipo)</label>
                      <select class="form-control" id="ficha-face-fitzpatrick">
                        <option value="">-- Selecione --</option>
                        <option>I — Muito clara (queima fácil, nunca bronzeia)</option>
                        <option>II — Clara (queima fácil, bronzeia pouco)</option>
                        <option>III — Morena clara (queima moderado, bronzeia gradualmente)</option>
                        <option>IV — Morena (raramente queima, bronzeia facilmente)</option>
                        <option>V — Morena escura (muito raramente queima)</option>
                        <option>VI — Negra (não queima)</option>
                      </select>
                    </div>
                    <div class="form-group form-group-full">
                      <label class="form-label">Observações sobre a pele</label>
                      <textarea class="form-control" id="ficha-face-obs" rows="2" placeholder="Ex: uso de retinóides, tratamento dermatológico em andamento, áreas com foliculite, acne ativa, uso de protetor solar, histórico de procedimentos..."></textarea>
                    </div>
                    <!-- Mídia do estado inicial -->
                    <div class="form-group form-group-full">
                      <label class="form-label">📸 Mídia — Registro do Estado Inicial
                        <span style="font-size:0.72rem;font-weight:400;color:var(--text-muted)"> (foto ou vídeo antes do procedimento)</span>
                      </label>
                      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
                        <label style="flex:1;min-width:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:18px;border:2px dashed var(--border);border-radius:10px;cursor:pointer;font-size:0.84rem;color:var(--text-secondary);transition:border-color .2s;text-align:center"
                               onmouseover="this.style.borderColor='#2E9E6E'" onmouseout="this.style.borderColor='var(--border)'">
                          <span class="material-symbols-outlined" style="font-size:28px;color:#2E9E6E">add_a_photo</span>
                          Adicionar Foto / Vídeo
                          <input type="file" id="ficha-face-media" accept="image/*,video/*" multiple style="display:none" onchange="FichaTecnica._previewFacialMedia(this)" />
                        </label>
                        <div id="ficha-face-media-preview" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start"></div>
                      </div>
                      <div id="ficha-face-media-links" style="margin-top:8px;font-size:0.8rem;color:var(--text-muted)"></div>
                      <p style="font-size:0.75rem;color:var(--text-muted);margin:6px 0 0">💡 Dica: registre o estado ANTES para evitar contestações de clientes após o procedimento.</p>
                    </div>
                  </div>
                </div>

                <!-- Laudo de Manicure (só manicure) -->
                <div id="ficha-sec-manicure" class="form-group form-group-full ficha-section" style="display:none">
                  <div class="ficha-section-title" style="background:linear-gradient(135deg,rgba(236,72,153,0.12),transparent);border-left:3px solid #ec4899;padding-left:10px">
                    <span class="material-symbols-outlined">brush</span> Laudo de Manicure &amp; Unhas
                    <span style="font-size:0.72rem;font-weight:400;opacity:0.7;margin-left:6px">Registro do estado das unhas e técnicas utilizadas</span>
                  </div>
                  <div class="form-grid" style="margin-top:12px">
                    <div class="form-group">
                      <label class="form-label">Estado das Unhas Naturais</label>
                      <select class="form-control" id="ficha-nail-condition">
                        <option value="">-- Selecione --</option>
                        <option>Saudáveis</option>
                        <option>Fracas / Quebradiças / Descamação</option>
                        <option>Roídas (Onicofagia)</option>
                        <option>Com estrias / Irregularidades</option>
                        <option>Manchadas / Descoloridas</option>
                        <option>Indícios de micoses / fungos (Onicomicose)</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Formato das Unhas</label>
                      <select class="form-control" id="ficha-nail-shape">
                        <option value="">-- Selecione --</option>
                        <option>Quadrada</option>
                        <option>Quadrada com cantos arredondados (Squoval)</option>
                        <option>Almond (Amendoada)</option>
                        <option>Bailarina</option>
                        <option>Stiletto</option>
                        <option>Oval</option>
                        <option>Redonda</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Cuticulagem</label>
                      <select class="form-control" id="ficha-nail-cuticle">
                        <option value="">-- Selecione --</option>
                        <option>Normal (Alicate)</option>
                        <option>Russa / Hardware (Brocas)</option>
                        <option>Combinada (Alicate + Tesoura + Brocas)</option>
                        <option>Sensível (Gengivite/Fina)</option>
                        <option>Apenas empurrada</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Tipo de Extensão / Técnica</label>
                      <select class="form-control" id="ficha-nail-type">
                        <option value="">-- Selecione --</option>
                        <option>Sem extensão (Unhas naturais)</option>
                        <option>Alongamento Fibra de Vidro</option>
                        <option>Alongamento Gel moldado</option>
                        <option>Alongamento Gel na Tip</option>
                        <option>Alongamento Acrilfix / Nova York</option>
                        <option>Alongamento Molde F1 (Dual System)</option>
                        <option>Blindagem (Capa Base)</option>
                        <option>Banho de Gel</option>
                      </select>
                    </div>
                    <div class="form-group form-group-full">
                      <label class="form-label">Observações e Detalhes da Técnica</label>
                      <textarea class="form-control" id="ficha-nail-obs" rows="2" placeholder="Ex: alongamento com gel da marca X, decoração encapsulada, francesinha reversa..."></textarea>
                    </div>
                    <!-- Mídia da unha -->
                    <div class="form-group form-group-full">
                      <label class="form-label">📸 Mídia — Registro Inicial das Unhas
                        <span style="font-size:0.72rem;font-weight:400;color:var(--text-muted)"> (foto antes do procedimento)</span>
                      </label>
                      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
                        <label style="flex:1;min-width:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:18px;border:2px dashed var(--border);border-radius:10px;cursor:pointer;font-size:0.84rem;color:var(--text-secondary);transition:border-color .2s;text-align:center"
                               onmouseover="this.style.borderColor='#ec4899'" onmouseout="this.style.borderColor='var(--border)'">
                          <span class="material-symbols-outlined" style="font-size:28px;color:#ec4899">add_a_photo</span>
                          Adicionar Foto / Vídeo
                          <input type="file" id="ficha-nail-media" accept="image/*,video/*" multiple style="display:none" onchange="FichaTecnica._previewNailMedia(this)" />
                        </label>
                        <div id="ficha-nail-media-preview" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start"></div>
                      </div>
                      <div id="ficha-nail-media-links" style="margin-top:8px;font-size:0.8rem;color:var(--text-muted)"></div>
                      <p style="font-size:0.75rem;color:var(--text-muted);margin:6px 0 0">💡 Dica: registre o estado ANTES para evitar contestações de clientes após o procedimento.</p>
                    </div>
                  </div>
                </div>

                <!-- ══ OUTROS PROTOCOLOS ══ -->
                <div class="form-group form-group-full ficha-section">
                  <div class="ficha-section-title" style="background:linear-gradient(135deg,rgba(123,97,255,0.1),transparent);border-left:3px solid #7B61FF;padding-left:10px">
                    <span class="material-symbols-outlined">add_box</span> Outros Protocolos
                    <span style="font-size:0.72rem;font-weight:400;opacity:0.7;margin-left:6px">Registre os protocolos utilizados neste atendimento</span>
                  </div>
                  <div id="outros-protocolos-list" style="margin-top:14px;display:flex;flex-direction:column;gap:10px">
                    <!-- itens adicionados dinamicamente -->
                  </div>
                  <button type="button" onclick="FichaTecnica._addProtocolo()" style="margin-top:12px;display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border:1.5px dashed #7B61FF;border-radius:10px;background:rgba(123,97,255,0.06);color:#7B61FF;font-size:0.85rem;font-weight:600;cursor:pointer;transition:all .18s" onmouseover="this.style.background='rgba(123,97,255,0.14)'" onmouseout="this.style.background='rgba(123,97,255,0.06)'">
                    <span class="material-symbols-outlined" style="font-size:18px">add</span> Adicionar Protocolo
                  </button>
                </div>

                <!-- Produtos utilizados -->
                <div class="form-group form-group-full ficha-section">
                  <div class="ficha-section-title">
                    <span class="material-symbols-outlined">science</span> Produtos Utilizados
                    <span style="font-size:0.72rem;font-weight:400;opacity:0.7;margin-left:6px">Descreva livremente os produtos usados neste atendimento</span>
                  </div>
                  <div style="margin-top:12px">
                    <textarea class="form-control" id="ficha-products" rows="3" placeholder="Ex: Cola X marca Y, Primer Z, Removedor W, Acelerador, Selador...&#10;Liste todos os produtos utilizados nesta sessão."></textarea>
                  </div>
                </div>

                <!-- Informações do atendimento -->
                <div class="form-group">
                  <label class="form-label">Duração do Procedimento</label>
                  <input class="form-control" id="ficha-duration" placeholder="Ex: 1h30" />
                </div>
                <div class="form-group">
                  <label class="form-label">Valor Cobrado (R$)</label>
                  <input class="form-control" type="number" id="ficha-value" min="0" step="0.01" placeholder="0,00" />
                </div>
                <div class="form-group form-group-full">
                  <label class="form-label">Intercorrências / Sensibilidade / Reações</label>
                  <textarea class="form-control" id="ficha-reactions" rows="2" placeholder="Registre reações, sensibilidade, alergias ou observações importantes..."></textarea>
                </div>
                <div class="form-group form-group-full">
                  <label class="form-label">Resultado / Observações Gerais</label>
                  <textarea class="form-control" id="ficha-notes" rows="3" placeholder="Avaliação do procedimento, combinados, cuidados pós..."></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-ghost" onclick="FichaTecnica.closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                  <span class="material-symbols-outlined">save</span> Salvar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>`;

        FichaTecnica._renderFichasLoadMoreBtn();
    },

    async loadMoreFichas() {
        if (!FichaTecnica._hasMore) return;
        const btn = document.getElementById('fichas-load-more');
        if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:16px;height:16px"></div> Carregando...'; }
        try {
            const result = await Store.getFichasTecnicasPaginated(FichaTecnica._pageSize, FichaTecnica._lastDoc);
            FichaTecnica._currentFichas = [...FichaTecnica._currentFichas, ...result.fichas];
            FichaTecnica._lastDoc = result.lastVisible;
            FichaTecnica._hasMore = result.hasMore;
            // Re-renderizar grid
            const grid = document.getElementById('fichas-grid');
            if (grid) {
                grid.innerHTML = FichaTecnica._currentFichas.map(f => FichaTecnica.cardHtml(f)).join('');
            }
            FichaTecnica._renderFichasLoadMoreBtn();
        } catch (err) {
            App.showToast('Erro ao carregar mais fichas: ' + err.message, 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px">expand_more</span> Carregar mais'; }
        }
    },

    _renderFichasLoadMoreBtn() {
        const container = document.getElementById('fichas-pagination');
        if (!container) return;
        const total = FichaTecnica._currentFichas.length;
        if (FichaTecnica._hasMore) {
            container.innerHTML = `
              <span style="font-size:0.82rem;color:var(--text-muted)">${total} fichas carregadas</span>
              <button id="fichas-load-more" class="btn btn-primary btn-sm" onclick="FichaTecnica.loadMoreFichas()" style="gap:6px">
                <span class="material-symbols-outlined" style="font-size:16px">expand_more</span> Carregar mais ${FichaTecnica._pageSize}
              </button>`;
        } else if (total > 0) {
            container.innerHTML = `<span style="font-size:0.82rem;color:var(--text-muted)">✅ ${total} ficha${total !== 1 ? 's' : ''} carregada${total !== 1 ? 's' : ''}</span>`;
        } else {
            container.innerHTML = '';
        }
    },

    cardHtml(f) {
        const clientName = FichaTecnica.currentClients.find(c => c.id === f.clientId)?.name || 'Cliente';
        const retouch = f.nextRetouchDate ? ` | Retoque: ${new Date(f.nextRetouchDate).toLocaleDateString('pt-BR')}` : '';
        return `
        <div class="ficha-card">
          <div class="ficha-card-header">
            <div>
              <div class="ficha-card-name">${clientName}</div>
              <div class="ficha-card-sub">${f.date}${retouch}</div>
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-ghost btn-sm" onclick="FichaTecnica.openModal('${f.id}', '${f.fichaKind||'cilios'}')" title="Editar">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button class="btn btn-ghost btn-sm" onclick="FichaTecnica.delete('${f.id}')" style="color:var(--danger)" title="Excluir">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
          <div class="ficha-type-badge">${f.type || '-'}</div>
          ${(f.fichaKind === 'facial') ? `
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
            <span style="font-size:0.72rem;font-weight:600;padding:2px 8px;background:rgba(46,158,110,0.12);color:#2E9E6E;border-radius:20px">🧴 Facial</span>
            ${f.faceSkin ? `<span style="font-size:0.72rem;padding:2px 8px;background:var(--surface);border-radius:20px;color:var(--text-secondary)">${f.faceSkin}</span>` : ''}
            ${f.faceTexture ? `<span style="font-size:0.72rem;padding:2px 8px;background:var(--surface);border-radius:20px;color:var(--text-secondary)">${f.faceTexture}</span>` : ''}
            ${f.faceMediaUrls && f.faceMediaUrls.length ? `<span style="font-size:0.72rem;padding:2px 8px;background:#e3f2fd;color:#1565c0;border-radius:20px">📸 ${f.faceMediaUrls.length} mídia(s)</span>` : ''}
          </div>` : (f.fichaKind === 'labios') ? `
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
            <span style="font-size:0.72rem;font-weight:600;padding:2px 8px;background:rgba(224,80,128,0.12);color:#E05080;border-radius:20px">💋 Lips Designer</span>
            ${f.lipColor ? `<span style="font-size:0.72rem;padding:2px 8px;background:var(--surface);border-radius:20px;color:var(--text-secondary)">${f.lipColor}</span>` : ''}
            ${f.lipShape ? `<span style="font-size:0.72rem;padding:2px 8px;background:var(--surface);border-radius:20px;color:var(--text-secondary)">${f.lipShape}</span>` : ''}
            ${f.lipMediaUrls && f.lipMediaUrls.length ? `<span style="font-size:0.72rem;padding:2px 8px;background:#e3f2fd;color:#1565c0;border-radius:20px">📸 ${f.lipMediaUrls.length} mídia(s)</span>` : ''}
          </div>` : (f.fichaKind === 'sobrancelhas') ? `
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
            <span style="font-size:0.72rem;font-weight:600;padding:2px 8px;background:#7B61FF18;color:#7B61FF;border-radius:20px">👀 Laudo Sobrancelhas</span>
            ${f.browDensity ? `<span style="font-size:0.72rem;padding:2px 8px;background:var(--surface);border-radius:20px;color:var(--text-secondary)">${f.browDensity}</span>` : ''}
            ${f.browShape  ? `<span style="font-size:0.72rem;padding:2px 8px;background:var(--surface);border-radius:20px;color:var(--text-secondary)">${f.browShape}</span>` : ''}
            ${f.browMediaUrls && f.browMediaUrls.length ? `<span style="font-size:0.72rem;padding:2px 8px;background:#e3f2fd;color:#1565c0;border-radius:20px">📸 ${f.browMediaUrls.length} mídia(s)</span>` : ''}
          </div>` : (f.fichaKind === 'lashlifting') ? `
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
            <span style="font-size:0.72rem;font-weight:600;padding:2px 8px;background:rgba(232,168,56,0.12);color:#E8A838;border-radius:20px">🌟 Lash Lifting</span>
            ${f.complex3d && f.complex3d.length ? `<span style="font-size:0.72rem;padding:2px 8px;background:rgba(232,168,56,0.08);color:#E8A838;border-radius:20px">Lami ${f.complex3d.length}/6</span>` : ''}
            ${f.natMediaUrls && f.natMediaUrls.length ? `<span style="font-size:0.72rem;padding:2px 8px;background:#e3f2fd;color:#1565c0;border-radius:20px">📸 ${f.natMediaUrls.length} mídia(s)</span>` : ''}
          </div>` : (f.fichaKind === 'manicure') ? `
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
            <span style="font-size:0.72rem;font-weight:600;padding:2px 8px;background:rgba(236,72,153,0.12);color:#ec4899;border-radius:20px">💅 Manicure</span>
            ${f.nailCondition ? `<span style="font-size:0.72rem;padding:2px 8px;background:var(--surface);border-radius:20px;color:var(--text-secondary)">${f.nailCondition}</span>` : ''}
            ${f.nailShape ? `<span style="font-size:0.72rem;padding:2px 8px;background:var(--surface);border-radius:20px;color:var(--text-secondary)">${f.nailShape}</span>` : ''}
            ${f.nailType ? `<span style="font-size:0.72rem;padding:2px 8px;background:var(--surface);border-radius:20px;color:var(--text-secondary)">${f.nailType}</span>` : ''}
            ${f.nailMediaUrls && f.nailMediaUrls.length ? `<span style="font-size:0.72rem;padding:2px 8px;background:#e3f2fd;color:#1565c0;border-radius:20px">📸 ${f.nailMediaUrls.length} mídia(s)</span>` : ''}
          </div>` : (f.natDesc || f.natSize) ? `
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
            <span style="font-size:0.72rem;font-weight:600;padding:2px 8px;background:var(--primary-xlight);color:var(--primary);border-radius:20px">🔬 Laudo Cílios</span>
            ${f.natDesc ? `<span style="font-size:0.72rem;padding:2px 8px;background:var(--surface);border-radius:20px;color:var(--text-secondary)">${f.natDesc}</span>` : ''}
            ${f.natSize ? `<span style="font-size:0.72rem;padding:2px 8px;background:var(--surface);border-radius:20px;color:var(--text-secondary)">${f.natSize}</span>` : ''}
            ${f.natMediaUrls && f.natMediaUrls.length ? `<span style="font-size:0.72rem;padding:2px 8px;background:#e3f2fd;color:#1565c0;border-radius:20px">📸 ${f.natMediaUrls.length} mídia(s)</span>` : ''}
          </div>` : ''}
          <div class="ficha-meta">
            ${f.mapeamento ? `<span>Mapeamento: <strong>${f.mapeamento.substring(0,40)}${f.mapeamento.length>40?'...':''}</strong></span>` : ''}
            ${f.duration ? `<span>Duração: <strong>${f.duration}</strong></span>` : ''}
            ${f.value ? `<span>Valor: <strong>${App.formatCurrency(Number(f.value))}</strong></span>` : ''}
          </div>
          ${f.notes ? `<div class="ficha-notes">${f.notes}</div>` : ''}
          ${(() => {
            const urls = f.nailMediaUrls || f.faceMediaUrls || f.lipMediaUrls || f.browMediaUrls || f.natMediaUrls || [];
            if (!urls.length) return '';
            return `
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
              ${urls.map(u=>`<a href="${u}" target="_blank" style="display:block;border-radius:6px;overflow:hidden;border:1px solid var(--border)">
                ${u.match(/\.(mp4|mov|webm)/i) ? `<video src="${u}" style="width:70px;height:70px;object-fit:cover"></video>` : `<img src="${u}" style="width:70px;height:70px;object-fit:cover" />`}
              </a>`).join('')}
            </div>`;
          })()}
        </div>`;
    },

    async openModal(id = null, tipo = 'cilios') {
        FichaTecnica.editingId = id;
        FichaTecnica.currentType = tipo;
        const form = document.getElementById('ficha-form');
        form.reset();
        document.getElementById('ficha-date').value = new Date().toISOString().split('T')[0];

        // Atualizar título e mostrar/ocultar seções
        const titleEl = document.getElementById('ficha-modal-title');
        const titles = {cilios:'✨ Ficha Técnica — Cílios', lashlifting:'🌟 Ficha Técnica — Lash Lifting', sobrancelhas:'🎮 Ficha Técnica — Sobrancelhas', labios:'💋 Ficha Técnica — Lábios (Lips Designer)', facial:'🧴 Ficha Técnica — Facial', manicure:'💅 Ficha Técnica — Manicure & Nail Designer'};
        if (titleEl) titleEl.textContent = titles[tipo] || titles.cilios;
        FichaTecnica._applySectionVisibility(tipo);

        if (id) {
            const fichas = await Store.getFichasTecnicas();
            const f = fichas.find(x => x.id === id);
            if (f) {
                const fTipo = f.fichaKind || 'cilios';
                FichaTecnica.currentType = fTipo;
                // Re-aplicar visibilidade com tipo real
                const titles2 = {cilios:'✨ Ficha Técnica — Cílios', lashlifting:'🌟 Ficha Técnica — Lash Lifting', sobrancelhas:'🎮 Ficha Técnica — Sobrancelhas', labios:'💋 Ficha Técnica — Lábios (Lips Designer)', facial:'🧴 Ficha Técnica — Facial', manicure:'💅 Ficha Técnica — Manicure & Nail Designer'};
                if (titleEl) titleEl.textContent = titles2[fTipo] || titles2.cilios;
                FichaTecnica._applySectionVisibility(fTipo);

                document.getElementById('ficha-client').value = f.clientId || '';
                document.getElementById('ficha-date').value = f.date || '';
                document.getElementById('ficha-type').value = f.type || '';
                document.getElementById('ficha-retouch').value = f.nextRetouchDate || '';
                // Laudo dos cílios naturais
                document.getElementById('ficha-nat-desc').value = f.natDesc || '';
                document.getElementById('ficha-nat-obs').value = f.natObs || '';
                if (f.natSize) {
                    const radio = document.querySelector(`input[name="ficha-nat-size"][value="${f.natSize}"]`);
                    if (radio) { radio.checked = true; FichaTecnica._highlightNatSize(); }
                }
                const linksDiv = document.getElementById('ficha-nat-media-links');
                if (linksDiv && f.natMediaUrls && f.natMediaUrls.length) {
                    linksDiv.innerHTML = f.natMediaUrls.map((u,i)=>`<a href="${u}" target="_blank" style="margin-right:8px">📎 Mídia ${i+1}</a>`).join('');
                }
                // Laudo de sobrancelhas
                const bd = document.getElementById('ficha-brow-density');
                const bs = document.getElementById('ficha-brow-shape');
                const bdi = document.getElementById('ficha-brow-direction');
                const bc = document.getElementById('ficha-brow-color');
                const bo = document.getElementById('ficha-brow-obs');
                if (bd) bd.value = f.browDensity || '';
                if (bs) bs.value = f.browShape || '';
                if (bdi) bdi.value = f.browDirection || '';
                if (bc) bc.value = f.browColor || '';
                if (bo) bo.value = f.browObs || '';
                const browLinks = document.getElementById('ficha-brow-media-links');
                if (browLinks && f.browMediaUrls && f.browMediaUrls.length) {
                    browLinks.innerHTML = f.browMediaUrls.map((u,i)=>`<a href="${u}" target="_blank" style="margin-right:8px">📎 Mídia ${i+1}</a>`).join('');
                }
                // Laudo labial
                const lipC = document.getElementById('ficha-lip-color');
                const lipS = document.getElementById('ficha-lip-shape');
                const lipT = document.getElementById('ficha-lip-texture');
                const lipSy = document.getElementById('ficha-lip-symmetry');
                const lipO = document.getElementById('ficha-lip-obs');
                if (lipC) lipC.value = f.lipColor || '';
                if (lipS) lipS.value = f.lipShape || '';
                if (lipT) lipT.value = f.lipTexture || '';
                if (lipSy) lipSy.value = f.lipSymmetry || '';
                if (lipO) lipO.value = f.lipObs || '';
                const lipLinks = document.getElementById('ficha-lip-media-links');
                if (lipLinks && f.lipMediaUrls && f.lipMediaUrls.length) {
                    lipLinks.innerHTML = f.lipMediaUrls.map((u,i)=>`<a href="${u}" target="_blank" style="margin-right:8px">📎 Mídia ${i+1}</a>`).join('');
                }
                // Laudo facial
                const fSkin = document.getElementById('ficha-face-skin');
                const fHyd = document.getElementById('ficha-face-hydration');
                const fTex = document.getElementById('ficha-face-texture');
                const fPig = document.getElementById('ficha-face-pigmentation');
                const fSen = document.getElementById('ficha-face-sensitivity');
                const fFitz = document.getElementById('ficha-face-fitzpatrick');
                const fObs = document.getElementById('ficha-face-obs');
                if (fSkin) fSkin.value = f.faceSkin || '';
                if (fHyd) fHyd.value = f.faceHydration || '';
                if (fTex) fTex.value = f.faceTexture || '';
                if (fPig) fPig.value = f.facePigmentation || '';
                if (fSen) fSen.value = f.faceSensitivity || '';
                if (fFitz) fFitz.value = f.faceFitzpatrick || '';
                if (fObs) fObs.value = f.faceObs || '';
                const faceLinks = document.getElementById('ficha-face-media-links');
                if (faceLinks && f.faceMediaUrls && f.faceMediaUrls.length) {
                    faceLinks.innerHTML = f.faceMediaUrls.map((u,i)=>`<a href="${u}" target="_blank" style="margin-right:8px">📎 Mídia ${i+1}</a>`).join('');
                }
                // Laudo de manicure
                const nailCond = document.getElementById('ficha-nail-condition');
                const nailSh = document.getElementById('ficha-nail-shape');
                const nailCut = document.getElementById('ficha-nail-cuticle');
                const nailTy = document.getElementById('ficha-nail-type');
                const nailOb = document.getElementById('ficha-nail-obs');
                if (nailCond) nailCond.value = f.nailCondition || '';
                if (nailSh) nailSh.value = f.nailShape || '';
                if (nailCut) nailCut.value = f.nailCuticle || '';
                if (nailTy) nailTy.value = f.nailType || '';
                if (nailOb) nailOb.value = f.nailObs || '';
                const nailLinks = document.getElementById('ficha-nail-media-links');
                if (nailLinks && f.nailMediaUrls && f.nailMediaUrls.length) {
                    nailLinks.innerHTML = f.nailMediaUrls.map((u,i)=>`<a href="${u}" target="_blank" style="margin-right:8px">📎 Mídia ${i+1}</a>`).join('');
                }
                // Mapeamento livre
                const mapeEl = document.getElementById('ficha-mapeamento');
                if (mapeEl) mapeEl.value = f.mapeamento || '';
                // Tipo "Outro"
                const tipoSel = document.getElementById('ficha-type');
                const outroKeys = ['__outro_cilios__','__outro_lifting__','__outro_sobrancelhas__','__outro_labios__','__outro_facial__','__outro_manicure__'];
                if (f.type && !Array.from(tipoSel.options).some(o => o.value === f.type && !outroKeys.includes(o.value))) {
                    tipoSel.value = fTipo === 'lashlifting' ? '__outro_lifting__' : fTipo === 'sobrancelhas' ? '__outro_sobrancelhas__' : fTipo === 'labios' ? '__outro_labios__' : fTipo === 'facial' ? '__outro_facial__' : fTipo === 'manicure' ? '__outro_manicure__' : '__outro_cilios__';
                    const outroInput = document.getElementById('ficha-type-outro');
                    if (outroInput) { outroInput.style.display = ''; outroInput.value = f.type; }
                }
                // Restaurar Complex 3D checkboxes (Lash Lifting)
                const c3dSaved = f.complex3d || [];
                document.querySelectorAll('input[name="c3d-protocol"]').forEach(cb => {
                    if (c3dSaved.includes(cb.value)) {
                        cb.checked = true;
                        FichaTecnica._toggleProtocol(cb.id, true);
                    }
                });
                document.getElementById('ficha-products').value = f.products || '';
                document.getElementById('ficha-duration').value = f.duration || '';
                document.getElementById('ficha-value').value = f.value || '';
                document.getElementById('ficha-reactions').value = f.reactions || '';
                document.getElementById('ficha-notes').value = f.notes || '';
                // Restaurar outros protocolos
                (f.outrosProtocolos || []).forEach(p => FichaTecnica._addProtocolo(p.nome, p.passos));
            }
        }
        document.getElementById('ficha-modal').classList.remove('hidden');
    },

    closeModal(event) {
        if (event && event.target !== document.getElementById('ficha-modal')) return;
        document.getElementById('ficha-modal')?.classList.add('hidden');
        FichaTecnica.editingId = null;
    },

    async handleSave(e) {
        e.preventDefault();
        // Coletar outros protocolos
        const outrosRows = document.querySelectorAll('#outros-protocolos-list .outro-protocolo-row');
        const outrosProtocolos = Array.from(outrosRows).map(row => ({
            nome:  row.querySelector('.outro-proto-nome')?.value || '',
            passos: row.querySelector('.outro-proto-passos')?.value || ''
        })).filter(p => p.nome.trim());

        // Tipo: se "Outro" selecionado, pega o campo de texto
        let tipoVal = document.getElementById('ficha-type').value;
        if (tipoVal === '__outro_cilios__' || tipoVal === '__outro_lifting__' || tipoVal === '__outro_sobrancelhas__' || tipoVal === '__outro_labios__' || tipoVal === '__outro_facial__' || tipoVal === '__outro_manicure__') {
            tipoVal = document.getElementById('ficha-type-outro')?.value || 'Outro';
        }
        // Coletar checkboxes do Complex 3D (Lash Lifting)
        const c3dChecked = Array.from(document.querySelectorAll('input[name="c3d-protocol"]:checked')).map(cb => cb.value);

        const data = {
            fichaKind:      FichaTecnica.currentType,
            clientId:       document.getElementById('ficha-client').value,
            date:           document.getElementById('ficha-date').value,
            type:           tipoVal,
            nextRetouchDate:document.getElementById('ficha-retouch').value,
            // Laudo dos cílios naturais
            natDesc:        document.getElementById('ficha-nat-desc').value,
            natSize:        document.querySelector('input[name="ficha-nat-size"]:checked')?.value || '',
            natObs:         document.getElementById('ficha-nat-obs').value,
            // Laudo de sobrancelhas
            browDensity:    document.getElementById('ficha-brow-density')?.value || '',
            browShape:      document.getElementById('ficha-brow-shape')?.value || '',
            browDirection:  document.getElementById('ficha-brow-direction')?.value || '',
            browColor:      document.getElementById('ficha-brow-color')?.value || '',
            browObs:        document.getElementById('ficha-brow-obs')?.value || '',
            // Laudo labial
            lipColor:       document.getElementById('ficha-lip-color')?.value || '',
            lipShape:       document.getElementById('ficha-lip-shape')?.value || '',
            lipTexture:     document.getElementById('ficha-lip-texture')?.value || '',
            lipSymmetry:    document.getElementById('ficha-lip-symmetry')?.value || '',
            lipObs:         document.getElementById('ficha-lip-obs')?.value || '',
            // Laudo facial
            faceSkin:        document.getElementById('ficha-face-skin')?.value || '',
            faceHydration:   document.getElementById('ficha-face-hydration')?.value || '',
            faceTexture:     document.getElementById('ficha-face-texture')?.value || '',
            facePigmentation:document.getElementById('ficha-face-pigmentation')?.value || '',
            faceSensitivity: document.getElementById('ficha-face-sensitivity')?.value || '',
            faceFitzpatrick: document.getElementById('ficha-face-fitzpatrick')?.value || '',
            faceObs:         document.getElementById('ficha-face-obs')?.value || '',
            // Laudo de manicure
            nailCondition:   document.getElementById('ficha-nail-condition')?.value || '',
            nailShape:       document.getElementById('ficha-nail-shape')?.value || '',
            nailCuticle:     document.getElementById('ficha-nail-cuticle')?.value || '',
            nailType:        document.getElementById('ficha-nail-type')?.value || '',
            nailObs:         document.getElementById('ficha-nail-obs')?.value || '',
            // Mapeamento livre
            mapeamento:     document.getElementById('ficha-mapeamento')?.value || '',
            // Protocolos
            complex3d:      c3dChecked,
            outrosProtocolos: outrosProtocolos,
            products:       document.getElementById('ficha-products').value,
            duration:       document.getElementById('ficha-duration').value,
            value:          parseFloat(document.getElementById('ficha-value').value) || 0,
            reactions:      document.getElementById('ficha-reactions').value,
            notes:          document.getElementById('ficha-notes').value
        };
        // Upload de mídias — Cílios
        const mediaInput = document.getElementById('ficha-nat-media');
        if (mediaInput && mediaInput.files.length > 0) {
            try {
                const urls = await FichaTecnica._uploadMediaFiles(mediaInput.files);
                data.natMediaUrls = urls;
            } catch(e) { console.warn('Mídia cílios não enviada:', e); }
        }
        // Upload de mídias — Sobrancelhas
        const browMediaInput = document.getElementById('ficha-brow-media');
        if (browMediaInput && browMediaInput.files.length > 0) {
            try {
                const urls = await FichaTecnica._uploadMediaFiles(browMediaInput.files);
                data.browMediaUrls = urls;
            } catch(e) { console.warn('Mídia sobrancelhas não enviada:', e); }
        }
        // Upload de mídias — Lábios
        const lipMediaInput = document.getElementById('ficha-lip-media');
        if (lipMediaInput && lipMediaInput.files.length > 0) {
            try {
                const urls = await FichaTecnica._uploadMediaFiles(lipMediaInput.files);
                data.lipMediaUrls = urls;
            } catch(e) { console.warn('Mídia labial não enviada:', e); }
        }
        // Upload de mídias — Facial
        const faceMediaInput = document.getElementById('ficha-face-media');
        if (faceMediaInput && faceMediaInput.files.length > 0) {
            try {
                const urls = await FichaTecnica._uploadMediaFiles(faceMediaInput.files);
                data.faceMediaUrls = urls;
            } catch(e) { console.warn('Mídia facial não enviada:', e); }
        }
        // Upload de mídias — Manicure
        const nailMediaInput = document.getElementById('ficha-nail-media');
        if (nailMediaInput && nailMediaInput.files.length > 0) {
            try {
                const urls = await FichaTecnica._uploadMediaFiles(nailMediaInput.files);
                data.nailMediaUrls = urls;
            } catch(e) { console.warn('Mídia manicure não enviada:', e); }
        }
        try {
            if (FichaTecnica.editingId) await Store.updateFichaTecnica(FichaTecnica.editingId, data);
            else await Store.addFichaTecnica(data);
            document.getElementById('ficha-modal').classList.add('hidden');
            App.showToast('Ficha salva!', 'success');
            await FichaTecnica.render(document.getElementById('page-content'));
        } catch (err) {
            App.showToast('Erro: ' + err.message, 'error');
        }
    },

    _highlightNatSize() {
        ['Curtos','Médios','Longos'].forEach(t => {
            const lbl = document.getElementById('nat-size-lbl-'+t);
            const inp = document.querySelector(`input[name="ficha-nat-size"][value="${t}"]`);
            if (lbl) lbl.style.borderColor = inp?.checked ? 'var(--primary)' : 'var(--border)';
            if (lbl) lbl.style.background  = inp?.checked ? 'var(--primary-xlight)' : '';
        });
    },

    _toggleOutroTipo() {
        const sel = document.getElementById('ficha-type');
        const inp = document.getElementById('ficha-type-outro');
        if (inp) inp.style.display = (sel?.value === '__outro_cilios__' || sel?.value === '__outro_lifting__' || sel?.value === '__outro_sobrancelhas__' || sel?.value === '__outro_labios__' || sel?.value === '__outro_facial__' || sel?.value === '__outro_manicure__') ? '' : 'none';
    },

    _applySectionVisibility(tipo) {
        const secCilios     = document.getElementById('ficha-sec-cilios');
        const secMapeamento = document.getElementById('ficha-sec-mapeamento');
        const secLami       = document.getElementById('ficha-sec-lami');
        const secBrow       = document.getElementById('ficha-sec-sobrancelhas');
        const secLip        = document.getElementById('ficha-sec-labios');
        const secFace       = document.getElementById('ficha-sec-facial');
        const secNail       = document.getElementById('ficha-sec-manicure');
        const isCil  = tipo === 'cilios';
        const isLift = tipo === 'lashlifting';
        const isBrow = tipo === 'sobrancelhas';
        const isLip  = tipo === 'labios';
        const isFace = tipo === 'facial';
        const isNail = tipo === 'manicure';
        if (secCilios)     secCilios.style.display     = (isCil || isLift) ? '' : 'none';
        if (secMapeamento) secMapeamento.style.display  = (isCil || isLift || isBrow || isLip || isFace || isNail) ? '' : 'none';
        if (secLami)       secLami.style.display        = (isLift || isBrow) ? '' : 'none';
        if (secBrow)       secBrow.style.display        = isBrow ? '' : 'none';
        if (secLip)        secLip.style.display         = isLip ? '' : 'none';
        if (secFace)       secFace.style.display        = isFace ? '' : 'none';
        if (secNail)       secNail.style.display        = isNail ? '' : 'none';
        // Filtrar optgroups de procedimentos — exibir apenas os do tipo selecionado
        const sel = document.getElementById('ficha-type');
        if (sel) {
            sel.querySelectorAll('optgroup[data-kind]').forEach(og => {
                og.style.display = (og.dataset.kind === tipo) ? '' : 'none';
                og.disabled = (og.dataset.kind !== tipo);
            });
            // Reset seleção se o valor atual pertence a outro kind
            const currentOpt = sel.selectedOptions[0];
            if (currentOpt && currentOpt.closest('optgroup[data-kind]')) {
                const parentKind = currentOpt.closest('optgroup[data-kind]').dataset.kind;
                if (parentKind !== tipo) sel.value = '';
            }
        }
    },

    _toggleProtocol(cbId, forceOn = false) {
        const cb  = document.getElementById(cbId);
        if (!cb) return;
        if (!forceOn) cb.checked = !cb.checked;
        const lbl  = document.getElementById('lbl-' + cbId);
        const icon = document.getElementById('icon-' + cbId);
        const chk  = document.getElementById('chk-' + cbId);
        if (cb.checked) {
            if (lbl)  { lbl.style.borderColor = '#E8A838'; lbl.style.background = 'rgba(232,168,56,0.08)'; }
            if (icon) icon.style.color = '#E8A838';
            if (chk)  { chk.style.color = '#E8A838'; chk.textContent = 'check_circle'; }
        } else {
            if (lbl)  { lbl.style.borderColor = 'var(--border)'; lbl.style.background = 'var(--surface)'; }
            if (icon) icon.style.color = 'var(--text-muted)';
            if (chk)  { chk.style.color = 'var(--text-muted)'; chk.textContent = 'check_circle'; }
        }
    },

    _addProtocolo(nome = '', passos = '') {
        const list = document.getElementById('outros-protocolos-list');
        if (!list) return;
        const idx = list.children.length;
        const div = document.createElement('div');
        div.className = 'outro-protocolo-row';
        div.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:14px;border:1.5px solid var(--border);border-radius:12px;background:var(--surface);position:relative';
        div.innerHTML = `
          <button type="button" onclick="this.closest('.outro-protocolo-row').remove()" style="position:absolute;top:8px;right:8px;background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:18px;line-height:1;padding:0" title="Remover">
            <span class="material-symbols-outlined" style="font-size:18px">close</span>
          </button>
          <div style="display:grid;grid-template-columns:1fr 2fr;gap:10px">
            <div>
              <label class="form-label" style="margin-bottom:4px">Nome do Protocolo</label>
              <input class="form-control outro-proto-nome" placeholder="Ex: Lash Lifting, Keratin..." value="${nome}" />
            </div>
            <div>
              <label class="form-label" style="margin-bottom:4px">Produtos / Passos Utilizados</label>
              <input class="form-control outro-proto-passos" placeholder="Ex: Solução A, Solução B, Silicone M..." value="${passos}" />
            </div>
          </div>`;
        list.appendChild(div);
    },

    _previewMedia(input) {
        const preview = document.getElementById('ficha-nat-media-preview');
        if (!preview) return;
        preview.innerHTML = '';
        Array.from(input.files).forEach(file => {
            const url = URL.createObjectURL(file);
            const isVideo = file.type.startsWith('video');
            const el = isVideo
                ? `<video src="${url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" muted></video>`
                : `<img src="${url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" />`;
            preview.insertAdjacentHTML('beforeend', el);
        });
    },

    _previewBrowMedia(input) {
        const preview = document.getElementById('ficha-brow-media-preview');
        if (!preview) return;
        preview.innerHTML = '';
        Array.from(input.files).forEach(file => {
            const url = URL.createObjectURL(file);
            const isVideo = file.type.startsWith('video');
            const el = isVideo
                ? `<video src="${url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" muted></video>`
                : `<img src="${url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" />`;
            preview.insertAdjacentHTML('beforeend', el);
        });
    },

    _previewLipMedia(input) {
        const preview = document.getElementById('ficha-lip-media-preview');
        if (!preview) return;
        preview.innerHTML = '';
        Array.from(input.files).forEach(file => {
            const url = URL.createObjectURL(file);
            const isVideo = file.type.startsWith('video');
            const el = isVideo
                ? `<video src="${url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" muted></video>`
                : `<img src="${url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" />`;
            preview.insertAdjacentHTML('beforeend', el);
        });
    },

    _previewFacialMedia(input) {
        const preview = document.getElementById('ficha-face-media-preview');
        if (!preview) return;
        preview.innerHTML = '';
        Array.from(input.files).forEach(file => {
            const url = URL.createObjectURL(file);
            const isVideo = file.type.startsWith('video');
            const el = isVideo
                ? `<video src="${url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" muted></video>`
                : `<img src="${url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" />`;
            preview.insertAdjacentHTML('beforeend', el);
        });
    },

    _previewNailMedia(input) {
        const preview = document.getElementById('ficha-nail-media-preview');
        if (!preview) return;
        preview.innerHTML = '';
        Array.from(input.files).forEach(file => {
            const url = URL.createObjectURL(file);
            const isVideo = file.type.startsWith('video');
            const el = isVideo
                ? `<video src="${url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" muted></video>`
                : `<img src="${url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" />`;
            preview.insertAdjacentHTML('beforeend', el);
        });
    },

    async _uploadMediaFiles(files) {
        // Converte para base64 comprimido e salva como array de data URLs
        // Para produção com Firebase Storage, substituir por upload real
        const results = [];
        for (const file of Array.from(files)) {
            const b64 = await new Promise((res, rej) => {
                const reader = new FileReader();
                reader.onload = e => res(e.target.result);
                reader.onerror = rej;
                reader.readAsDataURL(file);
            });
            results.push(b64);
        }
        return results;
    },

    async delete(id) {
        if (!confirm('Excluir esta ficha técnica?')) return;
        await Store.deleteFichaTecnica(id);
        App.showToast('Ficha excluída.', 'success');
        await FichaTecnica.render(document.getElementById('page-content'));
    }
};
