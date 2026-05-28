const fs = require('fs');

const file = 'pages/modules.js';
let content = fs.readFileSync(file, 'utf8');

// Função para decodificar mojibake: bytes UTF-8 lidos como Latin-1
// Converte cada char de volta para seu byte e re-lê como UTF-8
function decodeMojibake(str) {
    try {
        const bytes = Buffer.from(str, 'latin1');
        return bytes.toString('utf8');
    } catch(e) {
        return str;
    }
}

// As strings corrompidas precisam ser re-decodificadas
// Vamos substituir char por char usando replace com regex
// Os emojis corrompidos têm padrão: sequência começando com ðŸ (U+00F0 U+009F)
// e outros prefixos de emoji

// Mapeamento direto de substrings corrompidas para corretas
// Detectado via análise do arquivo
const directFixes = {
    // Botão fechar - ✕ (U+2715)
    'â\u009c\u2022': '✕',
    // ⚡ (U+26A1)  
    'â\u009a¡': '⚡',
    // 💳 (U+1F4B3)
    'ð\u009f\u2019³': '💳',
    // 💵 (U+1F4B5)
    'ð\u009f\u2019µ': '💵',
    // 💰 (U+1F4B0)
    'ð\u009f\u2019°': '💰',
    // 🔄 (U+1F504)
    'ð\u009f\u201d\u201e': '🔄',
    // 🏦 (U+1F3E6)
    'ð\u009f¦': '🏦',
    // ✅ (U+2705)
    'â\u009c\u2026': '✅',
    // ⏳ (U+23F3)
    'â³': '⏳',
    // AVANÇADO
    'AVANÃ\u2021ADO': 'AVANÇADO',
    'AVANÃ§ADO': 'AVANÇADO',
    // HISTÓRICO
    'HIST\u00c3\u201dRICO': 'HISTÓRICO',
};

// Abordagem alternativa: re-encode o arquivo
// Lê o arquivo como binário (latin1) e re-escreve como UTF-8
const rawBytes = fs.readFileSync(file); // Buffer
let rawStr = rawBytes.toString('latin1');

// Verificar se o arquivo já está em UTF-8 correto ou tem mojibake
// Mojibake: caracteres UTF-8 multi-byte interpretados como Latin-1
// Por ex: ç (U+00E7) em UTF-8 = 0xC3 0xA7 → em latin1 = ÃJ

// Tentar re-converter: ler bytes como latin1, interpretar como UTF-8
function tryReencode(str) {
    const buf = Buffer.from(str, 'latin1');
    return buf.toString('utf8');
}

// Checar se é mojibake vendo se há sequências típicas
const hasMojibake = rawStr.includes('Ã§') || rawStr.includes('ðŸ') || rawStr.includes('âš');
console.log('Has mojibake pattern:', hasMojibake);
console.log('File size bytes:', rawBytes.length);

// Testar re-encoding de uma amostra
const sample = rawStr.substring(210, 225);
console.log('Sample raw (latin1):', JSON.stringify(sample));
const reencoded = tryReencode(sample);
console.log('Sample re-encoded:', JSON.stringify(reencoded));
