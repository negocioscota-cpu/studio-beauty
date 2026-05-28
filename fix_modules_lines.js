const fs = require('fs');

let content = fs.readFileSync('pages/modules.js', 'utf8');
let lines = content.split('\n');

// Mapeamento linha → conteúdo correto (0-indexed, então linha N = index N-1)
const lineReplacements = {
    41:  '            <button class="modal-close" onclick="Inventory.closeModal()">✕</button>\r',
    112: '              <td><strong>${item.name}</strong>${item.brand ? ` <span style="font-size:0.8rem;color:var(--text-muted)"> · ${item.brand}</span>` : \'\'}</td>\r',
    212: '// === FINANCEIRO AVANÇADO ===\r',
    215: "        pix: { label: 'PIX', icon: '⚡', color: '#00BCAF' },\r",
    216: "        credit: { label: 'Cartão Crédito', icon: '💳', color: '#7B61FF' },\r",
    217: "        debit: { label: 'Cartão Débito', icon: '💳', color: '#5B8DEF' },\r",
    218: "        cash: { label: 'Dinheiro', icon: '💵', color: '#4CAF50' },\r",
    219: "        transfer: { label: 'Transferência', icon: '🏦', color: '#FF9800' },\r",
    220: "        other: { label: 'Outro', icon: '🔄', color: '#9E9E9E' }\r",
    265: '            <div class="card-header"><span class="card-title">💰 Recebimentos por Forma de Pagamento</span></div>\r',
    284: '                <option value="paid">✅ Pagos</option>\r',
    285: '                <option value="pending">⏳ Pendentes</option>\r',
    332: '              <button class="modal-close" onclick="Invoices.closeModal()">✕</button>\r',
    353: '                    <option value="paid">✅ Pago</option>\r',
    354: '                    <option value="pending">⏳ Pendente</option>\r',
    399: "            App.showToast('Lançamento salvo! 💰', 'success');\r",
    409: "        App.showToast('Marcado como pago! ✅', 'success');\r",
    421: '// === HISTÓRICO DE ATENDIMENTOS ===\r',
    457: '              <button class="modal-close" onclick="Interactions.closeModal()">✕</button>\r',
};

for (const [lineNum, replacement] of Object.entries(lineReplacements)) {
    const idx = parseInt(lineNum) - 1;
    console.log(`Line ${lineNum}: replacing with correct version`);
    lines[idx] = replacement;
}

const fixed = lines.join('\n');
fs.writeFileSync('pages/modules.js', fixed, 'utf8');
console.log('\n✅ modules.js corrigido!');

// Verificação final
const verify = fs.readFileSync('pages/modules.js', 'utf8');
const remaining = verify.split('\n').filter((l, i) => 
    l.includes('Ã') || (l.includes('ðŸ')) || 
    (l.includes('âš') || l.includes('â³') || l.includes('âœ'))
);
if (remaining.length === 0) {
    console.log('✅ Sem mojibake restante!');
} else {
    console.log('⚠️ Ainda com problemas:');
    remaining.forEach(l => console.log(' ', l.trim().substring(0, 80)));
}
