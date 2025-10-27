// Ouve a mensagem do curriculo.html
window.addEventListener('message', async (e) => {
    const data = e.data;
    if (data.type !== 'EXPORT_CV') return;

    // --- 1. CONSTRUÇÃO DO HTML ---
    // (O código de construção de HTML [buildContactIcons, buildExperience, etc.] 
    // permanece o mesmo. Ele usa classes do Tailwind que agora 
    // estarão disponíveis através do CSS estático.)

    function buildContactIcons(data) {
        let html = '';
        if (data.email) {
            html += `<a href="mailto:${data.email}" class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>${data.email}</span>
            </a>`;
        }
        if (data.phone) {
            html += `<a href="tel:${data.phone}" class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>${data.phone}</span>
            </a>`;
        }
        if (data.address) {
            html += `<div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${data.address}</span>
            </div>`;
        }
        if (data.age) {
            html += `<div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
                <span>${data.age} anos</span>
            </div>`;
        }
        if (data.maritalStatus) {
            html += `<div class="flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
               <span>${data.maritalStatus}</span>
            </div>`;
        }
        if (data.cnh && data.cnh !== 'Não possuo') {
            html += `<div class="flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L1 16v5c0 .6.4 1 1 1h3c.6 0 1-.4 1-1v-1h12v1c0 .6.4 1 1 1zM2 16l1.5-4.5h11L16 16H2zm13 1v-1H5v1h10zm-1-4h.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5H14v1z"/></svg>
               <span>CNH: ${data.cnh}</span>
            </div>`;
        }
        return html;
    }

    function buildExperience(exp) {
        return `<div>
            <div class="flex justify-between items-baseline flex-wrap">
                <div class="pr-4">
                    <h4 class="text-lg font-semibold">${exp.title}</h4>
                    <p class="text-md text-gray-700">${exp.company} ${exp.location ? `&bull; ${exp.location}` : ''}</p>
                </div>
                <p class="text-sm text-gray-500 text-right whitespace-nowrap">${exp.start} ${exp.start && exp.end ? ' - ' : ''} ${exp.end}</p>
            </div>
            ${exp.description ? `<p class="mt-2 text-gray-600 leading-relaxed">${exp.description}</p>` : ''}
        </div>`;
    }

    function buildEducation(edu) {
        return `<div>
            <div class="flex justify-between items-baseline flex-wrap">
                <div class="pr-4">
                    <h4 class="text-lg font-semibold">${edu.degree}</h4>
                    <p class="text-md text-gray-700">${edu.institution}</p>
                </div>
                <p class="text-sm text-gray-500 text-right whitespace-nowrap">${edu.start} ${edu.start && edu.end ? ' - ' : ''} ${edu.end}</p>
            </div>
        </div>`;
    }

    function buildSkills(skills) {
        if (!skills || skills.length === 0) return '';
        return skills.map(skill => 
            `<span class="inline-block h-7 leading-7 bg-gray-200 rounded-full px-4 text-sm font-semibold text-gray-700 mr-2 mb-2 align-top">${skill}</span>`
        ).join('');
    }

    function buildTemplateModern(data) {
        const contactIcons = buildContactIcons(data);
        return `
            <header class="pb-6">
                <div class="flex justify-between items-start">
                    <div class="pr-4" style="max-width: calc(100% - 120px);">
                        <h1 id="resume-name" class="text-4xl font-bold">${data.name}</h1>
                        <h2 id="resume-job-title" class="text-xl font-medium text-gray-600 mt-1">${data.role}</h2>
                    </div>
                </div>
                <div id="contact-info" class="mt-4 text-sm">${contactIcons}</div>
            </header>
        `;
    }
    
    function buildTemplateClassicMinimalist(data) {
        const contactIcons = buildContactIcons(data);
        const headerAlign = data.templateClass === 'template-classic' ? 'text-center' : 'text-left';
        return `
            <header class="pb-6 ${headerAlign}">
                <h1 id="resume-name" class="text-4xl font-bold">${data.name}</h1>
                <h2 id="resume-job-title" class="text-xl font-medium text-gray-600 mt-1">${data.role}</h2>
                <div id="contact-info" class="mt-4 text-sm flex gap-4 ${headerAlign === 'text-center' ? 'justify-center' : 'justify-start'} flex-wrap">
                    ${contactIcons}
                </div>
            </header>
        `;
    }

    // --- MONTAGEM DO HTML ---
    const container = document.getElementById('resume-preview');
    if (!container) {
        window.parent.postMessage({ type: 'EXPORT_ERROR', error: 'Container #resume-preview não encontrado' }, '*');
        return;
    }

    // Define a classe do template e a cor
    container.className = `resume-preview bg-white text-gray-900 ${data.templateClass}`;
    container.style.setProperty('--theme-color', data.themeColor);

    let headerHTML = '';
    if (data.templateClass === 'template-modern') {
        headerHTML = buildTemplateModern(data);
    } else {
        headerHTML = buildTemplateClassicMinimalist(data);
    }

    const resumeHTML = `
        ${data.profilePicDataUrl ? `
            <div id="profile-pic-container" style="display: block;">
                <img id="profile-pic-img" src="${data.profilePicDataUrl}" alt="Foto de Perfil">
            </div>` : ''}
        
        ${headerHTML}
        
        <main class="mt-8 space-y-8">
            ${data.summary ? `
                <section id="summary-section">
                    <h3 class="section-title">Resumo Profissional</h3>
                    <p id="resume-summary" class="text-gray-700 leading-relaxed">${data.summary}</p>
                </section>` : ''}
            
            ${data.experiences.length > 0 ? `
                <section id="experience-section">
                    <h3 class="section-title">Experiência Profissional</h3>
                    <div id="resume-experience-list" class="space-y-6">
                        ${data.experiences.map(buildExperience).join('')}
                    </div>
                </section>` : ''}

            ${data.education.length > 0 ? `
                <section id="education-section">
                    <h3 class="section-title">Formação Acadêmica</h3>
                    <div id="resume-education-list" class="space-y-4">
                        ${data.education.map(buildEducation).join('')}
                    </div>
                </section>` : ''}

            ${data.skills.length > 0 ? `
                <section id="skills-section">
                    <h3 class="section-title">Habilidades</h3>
                    <div id="resume-skills">
                        ${buildSkills(data.skills)}
                    </div>
                </section>` : ''}
        </main>
        
        ${data.qrDataUrl ? `
            <div id="whatsapp-qr-code-container" style="display: flex;">
                <img src="https://files.catbox.moe/cvyrae.svg" alt="Ícone do WhatsApp" class="h-8 mb-2">
                <img id="qr-code-img" alt="QR Code do WhatsApp" class="w-20 h-20" src="${data.qrDataUrl}">
            </div>` : ''}
    `;
    
    // Injeta o HTML no container
    container.innerHTML = resumeHTML;

    // --- 2. GERAÇÃO DO PDF ---
    console.log("[EXPORT.JS] HTML injetado. A iniciar geração do PDF...");

    // CORREÇÃO CRÍTICA: RE-ADICIONANDO ESPERA
    // É NECESSÁRIO esperar um momento para que o browser
    // aplique os estilos do 'tailwind.min.css' (carregado no export.html)
    // ao HTML que acabámos de injetar (container.innerHTML = resumeHTML).
    // Sem esta espera, html2canvas tenta "fotografar" um layout quebrado.
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("[EXPORT.JS] Espera de 500ms concluída.");


    try {
        // Assegura que as bibliotecas estão carregadas
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            throw new Error("Biblioteca jsPDF não foi carregada.");
        }
        if (typeof html2canvas === 'undefined') {
            throw new Error("Biblioteca html2canvas não foi carregada.");
        }
        console.log("[EXPORT.JS] jsPDF e html2canvas carregados.");

        const element = document.getElementById('resume-preview');
        if (!element) {
            throw new Error("Elemento #resume-preview não encontrado.");
        }
        
        // Assegura que as fontes (Poppins) estão prontas
        // Esta é a ÚNICA espera necessária e correta.
        // O browser garante que o CSS (local e CDN) é lido
        // antes de as fontes poderem ser declaradas como "prontas".
        try {
            await document.fonts.ready;
            console.log("[EXPORT.JS] Fontes estão prontas (document.fonts.ready).");
        } catch (fontErr) {
            console.warn("[EXPORT.JS] Erro ao esperar por document.fonts.ready:", fontErr);
        }
        
        const canvas = await html2canvas(element, {
            scale: 2, 
            useCORS: true,
            logging: true, // Ativa logs do html2canvas
        });
        console.log("[EXPORT.JS] html2canvas concluído com sucesso.");

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        const blob = pdf.getBlob();
        const blobUrl = URL.createObjectURL(blob);
        console.log("[EXPORT.JS] PDF gerado. A enviar mensagem 'EXPORT_DONE'.");

        // Envia a URL do Blob de volta para o curriculo.html
        window.parent.postMessage({ type: 'EXPORT_DONE', blobUrl: blobUrl }, '*');

    } catch (err) {
        console.error("[EXPORT.JS] Erro CRÍTICO ao gerar PDF:", err);
        window.parent.postMessage({ type: 'EXPORT_ERROR', error: (err.message || 'Erro desconhecido') }, '*');
    }
});


