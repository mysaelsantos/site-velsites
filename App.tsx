import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import ResumeForm from './components/ResumeForm';
import ResumePreview, { ResumePreviewRef } from './components/ResumePreview';
import type { ResumeData } from './types';

interface PageData extends Partial<ResumeData> {
    continuation?: {
        [itemId: string]: {
            offset: number;
            totalHeight: number;
        };
    };
}

const DEMO_DATA: ResumeData = {
    personalInfo: {
        name: 'Ana Maria Silva',
        jobTitle: 'Desenvolvedora Front-End',
        email: 'ana.silva@email.com',
        phone: '(11) 98765-4321',
        address: 'São Paulo, SP',
        age: '',
        maritalStatus: '',
        cnh: '',
        profilePicture: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM5Q0EzQUYiIGNsYXNzPSJ3LWZ1bGwgaC1mdWxsIHBhZGRpbmciPjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz4='
    },
    summary: 'Desenvolvedora front-end proativa com 3+ anos de experiência na criação de interfaces de usuário responsivas e performáticas com React e Vue.js. Apaixonada por design limpo e em busca de novos desafios para aplicar minhas habilidades em UI/UX. Histórico comprovado na otimização de performance, resultando em melhorias significativas no Core Web Vitals e na satisfação do cliente. Proficiente em metodologias ágeis e ferramentas de versionamento como Git.',
    experiences: [
        { id: '1', jobTitle: 'Desenvolvedora Front-End Pleno', company: 'Tech Solutions', location: 'São Paulo, SP', startDate: 'Jan 2022', endDate: 'Atual', description: 'Liderança no desenvolvimento do novo portal do cliente usando React, resultando em um aumento de 25% na retenção de usuários. Otimização de performance (Core Web Vitals) e mentoria de desenvolvedores júnior. Colaboração com equipes de UI/UX para garantir a fidelidade do design e a melhor experiência do usuário. Implementação de testes unitários e de integração para garantir a qualidade e a estabilidade do código.' },
        { id: '2', jobTitle: 'Desenvolvedora Front-End Júnior', company: 'Web Agil', location: 'Remoto', startDate: 'Mar 2020', endDate: 'Dez 2021', description: 'Desenvolvimento e manutenção de landing pages e e-commerces em Vue.js, garantindo total responsividade e acessibilidade (WCAG).' }
    ],
    education: [
        { id: '1', degree: 'Análise e Desenvolvimento de Sistemas', institution: 'Universidade Estácio de Sá', startDate: '2018', endDate: '2020' }
    ],
    courses: [
        { id: '1', name: 'React Avançado', institution: 'Udemy', completionDate: '2023' },
        { id: '2', name: 'UI/UX Design Principles', institution: 'Coursera', completionDate: '2022' }
    ],
    languages: [
        { id: '1', language: 'Português', proficiency: 'Fluente' },
        { id: '2', language: 'Inglês', proficiency: 'Avançado' }
    ],
    skills: ['React', 'JavaScript (ES6+)', 'TypeScript', 'Vue.js', 'Tailwind CSS', 'Metodologias Ágeis'],
    style: {
        template: 'template-modern',
        color: '#002e9e',
        showQRCode: true
    }
};

