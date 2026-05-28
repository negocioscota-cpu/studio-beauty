const fs = require('fs');

// Estes arquivos têm double-encoding: foram lidos como Latin-1 e salvos como UTF-8
// A correção é inversa: ler os bytes atuais como Latin-1, então escrever como UTF-8
const filesToCheck = [
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
    'pages/team-management.js',
    'pages/settings.js',
    'pages/studio-profile.js',
    'pages/bolsa-beleza.js',
    'js/app.js',
    'js/auth.js',
    'app.html',
];

function hasMojibake(str) {
    // Detecta padrões típicos de mojibake: Ã seguido de char especial
    return /Ã[£¢¡¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/.test(str) ||
           /ð[Ÿ\u009f]/.test(str) ||
           str.includes('ðŸ') ||
           str.includes('âš') ||
           str.includes('â³') ||
           str.includes('âœ');
}

function fixDoubleEncoding(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`SKIP (not found): ${filePath}`);
        return;
    }

    const rawBuffer = fs.readFileSync(filePath);
    
    // O arquivo atual está em UTF-8 mas com double-encoding
    // Precisamos: interpretar os bytes como Latin-1 string, depois Buffer.from(str, 'latin1') nos dá os bytes corretos
    const asLatin1 = rawBuffer.toString('latin1');
    
    if (!hasMojibake(asLatin1)) {
        console.log(`OK (sem mojibake): ${filePath}`);
        return;
    }

    // Re-interpretar: o que está como Latin-1 são na verdade bytes UTF-8
    // Então vamos re-criar o buffer correto
    const correctedBuffer = Buffer.from(asLatin1, 'latin1');
    
    // Verificar se o resultado é UTF-8 válido
    try {
        const correctedStr = correctedBuffer.toString('utf8');
        
        // Verificar se ficou correto - não deve ter mais mojibake
        if (!hasMojibake(correctedStr)) {
            fs.writeFileSync(filePath, correctedBuffer);
            console.log(`FIXED: ${filePath}`);
        } else {
            // Pode ser que apenas parte do arquivo tenha problema
            // Tentar correção seletiva por linha
            const lines = asLatin1.split('\n');
            const fixedLines = lines.map(line => {
                if (hasMojibake(line)) {
                    try {
                        const fixed = Buffer.from(line, 'latin1').toString('utf8');
                        return fixed;
                    } catch(e) {
                        return line;
                    }
                }
                return line;
            });
            const result = fixedLines.join('\n');
            fs.writeFileSync(filePath, result, 'utf8');
            console.log(`PARTIAL FIX: ${filePath}`);
        }
    } catch(e) {
        console.log(`ERROR decoding ${filePath}: ${e.message}`);
    }
}

for (const file of filesToCheck) {
    fixDoubleEncoding(file);
}

console.log('\nVerificando resultado...');
const result = fs.readFileSync('pages/modules.js', 'utf8');
const line215 = result.split('\n')[214];
console.log('Line 215:', line215.trim());
