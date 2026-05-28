const fs = require('fs');

const files = [
    'pages/modules.js',
    'pages/reports.js',
    'pages/schedule.js',
    'pages/clients.js',
    'pages/dashboard.js',
    'pages/ficha-tecnica.js',
    'pages/catalog.js',
    'pages/consent.js',
    'pages/portfolio.js',
    'pages/reminders.js',
    'pages/birthday.js',
    'pages/inventory.js',
    'pages/team-management.js',
    'pages/settings.js',
    'pages/studio-profile.js',
    'pages/bolsa-beleza.js',
    'js/app.js',
    'js/auth.js',
    'app.html',
];

// Pares de substituição: texto corrompido → texto correto
const fixes = [
    // Emojis corrompidos (UTF-8 multi-byte mal interpretado como Latin-1)
    ['â\x9a¡', '⚡'],
    ['ð\x9f\x92³', '💳'],
    ['ð\x9f\x92µ', '💵'],
    ['ð\x9f\x92°', '💰'],
    ['ð\x9f\x94\x84', '🔄'],
    ['ð\x9f¦', '🏦'],
    ['â\x9c…', '✅'],
    ['â³', '⏳'],
    ['â\x9c•', '✕'],

    // Sequências de acentuação corrompidas mais específicas primeiro
    ['AÃ\x87Ã\x95ES', 'AÇÕES'],
    ['AÃ§Ã\xb5es', 'Ações'],
    ['AÃ§Ãµes', 'Ações'],
    ['ObservaÃ§Ã\xb5es', 'Observações'],
    ['ObservaÃ§Ãµes', 'Observações'],
    ['ExtensÃ\xb5es', 'Extensões'],
    ['ExtensÃµes', 'Extensões'],
    ['CartÃ£o CrÃ©dito', 'Cartão Crédito'],
    ['CartÃ\xa3o CrÃ©dito', 'Cartão Crédito'],
    ['CartÃ£o DÃ©bito', 'Cartão Débito'],
    ['CartÃ\xa3o DÃ©bito', 'Cartão Débito'],
    ['TransferÃªncia', 'Transferência'],
    ['TransferÃ\xaancia', 'Transferência'],
    ['LanÃ§amentos', 'Lançamentos'],
    ['LanÃ\xa7amentos', 'Lançamentos'],
    ['LanÃ§amento', 'Lançamento'],
    ['LanÃ\xa7amento', 'Lançamento'],
    ['lanÃ§amento', 'lançamento'],
    ['lanÃ\xa7amento', 'lançamento'],
    ['DescriÃ§Ã£o', 'Descrição'],
    ['DescriÃ\xa7Ã\xa3o', 'Descrição'],
    ['serviÃ§o', 'serviço'],
    ['serviÃ\xa7o', 'serviço'],
    ['HISTÃ"RICO', 'HISTÓRICO'],
    ['HistÃ³rico', 'Histórico'],
    ['HistÃ\xb3rico', 'Histórico'],
    ['histÃ³rico', 'histórico'],
    ['histÃ\xb3rico', 'histórico'],
    ['RemoÃ§Ã£o', 'Remoção'],
    ['RemoÃ\xa7Ã\xa3o', 'Remoção'],
    ['CÃ\xadlios', 'Cílios'],
    ['CÃ­lios', 'Cílios'],
    ['MÃ\xadnimo', 'Mínimo'],
    ['MÃ­nimo', 'Mínimo'],
    ['MÃ\xadnima', 'Mínima'],
    ['MÃ­nima', 'Mínima'],
    ['DescartÃ¡veis', 'Descartáveis'],
    ['DescartÃ\xa1veis', 'Descartáveis'],
    ['invÃ¡lido', 'inválido'],
    ['invÃ\xa1lido', 'inválido'],
    ['AVANÃ\u201aNADO', 'AVANÇADO'],
    ['AVANÃ\x87ADO', 'AVANÇADO'],
    ['AVANÃ§ADO', 'AVANÇADO'],
    [' Â· ', ' · '],
    // Letras acentuadas simples restantes
    ['Ã¡', 'á'], ['Ã©', 'é'], ['Ã³', 'ó'], ['Ãº', 'ú'],
    ['Ã£', 'ã'], ['Ãµ', 'õ'], ['Ã§', 'ç'], ['Ã\xad', 'í'],
    ['Ã\xa0', 'à'], ['Ã\x80', 'À'], ['Ã\x87', 'Ç'], ['Ã\x89', 'É'],
    ['Ã\x93', 'Ó'], ['Ã\x9a', 'Ú'], ['Ã\x83', 'Ã'], ['Ã\x95', 'Õ'],
    ['Ã\xa1', 'á'], ['Ã\xa9', 'é'], ['Ã\xb3', 'ó'], ['Ã\xba', 'ú'],
    ['Ã\xa3', 'ã'], ['Ã\xb5', 'õ'], ['Ã\xa7', 'ç'],
];

let totalFixed = 0;

for (const file of files) {
    if (!fs.existsSync(file)) {
        console.log(`SKIP: ${file}`);
        continue;
    }
    
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    for (const [old, newVal] of fixes) {
        while (content.includes(old)) {
            content = content.split(old).join(newVal);
        }
    }
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        const count = (original.length - content.length);
        console.log(`FIXED: ${file}`);
        totalFixed++;
    } else {
        console.log(`OK: ${file}`);
    }
}

console.log(`\n✅ Concluído! ${totalFixed} arquivo(s) corrigidos.`);
