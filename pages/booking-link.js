// === Página: Link de Agendamento Online ===
const BookingLinkPage = {
    BOOKING_DOMAIN: 'https://clientehubclin.web.app/booking/',

    render() {
        return `
        <div class="max-w-3xl mx-auto space-y-8">
            <div>
                <h2 class="font-headline text-3xl font-extrabold tracking-tight">Link de Agendamento Online</h2>
                <p class="text-on-surface-variant mt-1">Compartilhe este link na bio do Instagram, WhatsApp Business ou site para que seus clientes agendem sozinhos.</p>
            </div>

            <div class="bg-surface-container-lowest rounded-xl p-5 md:p-8 shadow-sm ghost-border">
                <h3 class="font-headline font-bold text-xl mb-2 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">link</span> Seu Link Personalizado
                </h3>

                <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-6">
                    <div class="flex-1 flex items-center bg-surface-container-high rounded-xl overflow-hidden">
                        <span class="px-4 py-4 bg-primary/10 text-primary font-bold text-sm whitespace-nowrap">clientehubclin.web.app/booking/</span>
                        <input type="text" id="set-booking-slug" class="settings-input flex-1 px-3 py-4 bg-transparent border-none text-on-surface font-bold text-sm" placeholder="studiobeauty"/>
                    </div>
                    <button onclick="BookingLinkPage.copyBookingLink()" class="px-4 py-4 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors" title="Copiar link">
                        <span class="material-symbols-outlined">content_copy</span>
                    </button>
                    <button onclick="BookingLinkPage.shareBookingLink()" class="px-4 py-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors" title="Compartilhar via WhatsApp">
                        <span class="material-symbols-outlined">share</span>
                    </button>
                </div>

                <div id="booking-link-preview" class="mt-3 p-3 bg-blue-50 rounded-xl flex items-center gap-2 hidden">
                    <span class="material-symbols-outlined text-blue-600 text-sm">check_circle</span>
                    <span id="booking-full-link" class="text-xs text-blue-700 font-medium"></span>
                </div>

                <!-- QR Code -->
                <div class="mt-6 flex flex-col sm:flex-row items-center gap-4 p-4 bg-surface-container-high rounded-xl">
                    <div id="qr-preview" class="w-36 h-36 bg-white rounded-xl flex items-center justify-center border-2 border-dashed border-outline-variant/30 overflow-hidden">
                        <span class="material-symbols-outlined text-3xl text-on-surface-variant/40">qr_code_2</span>
                    </div>
                    <div class="flex-1 text-center sm:text-left">
                        <p class="font-bold text-sm text-on-surface">QR Code de Agendamento</p>
                        <p class="text-xs text-on-surface-variant mb-3">Os clientes podem escanear para acessar sua agenda.</p>
                        <div class="flex gap-2 justify-center sm:justify-start flex-wrap">
                            <button onclick="BookingLinkPage.generateQR()" class="px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">qr_code_2</span> Gerar QR Code
                            </button>
                            <button id="btn-download-qr" onclick="BookingLinkPage.downloadQR()" class="hidden px-4 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">download</span> Baixar PNG
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <button onclick="BookingLinkPage.save()" class="px-8 py-3 vitality-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2">
                    <span class="material-symbols-outlined">save</span> Salvar Link
                </button>
            </div>
        </div>`;
    },

    async init() {
        const s = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        if (s.bookingSlug) {
            document.getElementById('set-booking-slug').value = s.bookingSlug;
            this.updateBookingPreview();
        }
        document.getElementById('set-booking-slug')?.addEventListener('input', (e) => {
            e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
            this.updateBookingPreview();
        });
    },

    getBookingUrl() {
        return this.BOOKING_DOMAIN + (document.getElementById('set-booking-slug')?.value || '');
    },

    updateBookingPreview() {
        const slug    = document.getElementById('set-booking-slug')?.value;
        const preview = document.getElementById('booking-link-preview');
        const link    = document.getElementById('booking-full-link');
        if (slug) { preview.classList.remove('hidden'); link.textContent = this.getBookingUrl(); }
        else { preview.classList.add('hidden'); }
    },

    copyBookingLink() {
        const slug = document.getElementById('set-booking-slug')?.value;
        if (!slug) { App.showToast('Digite um slug primeiro.', 'info'); return; }
        navigator.clipboard.writeText(this.getBookingUrl());
        App.showToast('Link copiado! ✅', 'success');
    },

    shareBookingLink() {
        const slug = document.getElementById('set-booking-slug')?.value;
        if (!slug) { App.showToast('Digite um slug primeiro.', 'info'); return; }
        const msg = `Agende sua consulta! 💆‍♀️📅\n${this.getBookingUrl()}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    },

    generateQR() {
        const slug = document.getElementById('set-booking-slug')?.value;
        if (!slug) { App.showToast('Digite um slug para gerar o QR Code.', 'info'); return; }
        try {
            const qr = qrcode(0, 'M');
            qr.addData(this.getBookingUrl());
            qr.make();
            const container = document.getElementById('qr-preview');
            container.innerHTML = qr.createImgTag(5, 12);
            container.querySelector('img').style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:8px;';
            container.classList.remove('border-dashed', 'border-2');
            document.getElementById('btn-download-qr')?.classList.remove('hidden');
            document.getElementById('btn-download-qr')?.classList.add('flex');
            App.showToast('QR Code gerado! ✅', 'success');
        } catch(e) { App.showToast('Erro ao gerar QR Code.', 'error'); }
    },

    downloadQR() {
        const img = document.querySelector('#qr-preview img');
        if (!img) { App.showToast('Gere o QR Code primeiro.', 'info'); return; }
        const canvas = document.createElement('canvas');
        canvas.width = 400; canvas.height = 400;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 400, 400);
        const tmpImg = new Image();
        tmpImg.onload = () => {
            ctx.drawImage(tmpImg, 20, 20, 360, 360);
            const a = document.createElement('a');
            a.download = 'studiobeauty-qrcode.png';
            a.href = canvas.toDataURL('image/png');
            a.click();
            App.showToast('QR Code baixado! 📥', 'success');
        };
        tmpImg.src = img.src;
    },

    save() {
        const s = JSON.parse(localStorage.getItem('ch_settings') || '{}');
        s.bookingSlug = document.getElementById('set-booking-slug')?.value || '';
        localStorage.setItem('ch_settings', JSON.stringify(s));
        App.showToast('Link de agendamento salvo! ✅', 'success');
    }
};
