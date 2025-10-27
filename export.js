// Ouve a mensagem do curriculo.html
window.addEventListener('message', async (e) => {
    if (e.data?.type !== 'EXPORT_CV') return;

    const data = e.data;
    const container = document.getElementById('resume-export-container');
    if (!container) return;

    // --- 1. CONSTRUÇÃO DO HTML ---
    // Esta função constrói o HTML dos ícones de contacto
    const buildContactIcons = () => {
        // SVG Ícones (para não depender de links externos)
        const icons = {
            email: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
            phone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
            address: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
            age: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>',
            maritalStatus: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
            cnh: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L1 16v5c0 .6.4 1 1 1h3c.6 0 1-.4 1-1v-1h12v1c0 .6.4 1 1 1zM2 16l1.5-4.5h11L16 16H2zm13 1v-1H5v1h10zm-1-4h.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5H14v1z"/></svg>'
        };

        let contactHTML = '';
        if (data.email) contactHTML += `<a href="mailto:${data.email}">${icons.email} <span>${data.email}</span></a>`;
        if (data.phone) contactHTML += `<a href="tel:${data.phone}">${icons.phone} <span>${data.phone}</span></a>`;
        if (data.address) contactHTML += `<div>${icons.address} <span>${data.address}</span></div>`;
        if (data.age) contactHTML += `<div>${icons.age} <span>${data.age} anos</span></div>`;
        if (data.maritalStatus) contactHTML += `<div>${icons.maritalStatus} <span>${data.maritalStatus}</span></div>`;
        if (data.cnh && data.cnh !== 'Não possuo') contactHTML += `<div>${icons.cnh} <span>CNH: ${data.cnh}</span></div>`;
        
        return contactHTML;
    };

    // Constrói o HTML das experiências
    const buildExperience = () => {
        if (!data.experiences || data.experiences.length === 0) return '';
        return data.experiences.map(exp => `
            <div>
                <div class="header-flex-wrapper">
                    <div class="pr-4">
                        <h4 class="experience-title">${exp.title}</h4>
                        <p class="experience-subtitle">${exp.company} ${exp.location ? `&bull; ${exp.location}` : ''}</p>
                    </div>
                    <p class="date-text">${exp.start} ${exp.start && exp.end ? ' - ' : ''} ${exp.end}</p>
                </div>
                ${exp.description ? `<div class="experience-description">${exp.description}</div>` : ''}
            </div>
        `).join('');
    };

    // Constrói o HTML da formação
    const buildEducation = () => {
        if (!data.education || data.education.length === 0) return '';
        return data.education.map(edu => `
            <div>
                <div class="header-flex-wrapper">
                    <div class="pr-4">
                        <h4 class="education-title">${edu.degree}</h4>
                        <p class="education-subtitle">${edu.institution}</p>
                    </div>
                    <p class="date-text">${edu.start} ${edu.start && edu.end ? ' - ' : ''} ${edu.end}</p>
                </div>
            </div>
        `).join('');
    };

    // Constrói o HTML das habilidades
    const buildSkills = () => {
        if (!data.skills || data.skills.length === 0) return '';
        return data.skills.map(skill => `<span>${skill}</span>`).join('');
    };

    // Constrói o HTML da foto de perfil
    const buildProfilePic = () => {
        if (!data.profilePicDataUrl) return '';
        return `
            <div id="profile-pic-container" style="display: block;">
                <img id="profile-pic-img" src="${data.profilePicDataUrl}" alt="Foto de Perfil">
            </div>
        `;
    };

    // Constrói o HTML do QR Code
    const buildQRCode = () => {
        if (!data.qrDataUrl) return '';
        return `
            <div id="whatsapp-qr-code-container" style="display: flex;">
                <svg class="whatsapp-icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.06 21.94L7.31 20.58C8.75 21.38 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 9.27 20.92 6.78 19.01 4.88C17.11 2.97 14.62 2 12.04 2ZM12.04 3.67C14.23 3.67 16.29 4.5 17.8 5.98C19.3 7.47 20.28 9.53 20.28 11.91C20.28 16.49 16.68 20.15 12.04 20.15C10.5 20.15 9.03 19.75 7.75 19L7.34 18.78L4.31 19.69L5.25 16.72L5.02 16.3C3.62 14.93 2.95 13.18 2.95 11.91C2.95 7.33 6.61 3.67 12.04 3.67ZM9.1 7.29C8.91 7.29 8.71 7.3 8.52 7.69C8.33 8.08 7.63 8.72 7.63 9.91C7.63 11.1 8.54 12.26 8.69 12.45C8.84 12.64 9.96 14.49 11.82 15.23C13.68 15.98 14.28 15.69 14.67 15.63C15.06 15.56 16.03 15.01 16.22 14.42C16.41 13.83 16.41 13.34 16.35 13.24C16.28 13.14 16.09 13.08 15.8 12.92C15.51 12.76 14.39 12.2 14.16 12.11C13.93 12.02 13.77 11.96 13.61 12.2C13.45 12.45 13.01 13.01 12.87 13.17C12.73 13.33 12.59 13.36 12.3 13.2C12.01 13.04 11.1 12.73 10.04 11.77C9.22 11.03 8.63 10.12 8.48 9.87C8.33 9.62 8.44 9.5 8.56 9.38C8.68 9.26 8.81 9.11 8.93 8.97C9.05 8.83 9.11 8.73 9.23 8.58C9.35 8.43 9.32 8.27 9.26 8.11C9.2 7.95 8.77 6.9 8.61 6.5C8.45 6.11 8.29 6.14 8.16 6.13C8.03 6.13 7.87 6.13 7.71 6.13" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                <img id="qr-code-img" alt="QR Code do WhatsApp" src="${data.qrDataUrl}">
            </div>
        `;
    };

    // Monta o HTML final
    const resumeHTML = `
        <div id="resume-preview" class="resume-preview ${data.templateClass}" style="--theme-color: ${data.themeColor};">
            
            ${buildProfilePic()}

            <header>
                <!-- O layout do header varia por template -->
                ${data.templateClass === 'template-modern' ? `
                    <div class="flex justify-between items-start">
                        <div class="pr-4" style="max-width: calc(100% - 120px);">
                            <h1 id="resume-name">${data.name}</h1>
                            <h2 id="resume-job-title">${data.role}</h2>
                        </div>
                    </div>
                    <div id="contact-info">${buildContactIcons()}</div>
                ` : `
                    <h1 id="resume-name">${data.name}</h1>
                    <h2 id="resume-job-title">${data.role}</h2>
                    <div id="contact-info">${buildContactIcons()}</div>
                `}
            </header>

            <main>
                ${data.summary ? `
                <section id="summary-section">
                    <h3 class="section-title">Resumo Profissional</h3>
                    <p id="resume-summary">${data.summary}</p>
                </section>
                ` : ''}
                
                ${data.experiences.length > 0 ? `
                <section id="experience-section">
                    <h3 class="section-title">Experiência Profissional</h3>
                    <div id="resume-experience-list">${buildExperience()}</div>
                </section>
                ` : ''}

                ${data.education.length > 0 ? `
                <section id="education-section">
                    <h3 class="section-title">Formação Acadêmica</h3>
                    <div id="resume-education-list">${buildEducation()}</div>
                </section>
                ` : ''}

                ${data.skills.length > 0 ? `
                <section id="skills-section">
                    <h3 class="section-title">Habilidades</h3>
                    <div id="resume-skills">${buildSkills()}</div>
                </section>
                ` : ''}
            </main>

            ${buildQRCode()}
        </div>
    `;

    // Injeta o HTML no container
    container.innerHTML = resumeHTML;

    // --- 2. GERAÇÃO DO PDF ---
    // Aguarda que o HTML injetado seja "pintado" pelo navegador.
    // Isto substitui o setTimeout(500) inseguro.
    await new Promise(resolve => requestAnimationFrame(resolve)); 

    try {
        const { jsPDF } = window.jspdf;
        const element = document.getElementById('resume-preview');
        
        // Espera as fontes estarem prontas
        await document.fonts.ready;
        
        const canvas = await html2canvas(element, {
            scale: 2, // Melhor resolução
            useCORS: true,
            logging: true,
            letterRendering: true,
            allowTaint: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Converte o PDF para Blob
        const blob = pdf.getBlob();
        const blobUrl = URL.createObjectURL(blob);

        // Envia a URL do Blob de volta para o curriculo.html
        window.parent.postMessage({ type: 'EXPORT_DONE', blobUrl: blobUrl }, '*');

    } catch (err) {
        console.error("Erro ao gerar PDF:", err);
        // Informa o pai em caso de erro (opcional)
        window.parent.postMessage({ type: 'EXPORT_ERROR', error: err.message }, '*');
    }
});