const INITIAL_DATA: ResumeData = {
    personalInfo: { name: '', jobTitle: '', email: '', phone: '', address: '', age: '', maritalStatus: '', cnh: '', profilePicture: '' },
    summary: '',
    experiences: [{ id: Date.now().toString(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' }],
    education: [{ id: Date.now().toString(), degree: '', institution: '', startDate: '', endDate: '' }],
    courses: [{ id: Date.now().toString(), name: '', institution: '', completionDate: '' }],
    languages: [{ id: Date.now().toString(), language: '', proficiency: '' }],
    skills: [],
    style: { template: 'template-modern', color: '#002e9e', showQRCode: true }
};

const ALL_TESTIMONIALS = [
    { text: '"Ferramenta incrível! Consegui criar um currículo super profissional em 10 minutos. A ajuda da IA para o resumo foi a cereja no topo do bolo."', author: '- Mariana S. - Marketing Digital' },
    { text: '"Para quem está a começar a carreira, como eu, este site é uma mão na roda. Templates limpos e muito fáceis de usar. 10/10!"', author: '- João P. - Estudante' },
    { text: '"Finalmente um gerador de currículos que não tenta vender-me um plano premium a cada clique. Gratuito e de alta qualidade. Recomendo!"', author: '- Carlos F. - Desenvolvedor Jr.' },
    { text: '"O design minimalista era exatamente o que eu procurava. Consegui a minha primeira entrevista com o currículo que fiz aqui."', author: '- Ana L. - Designer Gráfica' },
    { text: '"A funcionalidade de IA para melhorar as descrições é fantástica. Poupa imenso tempo e o resultado fica muito mais profissional."', author: '- Ricardo G. - Gerente de Projetos' },
    { text: '"Usei a ferramenta para atualizar o meu currículo antigo e a diferença é notória. A interface é super intuitiva e o resultado final é excelente."', author: '- Sofia B. - Advogada' },
    { text: '"Como assistente administrativo, precisava de algo rápido e profissional. Este site entregou tudo! A IA ajudou a organizar minhas tarefas de forma clara."', author: '- Lucas M. - Assistente Administrativo' },
    { text: '"Trabalho como caixa e não sabia como montar um currículo. Foi tudo muito fácil e o resultado ficou ótimo, bem mais do que eu esperava."', author: '- Camila R. - Operadora de Caixa' },
    { text: '"Simplesmente o melhor que já usei. Em poucos passos, meu currículo de \'ajudante geral\' ficou com cara de especialista. Muito obrigado!"', author: '- Fernando T. - Ajudante Geral' },
    { text: '"Estava a procurar o meu primeiro emprego e não tinha experiência para listar. As sugestões de habilidades e o editor de resumo foram essenciais!"', author: '- Beatriz C. - Jovem Aprendiz' },
    { text: '"O QR Code para o WhatsApp é um diferencial genial. Moderno e prático, recebi elogios na entrevista por causa disso."', author: '- Tiago A. - Vendedor' },
    { text: '"A variedade de templates é ótima. Encontrei um que se encaixava perfeitamente com a minha área de atuação. Recomendo a todos os colegas."', author: '- Letícia N. - Recepcionista' }
];

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const shuffledTestimonials = shuffleArray(ALL_TESTIMONIALS);
const halfLength = Math.ceil(shuffledTestimonials.length / 2);
const TESTIMONIALS_1 = shuffledTestimonials.slice(0, halfLength);
const TESTIMONIALS_2 = shuffledTestimonials.slice(halfLength);


const App: React.FC = () => {
    const [resumeData, setResumeData] = useState<ResumeData>(DEMO_DATA);
    const [paginatedData, setPaginatedData] = useState<PageData[]>([DEMO_DATA]);
    const [isDemoMode, setIsDemoMode] = useState(true);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [deletionTarget, setDeletionTarget] = useState<{ id: string, type: 'experience' | 'education' | 'course' | 'language' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const previewRef = useRef<ResumePreviewRef>(null);
    const previewWrapperRef = useRef<HTMLDivElement>(null);
    const measurementRootRef = useRef<any>(null);

    useEffect(() => {
        const measurementNode = document.createElement('div');
        measurementNode.style.position = 'absolute';
        measurementNode.style.left = '-9999px';
        measurementNode.style.top = '0px';
        measurementNode.style.zIndex = '-1';
        document.body.appendChild(measurementNode);
        measurementRootRef.current = ReactDOM.createRoot(measurementNode);
    
        return () => {
            measurementRootRef.current?.unmount();
            if (document.body.contains(measurementNode)) {
                document.body.removeChild(measurementNode);
            }
        };
    }, []);

    useEffect(() => {
        try {
            const savedData = localStorage.getItem('resumeData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                setResumeData(parsedData);
                setIsDemoMode(false);
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        if (!isDemoMode) {
            try {
                localStorage.setItem('resumeData', JSON.stringify(resumeData));
            } catch (error) {
                console.error("Failed to save data to localStorage", error);
            }
        }
    }, [resumeData, isDemoMode]);

    const handleStartEditing = () => {
        setIsDemoMode(false);
        setResumeData(INITIAL_DATA);
    };

    const handleRequestDelete = (target: { id: string; type: 'experience' | 'education' | 'course' | 'language' }) => {
        setDeletionTarget(target);
    };

    const handleConfirmDelete = () => {
        if (!deletionTarget) return;
        const { type, id } = deletionTarget;

        const keyMap = {
            experience: 'experiences',
            education: 'education',
            course: 'courses',
            language: 'languages',
        } as const;

        const key = keyMap[type];

        setResumeData(prev => ({
            ...prev,
            [key]: prev[key].filter((item: any) => item.id !== id),
        }));

        setDeletionTarget(null);
    };
    
    useEffect(() => {
        if (currentPage > paginatedData.length) {
          setCurrentPage(paginatedData.length > 0 ? paginatedData.length : 1);
        }
    }, [paginatedData, currentPage]);
    
    const paginateResume = useCallback(async () => {
        if (document.fonts) {
            await document.fonts.ready;
        }
        
        const A4_PIXEL_HEIGHT = 1123;
        const BOTTOM_MARGIN = 56; // ~1.5cm margin
        const TOP_MARGIN_P2 = 56; // Top margin for page 2+ to match bottom margin
        const CONTENT_HEIGHT_LIMIT = A4_PIXEL_HEIGHT - BOTTOM_MARGIN;
        const MIN_SPLIT_HEIGHT = 50; // Min height of a split block to show on the first page

        if (!measurementRootRef.current) return;
    
        measurementRootRef.current.render(
            <ResumePreview data={resumeData} isDemoMode={isDemoMode} isFirstPage={true} isMeasurement={true} />
        );
    
        setTimeout(() => {
            const previewEl = measurementRootRef.current._internalRoot.containerInfo.firstChild as HTMLElement;
            if (!previewEl) return;
    
            if (previewEl.scrollHeight <= A4_PIXEL_HEIGHT) {
                setPaginatedData([resumeData]);
                return;
            }
            
            const getElementFullHeight = (element: Element | null): number => {
                if (!element) return 0;
                const style = window.getComputedStyle(element);
                const marginTop = parseFloat(style.marginTop) || 0;
                const marginBottom = parseFloat(style.marginBottom) || 0;
                return element.getBoundingClientRect().height + marginTop + marginBottom;
            };

            interface ContentBlock {
                id: string;
                type: keyof ResumeData;
                data: any;
                height: number;
                marginTop: number;
                isSplittable: boolean;
                isTitle?: boolean;
            }

            const blocks: ContentBlock[] = [];
            const mainEl = previewEl.querySelector('main');
            if (!mainEl) { setPaginatedData([resumeData]); return; }
            
            const sectionElements = Array.from(mainEl.children) as HTMLElement[];

            sectionElements.forEach(sectionEl => {
                const sectionId = sectionEl.id || '';
                let key = sectionId.replace('-section', '') as keyof ResumeData | 'experience';
                
                if (key === 'experience') {
                    key = 'experiences';
                }
                
                const data = resumeData[key as keyof ResumeData];
                
                if (!data || (Array.isArray(data) && data.length === 0)) return;

                const sectionMarginTop = parseFloat(window.getComputedStyle(sectionEl).marginTop) || 0;
                let isFirstBlockInSection = true;
                
                const getMargin = () => {
                    if (isFirstBlockInSection) {
                        isFirstBlockInSection = false;
                        return sectionMarginTop;
                    }
                    return 0;
                };
                
                const isSplittableSection = key === 'summary' || key === 'experiences';

                if (!isSplittableSection) {
                     blocks.push({
                        id: key,
                        type: key,
                        data: data,
                        height: sectionEl.offsetHeight,
                        marginTop: sectionMarginTop,
                        isSplittable: false
                    });
                } else {
                    const titleEl = sectionEl.querySelector<HTMLElement>('.section-title');
                    if (titleEl) {
                        blocks.push({ id: `${key}-title`, type: key, data: null, height: getElementFullHeight(titleEl), marginTop: getMargin(), isSplittable: false, isTitle: true });
                    }

                    if (key === 'summary') {
                         const contentEl = sectionEl.querySelector<HTMLElement>('#resume-summary');
                         if (contentEl) {
                            blocks.push({ id: 'summary', type: 'summary', data: resumeData.summary, height: getElementFullHeight(contentEl), marginTop: getMargin(), isSplittable: true });
                         }
                    } else if (key === 'experiences') {
                        const itemContainerEls = Array.from(sectionEl.querySelectorAll<HTMLElement>(`#resume-experience-list > div`));
                        resumeData.experiences.forEach((item, index) => {
                            const itemContainerEl = itemContainerEls[index];
                            if (itemContainerEl) {
                                const itemMarginTop = parseFloat(window.getComputedStyle(itemContainerEl).marginTop) || 0;
                                const headerEl = itemContainerEl.querySelector<HTMLElement>(':scope > div:first-child');
                                const descriptionEl = itemContainerEl.querySelector<HTMLElement>('p.mt-1');

                                if (headerEl) {
                                    blocks.push({ id: `${item.id}-header`, type: 'experiences', data: item, height: getElementFullHeight(headerEl), marginTop: getMargin() + itemMarginTop, isSplittable: false });
                                }
                                if (descriptionEl) {
                                     blocks.push({ id: item.id, type: 'experiences', data: item, height: getElementFullHeight(descriptionEl), marginTop: 0, isSplittable: true });
                                }
                            }
                        });
                    }
                }
            });

            const pages: PageData[] = [];
            let currentPageData: PageData = { personalInfo: resumeData.personalInfo, style: resumeData.style };
            const headerHeight = getElementFullHeight(previewEl.querySelector('header'));
            const mainMarginTop = parseInt(window.getComputedStyle(mainEl).marginTop, 10) || 0;
            let currentHeight = headerHeight + mainMarginTop;

            const startNewPage = () => {
                pages.push(currentPageData);
                currentPageData = { style: resumeData.style };
                currentHeight = TOP_MARGIN_P2;
            };

            const addDataToPage = (block: ContentBlock, isPartial: boolean = false) => {
                if (block.isTitle) return;

                const blockType = block.type;
                const existingData = (currentPageData as any)[blockType];

                if (Array.isArray(resumeData[blockType])) {
                    if (!existingData) (currentPageData as any)[blockType] = [];
                    const itemExists = (currentPageData as any)[blockType].some((i: any) => i.id === block.data.id);
                    if (!itemExists) {
                        if (isPartial) {
                            (currentPageData as any)[blockType].push({ ...block.data, description: '' });
                        } else {
                            (currentPageData as any)[blockType].push(block.data);
                        }
                    }
                } else {
                    (currentPageData as any)[blockType] = block.data;
                }
            };
            
            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];
                const blockTotalHeight = block.height + block.marginTop;
                
                if (block.isTitle) {
                    const nextBlock = blocks[i + 1];
                    if (nextBlock && nextBlock.type === block.type && !nextBlock.isTitle) {
                        const spaceForTitleAndNextItem = blockTotalHeight + nextBlock.marginTop + MIN_SPLIT_HEIGHT;
                        if (currentHeight + spaceForTitleAndNextItem > CONTENT_HEIGHT_LIMIT) {
                            startNewPage();
                        }
                    }
                }
                
                if (currentHeight + blockTotalHeight <= CONTENT_HEIGHT_LIMIT) {
                    addDataToPage(block);
                    currentHeight += blockTotalHeight;
                } else {
                    const remainingSpace = CONTENT_HEIGHT_LIMIT - currentHeight;
                    const spaceForBlockContent = remainingSpace - block.marginTop;

                    if (block.isSplittable && spaceForBlockContent >= MIN_SPLIT_HEIGHT) {
                        addDataToPage(block, true);
                        if (!currentPageData.continuation) currentPageData.continuation = {};
                        currentPageData.continuation[block.id] = { offset: 0, totalHeight: spaceForBlockContent };
                        
                        startNewPage();
                        
                        addDataToPage(block);
                        if (!currentPageData.continuation) currentPageData.continuation = {};
                        currentPageData.continuation[block.id] = { offset: spaceForBlockContent, totalHeight: block.height };
                        
                        const newPageHeight = block.height - spaceForBlockContent;
                        currentHeight += newPageHeight;

                    } else {
                        startNewPage();
                        addDataToPage(block);
                        currentHeight += blockTotalHeight;
                    }
                }
            }

            if (Object.keys(currentPageData).length > 1 && Object.values(currentPageData).some(v => v !== undefined && v !== null && (!Array.isArray(v) || v.length > 0))) {
                if(JSON.stringify(currentPageData) !== JSON.stringify(pages[pages.length-1])) {
                   pages.push(currentPageData);
                }
            }
            
            setPaginatedData(pages.filter(p => Object.keys(p).some(k => k !== 'style' && k !== 'continuation')));

        }, 100);
    }, [resumeData, isDemoMode]);

    const scalePreview = useCallback(() => {
        const previewColumn = previewWrapperRef.current?.parentElement;
        const previewElement = previewRef.current?.getElement();
        
        if (!previewColumn || !previewElement) return;

        const columnWidth = previewColumn.offsetWidth;
        const baseWidth = 794;
        const baseHeight = 1123;
        
        const scale = columnWidth / baseWidth;
        
        previewElement.style.transform = `scale(${scale})`;
        
        if (previewWrapperRef.current) {
          previewWrapperRef.current.style.height = `${baseHeight * scale}px`;
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            paginateResume();
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [resumeData, paginateResume]);


    useEffect(() => {
        scalePreview();
        window.addEventListener('resize', scalePreview);
        return () => window.removeEventListener('resize', scalePreview);
    }, [scalePreview, paginatedData]);
    
    useEffect(() => {
        const scrollers = document.querySelectorAll(".scroller");

        const addAnimation = () => {
            scrollers.forEach((scroller) => {
                scroller.setAttribute("data-animated", "true");
                const scrollerInner = scroller.querySelector(".scroller__inner");
                if (scrollerInner) {
                    const scrollerContent = Array.from(scrollerInner.children);
                    scrollerContent.forEach((item) => {
                        const duplicatedItem = item.cloneNode(true) as HTMLElement;
                        duplicatedItem.setAttribute("aria-hidden", "true");
                        scrollerInner.appendChild(duplicatedItem);
                    });
                }
            });
        }
        
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            addAnimation();
        }
    }, []);


    const exportToPdf = async () => {
        setIsPdfLoading(true);
        if (document.fonts) {
            await document.fonts.ready;
        }
        const { jsPDF } = (window as any).jspdf;
        const html2canvas = (window as any).html2canvas;
    
        if (!jsPDF || !html2canvas) {
            console.error("PDF generation dependencies not found.");
            setIsPdfLoading(false);
            return;
        }
    
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.zIndex = '-1';
        document.body.appendChild(tempContainer);
    
        try {
            const tempRoot = ReactDOM.createRoot(tempContainer);
    
            for (let i = 0; i < paginatedData.length; i++) {
                const pageData = paginatedData[i];
    
                await new Promise<void>(resolve => {
                    tempRoot.render(
                        <ResumePreview
                            data={pageData}
                            isDemoMode={false}
                            isFirstPage={i === 0}
                        />
                    );
                    setTimeout(resolve, 200); // Delay to ensure render
                });
    
                const resumeElement = tempContainer.querySelector('.resume-preview') as HTMLElement;
                if (!resumeElement) continue;
    
                const canvas = await html2canvas(resumeElement, { scale: 2, useCORS: true, logging: false });
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
    
                if (i > 0) {
                    pdf.addPage();
                }
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            }
    
            const fileName = `${resumeData.personalInfo.name.replace(/\s/g, '_') || 'curriculo'}.pdf`;
            pdf.save(fileName);
    
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
        } finally {
            document.body.removeChild(tempContainer);
            setIsPdfLoading(false);
        }
    };
    

    return (
        <>
        {deletionTarget && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                    <h3 className="text-lg font-semibold text-gray-800">Confirmar Exclusão</h3>
                    <p className="text-gray-600 mt-2">Tem a certeza que deseja remover este item? Esta ação não pode ser desfeita.</p>
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setDeletionTarget(null)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleConfirmDelete} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                            Remover
                        </button>
                    </div>
                </div>
            </div>
        )}
        <header className="fixed top-6 left-6 right-6 bg-blue-800/80 backdrop-blur-lg z-50 border border-white/10 rounded-full shadow-lg">
            <div className="px-6 py-3 flex justify-between items-center">
                <a href="https://velsites.com.br/" className="flex items-center">
                    <img src="https://i.postimg.cc/yNWrvPQJ/Subcabe-alho-76.png" alt="Vel Sites Logo" className="h-5 mr-3" />
                </a>
                <nav>
                    <a href="https://velsites.com.br/" className="text-white hover:text-blue-200 font-medium transition">Início</a>
                </nav>
            </div>
        </header>

        <main className="container mx-auto p-4 lg:p-8" style={{paddingTop: '9rem'}}>
            <section id="intro" className="text-center mb-16">
                <h1 className="text-4xl lg:text-5xl font-bold gradient-text">Destaque-se na multidão.</h1>
                <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">Cansado de templates genéricos? A nossa ferramenta gratuita cria currículos profissionais e modernos em minutos, com a ajuda de Inteligência Artificial, para que a sua primeira impressão seja inesquecível.</p>
                <a href="#form-wizard" className="mt-8 inline-block btn-primary text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300">Criar meu Currículo Grátis</a>
            </section>
            
            <section id="gerador" className="mb-16 scroll-mt-24">
                 <div className="my-8 flex justify-center">
                    <img src="https://files.catbox.moe/aid7gz.png" alt="Visualização dos modelos de currículo" className="max-w-full md:max-w-sm rounded-lg" />
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <ResumeForm data={resumeData} setData={setResumeData} isDemoMode={isDemoMode} onStartEditing={handleStartEditing} onExportPdf={exportToPdf} isPdfLoading={isPdfLoading} onRequestDelete={handleRequestDelete} />
                    <div className="w-full lg:w-2/3">
                        <div ref={previewWrapperRef} className="w-full">
                           {paginatedData.length > 0 && paginatedData[currentPage - 1] && (
                             <ResumePreview
                                ref={previewRef}
                                data={paginatedData[currentPage - 1]}
                                isDemoMode={isDemoMode}
                                isFirstPage={currentPage === 1}
                             />
                           )}
                        </div>
                        {paginatedData.length > 1 && (
                            <div className="pagination-controls">
                                {paginatedData.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentPage(index + 1)}
                                        className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
            
            <section id="como-funciona" className="text-center my-24">
                <h2 className="text-3xl font-bold text-gray-800">Simples, Rápido e Eficaz</h2>
                <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">Criar um currículo de destaque nunca foi tão fácil. Siga apenas 3 passos:</p>
                <div className="mt-12 grid md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full btn-primary text-white text-2xl font-bold mb-4">1</div>
                        <h3 className="text-xl font-semibold mb-2">Preencha</h3>
                        <p className="text-gray-600">Insira as suas informações nos campos guiados. A nossa IA pode ajudar a refinar os textos.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full btn-primary text-white text-2xl font-bold mb-4">2</div>
                        <h3 className="text-xl font-semibold mb-2">Personalize</h3>
                        <p className="text-gray-600">Escolha entre templates modernos e ajuste a cor para combinar com o seu estilo.</p>
                    </div>
                    <div className="flex flex-col items-center">
                         <div className="flex items-center justify-center w-16 h-16 rounded-full btn-primary text-white text-2xl font-bold mb-4">3</div>
                        <h3 className="text-xl font-semibold mb-2">Exporte</h3>
                        <p className="text-gray-600">Baixe o seu novo currículo em formato PDF, pronto para ser enviado.</p>
                    </div>
                </div>
            </section>

            <section id="avaliacoes" className="my-24">
                <h2 className="text-3xl font-bold text-center text-gray-800">Feito para quem precisa de resultados</h2>
                <p className="text-lg text-center text-gray-600 mt-2 mb-12">Veja o que os nossos usuários estão a dizer.</p>

                <div className="space-y-4">
                    <div className="scroller px-4 py-4">
                        <ul className="scroller__inner list-none p-0">
                            {TESTIMONIALS_1.map((item, index) => (
                                <li key={index} className="flex-shrink-0 w-80 bg-white p-6 rounded-lg shadow-lg">
                                    <p className="text-gray-700">{item.text}</p>
                                    <p className="font-semibold text-right mt-4 text-gray-800">{item.author}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="scroller px-4 py-4" data-direction="right">
                         <ul className="scroller__inner list-none p-0">
                            {TESTIMONIALS_2.map((item, index) => (
                                <li key={index} className="flex-shrink-0 w-80 bg-white p-6 rounded-lg shadow-lg">
                                    <p className="text-gray-700">{item.text}</p>
                                    <p className="font-semibold text-right mt-4 text-gray-800">{item.author}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
             <section id="final" className="text-center my-24 bg-white p-12 rounded-lg shadow-md">
                 <h2 className="text-3xl font-bold gradient-text">Pronto para dar o próximo passo na sua carreira?</h2>
                 <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">A sua jornada profissional merece um currículo à altura. Comece agora e crie um documento que abre portas.</p>
                 <a href="#form-wizard" className="mt-8 inline-block btn-primary text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300">Começar Agora</a>
            </section>
        </main>
        
        <footer className="bg-gray-900 text-white py-10 md:py-12">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0 text-center md:text-left">
                        <div className="mb-4 mx-auto md:mx-0" style={{width: 'fit-content'}}>
                            <img src="https://i.postimg.cc/D0pp6j3q/Subcabe-alho-39.png" alt="Vel Sites Logo Rodapé" className="footer-logo" />
                        </div>
                        <p className="text-gray-400 max-w-md">A Vel nasceu pra quem não espera, pra quem resolve. Se você move o mundo com seu ofício, a gente move sua marca no digital.</p>
                    </div>
                    <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-12 text-center md:text-left">
                        <div>
                            <h4 className="font-bold text-lg mb-4">Contacto</h4>
                            <ul className="space-y-2">
                                <li className="text-gray-400">(37) 98416-9386</li>
                                <li className="text-gray-400">contato@velsites.com.br</li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold text-lg mb-4">Siga-nos</h4>
                            <div className="flex space-x-4 justify-center md:justify-start">
                                <a href="https://www.instagram.com/velsites.com.br/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center footer-social-icon"><svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353-.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zM12 15a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg></a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Vel Sites. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
        </>
    );
};

export default App;
