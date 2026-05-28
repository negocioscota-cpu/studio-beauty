// === EXPORTAÇÃO EXCEL GLOBAL ===
const ExcelExport = {

    /**
     * Exporta um array de objetos para um arquivo .xlsx
     * @param {Array<Object>} data - Array de objetos com os dados
     * @param {string} filename - Nome do arquivo (sem extensão)
     * @param {string} sheetName - Nome da aba da planilha
     */
    fromData(data, filename = 'dados', sheetName = 'Dados') {
        if (!data || data.length === 0) {
            App.showToast('Nenhum dado para exportar.', 'warning');
            return;
        }
        try {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            // Auto-dimensionar colunas
            const colWidths = Object.keys(data[0]).map(key => {
                const maxLen = Math.max(
                    key.length,
                    ...data.map(row => String(row[key] || '').length)
                );
                return { wch: Math.min(maxLen + 2, 40) };
            });
            ws['!cols'] = colWidths;

            XLSX.writeFile(wb, `${filename}.xlsx`);
            App.showToast('📥 Arquivo Excel baixado com sucesso!', 'success');
        } catch (err) {
            console.error('Erro ao exportar Excel:', err);
            App.showToast('Erro ao gerar arquivo Excel.', 'error');
        }
    },

    /**
     * Exporta dados de uma tabela HTML para .xlsx
     * @param {string} tableId - ID do elemento <table>
     * @param {string} filename - Nome do arquivo (sem extensão)
     */
    fromTable(tableId, filename = 'dados') {
        const table = document.getElementById(tableId);
        if (!table) {
            App.showToast('Tabela não encontrada.', 'warning');
            return;
        }
        try {
            const wb = XLSX.utils.table_to_book(table, { sheet: 'Dados' });
            XLSX.writeFile(wb, `${filename}.xlsx`);
            App.showToast('📥 Arquivo Excel baixado com sucesso!', 'success');
        } catch (err) {
            console.error('Erro ao exportar Excel:', err);
            App.showToast('Erro ao gerar arquivo Excel.', 'error');
        }
    },

    /**
     * Cria o HTML do botão de exportação padrão
     * @param {string} onclick - Ação do botão
     * @param {string} label - Texto do botão
     * @returns {string} HTML string
     */
    buttonHTML(onclick, label = 'Exportar Excel') {
        return `<button class="btn btn-export-excel" onclick="${onclick}" title="${label}">
            <span class="material-symbols-outlined" style="font-size:18px">download</span>
            <span>${label}</span>
        </button>`;
    }
};
