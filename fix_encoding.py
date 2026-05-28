import os

files_to_fix = [
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\modules.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\reports.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\schedule.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\clients.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\dashboard.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\ficha-tecnica.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\catalog.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\consent.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\portfolio.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\reminders.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\birthday.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\inventory.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\team-management.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\settings.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\studio-profile.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\pages\bolsa-beleza.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\js\app.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\js\auth.js',
    r'C:\Users\conec\.gemini\antigravity\scratch\LashBrow\app.html',
]

# Mapeamento de mojibake para texto correto
# Padrão: UTF-8 bytes interpretados como Latin-1
fixes = [
    # Sequências de emojis corrompidos (bytes UTF-8 interpretados como Latin-1)
    ('\xc3\xa9\xc3\x85\xc2\xa1', '\xe2\x9a\xa1'),  # ⚡ - mas em str python3
    # Vamos usar strings diretas
    ('â\x9a¡', '⚡'),
    ('ð\x9f\x92³', '💳'),
    ('ð\x9f\x92µ', '💵'),
    ('ð\x9f¦', '🏦'),
    ('ð\x9f\x94\x84', '🔄'),
    ('ð\x9f\x92°', '💰'),
    ('â\x9c…', '✅'),
    ('â³', '⏳'),
    ('â\x9c•', '✕'),
    # Caracteres portugueses corrompidos
    ('Ã\xadlios', 'ílios'),    # ílios
    ('CÃ\xad', 'Cí'),
    ('Ã\xadnimo', 'ínimo'),
    ('Ã\xadnima', 'ínima'),
    ('Ã\x87ADO', 'ÇADO'),
    ('Ã\x87amento', 'çamento'),
    ('Ã§amento', 'çamento'),
    ('AÃ§Ã\xb5es', 'Ações'),
    ('AÃ§Ãµes', 'Ações'),
    ('Ã§Ã\xb5es', 'ções'),
    ('Ã§Ãµes', 'ções'),
    ('ExtensÃ\xb5es', 'Extensões'),
    ('ExtensÃµes', 'Extensões'),
    ('ObservaÃ§Ã\xb5es', 'Observações'),
    ('ObservaÃ§Ãµes', 'Observações'),
    ('DescartÃ¡veis', 'Descartáveis'),
    ('DescartÃ\xa1veis', 'Descartáveis'),
    ('invÃ¡lido', 'inválido'),
    ('invÃ\xa1lido', 'inválido'),
    ('CartÃ\xa3o CrÃ©dito', 'Cartão Crédito'),
    ('CartÃ£o CrÃ©dito', 'Cartão Crédito'),
    ('CartÃ\xa3o DÃ©bito', 'Cartão Débito'),
    ('CartÃ£o DÃ©bito', 'Cartão Débito'),
    ('TransferÃªncia', 'Transferência'),
    ('TransferÃ\xaancia', 'Transferência'),
    ('LanÃ\xa7amentos', 'Lançamentos'),
    ('LanÃ§amentos', 'Lançamentos'),
    ('LanÃ\xa7amento', 'Lançamento'),
    ('LanÃ§amento', 'Lançamento'),
    ('lanÃ\xa7amento', 'lançamento'),
    ('lanÃ§amento', 'lançamento'),
    ('DescriÃ\xa7Ã\xa3o', 'Descrição'),
    ('DescriÃ§Ã£o', 'Descrição'),
    ('DescriÃ\xa7Ã£o', 'Descrição'),
    ('serviÃ\xa7o', 'serviço'),
    ('serviÃ§o', 'serviço'),
    ('HISTÃ"RICO', 'HISTÓRICO'),
    ('HistÃ³rico', 'Histórico'),
    ('HistÃ\xb3rico', 'Histórico'),
    ('histÃ³rico', 'histórico'),
    ('histÃ\xb3rico', 'histórico'),
    ('RemoÃ\xa7Ã\xa3o', 'Remoção'),
    ('RemoÃ§Ã£o', 'Remoção'),
    (' Â· ', ' · '),
    (' Â·', ' ·'),
    ('Ã¡', 'á'),
    ('Ã©', 'é'),
    ('Ã\xa9', 'é'),
    ('Ã³', 'ó'),
    ('Ã\xb3', 'ó'),
    ('Ã\xba', 'ú'),
    ('Ãº', 'ú'),
    ('Ã\xa3', 'ã'),
    ('Ã£', 'ã'),
    ('Ã\xb5', 'õ'),
    ('Ãµ', 'õ'),
    ('Ã\xa7', 'ç'),
    ('Ã§', 'ç'),
    ('Ã\xad', 'í'),
    ('Ã\xa0', 'à'),
    ('Ã\x80', 'À'),
    ('Ã\x87', 'Ç'),
    ('Ã\x89', 'É'),
    ('Ã\x93', 'Ó'),
    ('Ã\x9a', 'Ú'),
    ('Ã\x83', 'Ã'),
    ('Ã\x95', 'Õ'),
    ('ðŸ', ''),   # prefixo de emoji corrompido - tratar depois
]

def fix_emoji_prefix(content):
    # Emojis corrompidos que começam com ðŸ seguido de caracteres
    # Mapeamento específico dos emojis que aparecem no código
    emoji_map = {
        "ð\x9f\x92\xb3": "💳",
        "ð\x9f\x92\xb5": "💵",
        "ð\x9f\x92\xb0": "💰",
        "ð\x9f\x94\x84": "🔄",
        "ð\x9f\xa6": "🏦",
    }
    return content

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        print(f"SKIP (not found): {filepath}")
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for old, new in fixes:
            content = content.replace(old, new)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"FIXED: {os.path.basename(filepath)}")
        else:
            print(f"OK (no changes): {os.path.basename(filepath)}")
    except Exception as e:
        print(f"ERROR {os.path.basename(filepath)}: {e}")

print("\nDone!")
