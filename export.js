/* Arquivo: export.js
  Script executado dentro do iframe (export.html).
  Ouve a mensagem do index.html, renderiza o currículo e 
  envia de volta a URL do blob do PDF gerado.
*/

// Acessa as bibliotecas carregadas no export.html
const { jsPDF } = window.jspdf;
const { html2canvas } = window;

// Ícones SVG para a seção de contacto
const ICONS = {
    email: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    phone: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    address: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    age: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>`,
    maritalStatus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    cnh: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L1 16v5c0 .6.4 1 1 1h3c.6 0 1-.4 1-1v-1h12v1c0 .6.4 1 1 1zM2 16l1.5-4.5h11L16 16H2zm13 1v-1H5v1h10zm-1-4h.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5H14v1z"/></svg>`
};

/**
 * Renderiza os dados do currículo no template HTML.
 * @param {object} data - O objeto de dados do currículo.
 */
function renderCV(data) {
    // Define a cor do tema
    document.documentElement.style.setProperty('--theme-color', data.themeColor);

    // Cabeçalho
    document.getElementById('resume-name').textContent = data.name;
    document.getElementById('resume-job-title').textContent = data.role;

    // Foto de Perfil
    if (data.profilePicDataUrl && data.profilePicDataUrl.startsWith('data:image')) {
        document.getElementById('profile-pic-img').src = data.profilePicDataUrl;
        document.getElementById('profile-pic-container').style.display = 'block';
    }

    // QR Code
    if (data.qrDataUrl && data.qrDataUrl.startsWith('data:image')) {
        document.getElementById('qr-code-img').src = data.qrDataUrl;
        document.getElementById('whatsapp-qr-code-container').style.display = 'block';
    }
    
    // Sidebar - Contacto
    const contactContainer = document.getElementById('contact-info');
    contactContainer.innerHTML = '<h3>Contacto</h3>'; // Limpa e adiciona o título
    
    if (data.email) {
        contactContainer.innerHTML += `<div>${ICONS.email}<span>${data.email}</span></div>`;
    }
    if (data.phone) {
        contactContainer.innerHTML += `<div>${ICONS.phone}<span>${data.phone}</span></div>`;
    }
    if (data.address) {
        contactContainer.innerHTML += `<div>${ICONS.address}<span>${data.address}</span></div>`;
    }
    if (data.age) {
        contactContainer.innerHTML += `<div>${ICONS.age}<span>${data.age} anos</span></div>`;
    }
    if (data.maritalStatus) {
        contactContainer.innerHTML += `<div>${ICONS.maritalStatus}<span>${data.maritalStatus}</span></div>`;
    }
    if (data.cnh && data.cnh !== 'Não possuo') {
        contactContainer.innerHTML += `<div>${ICONS.cnh}<span>CNH: ${data.cnh}</span></div>`;
    }

    // Sidebar - Skills
    const skillsContainer = document.getElementById('resume-skills');
    skillsContainer.innerHTML = ''; // Limpa
    if (data.skills && data.skills.length > 0) {
        data.skills.forEach(skill => {
            skillsContainer.innerHTML += `<span>${skill}</span>`;
        });
    } else {
        document.getElementById('skills-section').style.display = 'none';
    }

    // Conteúdo Principal - Resumo
    const summarySection = document.getElementById('summary-section');
    if (data.summary) {
        document.getElementById('resume-summary').textContent = data.summary;
    } else {
        summarySection.style.display = 'none';
    }

    // Conteúdo Principal - Experiência
    const expContainer = document.getElementById('resume-experience-list');
    expContainer.innerHTML = ''; // Limpa
    if (data.experiences && data.experiences.length > 0) {
        data.experiences.forEach(exp => {
            if (exp.title || exp.company) {
                expContainer.innerHTML += `
                    <div class="resume-item">
                        <h4>${exp.title}</h4>
                        <p class="item-subtitle">${exp.company} ${exp.location ? `&bull; ${exp.location}` : ''}</p>
                        <p class="item-date">${exp.start} ${exp.start && exp.end ? ' - ' : ''} ${exp.end}</p>
                        <div class="item-description">${exp.description}</div>
                    </div>
                `;
            }
        });
    } else {
        document.getElementById('experience-section').style.display = 'none';
    }

    // Conteúdo Principal - Formação
    const eduContainer = document.getElementById('resume-education-list');
    eduContainer.innerHTML = ''; // Limpa
    if (data.education && data.education.length > 0) {
        data.education.forEach(edu => {
             if (edu.degree || edu.institution) {
                eduContainer.innerHTML += `
                    <div class="resume-item">
                        <h4>${edu.degree}</h4>
                        <p class="item-subtitle">${edu.institution}</p>
                        <p class="item-date">${edu.start} ${edu.start && edu.end ? ' - ' : ''} ${edu.end}</p>
                    </div>
                `;
             }
        });
    } else {
        document.getElementById('education-section').style.display = 'none';
    }
}

/**
 * Gera o PDF a partir do HTML renderizado.
 */
async function generatePdf() {
    const resumeElement = document.getElementById('resume-export-preview');

    // Garante que todas as fontes e imagens estejam carregadas
    await document.fonts.ready;

    const canvas = await html2canvas(resumeElement, {
        scale: 2, // Aumenta a resolução
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
    return pdf.output('blob');
}

// Ouve a mensagem do index.html
window.addEventListener('message', async (e) => {
    // Verifica se a mensagem é a correta
    if (e.data && e.data.type === 'EXPORT_CV') {
        const data = e.data;
        
        try {
            // 1. Renderiza o HTML com os dados
            renderCV(data);
            
            // 2. Gera o blob do PDF
            const pdfBlob = await generatePdf();
            
            // 3. Cria uma URL para o blob
            const blobUrl = URL.createObjectURL(pdfBlob);
            
            // 4. Envia a URL de volta para a janela principal
            e.source.postMessage({ type: 'EXPORT_DONE', blobUrl: blobUrl }, e.origin);

        } catch (error) {
            console.error("Erro ao gerar PDF no iframe:", error);
            // Informa a janela principal sobre o erro (opcional)
            e.source.postMessage({ type: 'EXPORT_ERROR', error: error.message }, e.origin);
        }
    }
});
