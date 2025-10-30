

import React, { useState, useRef, useEffect } from 'react';
import type { ResumeData, Experience, Education, Course, Language } from '../types';
import { enhanceText, suggestSkills } from '../services/geminiService';
import CharacterCounter from './CharacterCounter';

interface ResumeFormProps {
  data: ResumeData;
  setData: React.Dispatch<React.SetStateAction<ResumeData>>;
  isDemoMode: boolean;
  onStartEditing: () => void;
  onExportPdf: () => void;
  isPdfLoading: boolean;
  onRequestDelete: (target: { id: string, type: 'experience' | 'education' | 'course' | 'language' }) => void;
}

const WIZARD_STEPS = [
  "Estilo e Design",
  "Informações Pessoais",
  "Resumo Profissional",
  "Experiência Profissional",
  "Formação Acadêmica",
  "Cursos Complementares",
  "Idiomas",
  "Habilidades",
];

const SKILL_SUGGESTIONS = [
    "Pacote Office", "Excel Avançado", "Comunicação Efetiva", "Trabalho em Equipa",
    "Liderança", "Proatividade", "Organização", "Atendimento ao Cliente", "Gestão de Tempo"
];

const EDUCATION_SHORTCUTS = [
    "Ensino Médio Completo", "Ensino Médio Incompleto", "Ensino Fundamental"
];

const MARITAL_STATUS_OPTIONS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)'];
const CNH_OPTIONS = ['Não possuo', 'A', 'B', 'A+B', 'C', 'D', 'E'];
const PROFICIENCY_LEVELS: Language['proficiency'][] = ['Básico', 'Intermediário', 'Avançado', 'Fluente'];

const CHAR_LIMITS = {
  personalInfo: {
    name: 70,
    jobTitle: 70,
    email: 100,
    address: 100,
  },
  summary: 1000,
  experience: {
    jobTitle: 70,
    company: 50,
    location: 50,
    date: 20,
    description: 1500,
  },
  education: {
    degree: 100,
    institution: 70,
  },
  course: {
    name: 100,
    institution: 70,
  },
  language: {
    language: 30,
  },
  skills: 500,
};

const formatPhoneNumber = (value: string) => {
    let v = value.replace(/\D/g, '').substring(0, 11);
    if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, '($1) $2 $3-$4');
    } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,4})$/, '($1) $2');
    } else if (v.length > 0) {
        v = v.replace(/^(\d{0,2})$/, '($1');
    }
    return v;
};

const capitalizeName = (value: string): string => {
  if (!value) return '';
  return value
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const ResumeForm: React.FC<ResumeFormProps> = ({ data, setData, isDemoMode, onStartEditing, onExportPdf, isPdfLoading, onRequestDelete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [openAccordion, setOpenAccordion] = useState<{ experience: string | null; education: string | null; course: string | null; language: string | null; }>({ experience: null, education: null, course: null, language: null });
  const [aiSkillSuggestions, setAiSkillSuggestions] = useState<string[]>([]);
  
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const activeStepNode = stepRefs.current[currentStep];
    if (activeStepNode && stepsContainerRef.current) {
      stepsContainerRef.current.style.height = `${activeStepNode.scrollHeight}px`;
    }
  }, [currentStep, data.experiences, data.education, data.courses, data.languages, openAccordion, aiSkillSuggestions, isFinished]);


  const handleNext = () => {
    if (isDemoMode && currentStep === 0) {
      onStartEditing();
      setCurrentStep(currentStep + 1);
      return;
    }
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if(isFinished) {
      setIsFinished(false);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDataChange = <T extends keyof ResumeData>(section: T, value: ResumeData[T]) => {
    setData(prev => ({ ...prev, [section]: value }));
  };

  const handlePersonalInfoChange = (field: keyof ResumeData['personalInfo'], value: string) => {
    handleDataChange('personalInfo', { ...data.personalInfo, [field]: value });
  };
  
  const handleStyleChange = (field: keyof ResumeData['style'], value: any) => {
    handleDataChange('style', { ...data.style, [field]: value });
  };
  
  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handlePersonalInfoChange('profilePicture', event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePic = () => {
    handlePersonalInfoChange('profilePicture', '');
  };

  const addExperience = () => {
    const newId = Date.now().toString();
    const newExp: Experience = { id: newId, jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' };
    handleDataChange('experiences', [...data.experiences, newExp]);
    setOpenAccordion(prev => ({...prev, experience: newId}));
  };
  
  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    handleDataChange('experiences', data.experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };
  
  const addEducation = () => {
    const newId = Date.now().toString();
    const newEdu: Education = { id: newId, degree: '', institution: '', startDate: '', endDate: '' };
    handleDataChange('education', [...data.education, newEdu]);
    setOpenAccordion(prev => ({...prev, education: newId}));
  };
  
  const updateEducation = (id: string, field: keyof Education, value: string) => {
    handleDataChange('education', data.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  };

  const addCourse = () => {
    const newId = Date.now().toString();
    const newCourse: Course = { id: newId, name: '', institution: '', completionDate: '' };
    handleDataChange('courses', [...data.courses, newCourse]);
    setOpenAccordion(prev => ({...prev, course: newId}));
  };

  const updateCourse = (id: string, field: keyof Course, value: string) => {
    handleDataChange('courses', data.courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addLanguage = () => {
    const newId = Date.now().toString();
    const newLang: Language = { id: newId, language: '', proficiency: '' };
    handleDataChange('languages', [...data.languages, newLang]);
    setOpenAccordion(prev => ({...prev, language: newId}));
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    handleDataChange('languages', data.languages.map(l => l.id === id ? { ...l, [field]: value } : l));
  };
  
  const handleEducationShortcut = (degree: string) => {
     const newId = Date.now().toString();
     const newEdu: Education = { id: newId, degree, institution: '', startDate: '', endDate: '' };
     handleDataChange('education', [newEdu]);
     setOpenAccordion(prev => ({...prev, education: newId}));
  };

  const handleAccordionToggle = (type: 'experience' | 'education' | 'course' | 'language', id: string) => {
    setOpenAccordion(prev => ({
        ...prev,
        [type]: prev[type] === id ? null : id
    }));
  };

  const handleAddSkill = (skill: string) => {
    if (!data.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())) {
        handleDataChange('skills', [...data.skills, skill]);
    }
  };

  const handleSkillsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    handleDataChange('skills', skillsArray);
  };
  
  const handleEnhanceSummary = async () => {
    if (!data.summary.trim()) return;
    setAiLoading({ ...aiLoading, summary: true });
    try {
      const prompt = `Reescreva o seguinte resumo profissional para ser mais conciso e impactante, destacando as principais qualidades: "${data.summary}"`;
      const enhanced = await enhanceText(prompt);
      setData(prev => ({...prev, summary: enhanced }));
    } catch(e) {
      alert("Erro ao aprimorar texto. Verifique o console para mais detalhes.");
    } finally {
      setAiLoading({ ...aiLoading, summary: false });
    }
  };

  const handleEnhanceExperience = async (exp: Experience) => {
    if (!exp.description.trim()) return;
    setAiLoading({ ...aiLoading, [exp.id]: true });
    try {
      const prompt = `Considerando o cargo de "${exp.jobTitle}", reescreva a seguinte descrição de experiência profissional usando verbos de ação e focando em conquistas, de forma profissional e sucinta: "${exp.description}"`;
      const enhanced = await enhanceText(prompt);
      updateExperience(exp.id, 'description', enhanced);
    } catch(e) {
      alert("Erro ao aprimorar texto. Verifique o console para mais detalhes.");
    } finally {
      setAiLoading({ ...aiLoading, [exp.id]: false });
    }
  };

  const handleSuggestSkills = async () => {
    if (!data.personalInfo.jobTitle.trim()) {
        alert("Por favor, preencha o seu 'Cargo Desejado' primeiro para receber sugestões de habilidades relevantes.");
        return;
    }
    setAiLoading(prev => ({ ...prev, skills: true }));
    setAiSkillSuggestions([]);
    try {
        const combinedExperience = data.experiences.map(exp => `${exp.jobTitle}: ${exp.description}`).join('\n');
        const suggestions = await suggestSkills(data.personalInfo.jobTitle, combinedExperience);
        const newSuggestions = suggestions.filter(s => 
            !data.skills.map(ds => ds.toLowerCase()).includes(s.toLowerCase()) && 
            !SKILL_SUGGESTIONS.map(ss => ss.toLowerCase()).includes(s.toLowerCase())
        );
        setAiSkillSuggestions(newSuggestions);
    } catch (e) {
        alert("Erro ao sugerir habilidades. Verifique o console para mais detalhes.");
    } finally {
        setAiLoading(prev => ({ ...prev, skills: false }));
    }
  };

  const renderStepContent = () => {
    return WIZARD_STEPS.map((_, index) => {
        let content;
        switch (index) {
          case 0:
            content = (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o Template</label>
                  <div id="template-selector" className="flex flex-col gap-3">
                    <div onClick={() => handleStyleChange('template', 'template-modern')} className={`template-option cursor-pointer border-2 rounded-lg p-2 flex items-center gap-4 ${data.style.template === 'template-modern' ? 'border-blue-600' : 'border-gray-300'}`}>
                        <svg viewBox="0 0 100 140" className="w-16 h-auto rounded-md pointer-events-none bg-gray-100 p-1 border"><rect x="10" y="10" width="25" height="120" rx="3" fill="#cbd5e1"></rect><rect x="45" y="10" width="45" height="15" rx="3" fill="#cbd5e1"></rect><rect x="45" y="35" width="45" height="5" rx="2" fill="#e2e8f0"></rect><rect x="45" y="45" width="35" height="5" rx="2" fill="#e2e8f0"></rect><rect x="45" y="65" width="45" height="8" rx="3" fill="#cbd5e1"></rect><rect x="45" y="80" width="40" height="5" rx="2" fill="#e2e8f0"></rect></svg>
                        <span className="font-semibold text-sm text-gray-800">Moderno</span>
                    </div>
                    <div onClick={() => handleStyleChange('template', 'template-classic')} className={`template-option cursor-pointer border-2 rounded-lg p-2 flex items-center gap-4 ${data.style.template === 'template-classic' ? 'border-blue-600' : 'border-gray-300'}`}>
                        <svg viewBox="0 0 100 140" className="w-16 h-auto rounded-md pointer-events-none bg-gray-100 p-1 border"><rect x="10" y="10" width="80" height="15" rx="3" fill="#cbd5e1"></rect><rect x="10" y="35" width="80" height="5" rx="2" fill="#e2e8f0"></rect><rect x="10" y="45" width="60" height="5" rx="2" fill="#e2e8f0"></rect><rect x="10" y="65" width="80" height="8" rx="3" fill="#cbd5e1"></rect><rect x="10" y="80" width="70" height="5" rx="2" fill="#e2e8f0"></rect><rect x="10" y="90" width="80" height="5" rx="2" fill="#e2e8f0"></rect><rect x="10" y="100" width="50" height="5" rx="2" fill="#e2e8f0"></rect></svg>
                        <span className="font-semibold text-sm text-gray-800">Clássico</span>
                    </div>
                     <div onClick={() => handleStyleChange('template', 'template-minimalist')} className={`template-option cursor-pointer border-2 rounded-lg p-2 flex items-center gap-4 ${data.style.template === 'template-minimalist' ? 'border-blue-600' : 'border-gray-300'}`}>
                        <svg viewBox="0 0 100 140" className="w-16 h-auto rounded-md pointer-events-none bg-gray-100 p-1 border"><rect x="10" y="10" width="80" height="10" rx="3" fill="#cbd5e1"></rect><rect x="10" y="30" width="40" height="5" rx="2" fill="#e2e8f0"></rect><line x1="10" y1="50" x2="90" y2="50" stroke="#e2e8f0" strokeWidth="2"></line><rect x="10" y="65" width="80" height="8" rx="3" fill="#cbd5e1"></rect><rect x="10" y="80" width="70" height="5" rx="2" fill="#e2e8f0"></rect></svg>
                        <span className="font-semibold text-sm text-gray-800">Minimalista</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Escolha uma Cor de Destaque</label>
                  <div id="color-palette" className="flex gap-3">
                    {['#002e9e', '#0078e8', '#374151', '#065f46'].map(color => (
                        <div key={color}
                             onClick={() => handleStyleChange('color', color)}
                             className={`color-option w-8 h-8 rounded-full cursor-pointer border-4 ${data.style.color === color ? 'border-blue-600' : 'border-white'}`}
                             style={{ backgroundColor: color }}
                             data-color={color}></div>
                    ))}
                  </div>
                </div>
              </>
            );
            break;
          case 1:
            content = (
              <div className="space-y-4">
                <input type="text" placeholder="Nome Completo" className="w-full p-2 border rounded-md bg-white border-gray-300 text-gray-900" 
                    value={data.personalInfo.name} 
                    onChange={e => handlePersonalInfoChange('name', capitalizeName(e.target.value))}
                    maxLength={CHAR_LIMITS.personalInfo.name} />
                <input type="text" placeholder="Cargo Desejado" className="w-full p-2 border rounded-md bg-white border-gray-300 text-gray-900" 
                    value={data.personalInfo.jobTitle} 
                    onChange={e => handlePersonalInfoChange('jobTitle', e.target.value)}
                    maxLength={CHAR_LIMITS.personalInfo.jobTitle} />
                <input type="email" placeholder="E-mail" className="w-full p-2 border rounded-md bg-white border-gray-300 text-gray-900" value={data.personalInfo.email} onChange={e => handlePersonalInfoChange('email', e.target.value)} maxLength={CHAR_LIMITS.personalInfo.email} />
                <input type="tel" placeholder="Telefone" className="w-full p-2 border rounded-md bg-white border-gray-300 text-gray-900" value={data.personalInfo.phone} onChange={e => handlePersonalInfoChange('phone', formatPhoneNumber(e.target.value))} maxLength={15} />
                <div className="flex items-center justify-between mt-2">
                    <label htmlFor="show-whatsapp-qr" className="text-sm font-medium text-gray-700 pl-1">Exibir QR Code</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="show-whatsapp-qr" className="sr-only peer" checked={data.style.showQRCode} onChange={e => handleStyleChange('showQRCode', e.target.checked)} />
                        <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-indigo-600 transition-colors duration-200"></div>
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5"></div>
                    </label>
                </div>
                <input type="text" placeholder="Endereço (Ex: Cidade, Estado)" className="w-full p-2 border rounded-md bg-white border-gray-300 text-gray-900" value={data.personalInfo.address} onChange={e => handlePersonalInfoChange('address', e.target.value)} maxLength={CHAR_LIMITS.personalInfo.address} />
                <input type="tel" placeholder="Idade" className="w-full p-2 border rounded-md bg-white border-gray-300 text-gray-900" value={data.personalInfo.age} onChange={e => handlePersonalInfoChange('age', e.target.value.replace(/\D/g, '').substring(0, 2))} maxLength={2} />
                <select className="w-full p-2 border rounded-md bg-white border-gray-300 text-gray-900" value={data.personalInfo.maritalStatus} onChange={e => handlePersonalInfoChange('maritalStatus', e.target.value)}>
                  <option value="">Estado Civil</option>
                  {MARITAL_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select className="w-full p-2 border rounded-md bg-white border-gray-300 text-gray-900" value={data.personalInfo.cnh} onChange={e => handlePersonalInfoChange('cnh', e.target.value)}>
                  <option value="">CNH</option>
                  {CNH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="mt-4">
                    {!data.personalInfo.profilePicture ? (
                        <label htmlFor="profile-pic-upload" className="inline-flex items-center justify-center gap-2 w-full bg-indigo-100 text-indigo-700 font-medium py-2 px-4 rounded-lg cursor-pointer hover:bg-indigo-200 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            Carregar Foto
                        </label>
                    ) : (
                        <div className="flex gap-3">
                            <label htmlFor="profile-pic-upload" className="flex-1 inline-flex items-center justify-center gap-2 w-full bg-indigo-100 text-indigo-700 font-medium py-2 px-4 rounded-lg cursor-pointer hover:bg-indigo-200 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-repeat"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
                                Alterar
                            </label>
                            <button type="button" onClick={handleRemoveProfilePic} className="flex-1 inline-flex items-center justify-center gap-2 w-full bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg cursor-pointer hover:bg-red-200 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                Remover
                            </button>
                        </div>
                    )}
                    <input type="file" id="profile-pic-upload" accept="image/png, image/jpeg" onChange={handleProfilePicUpload} style={{ display: 'none' }} />
                    <p className="text-xs text-gray-500 mt-1 text-center">PNG ou JPG (Recomendado: 1:1)</p>
                </div>
              </div>
            );
            break;
          case 2:
            content = (
              <>
                <textarea placeholder="Fale sobre sua carreira, objetivos e qualificações..." className="w-full p-2 border rounded-md h-32 bg-white border-gray-300 text-gray-900" 
                    value={data.summary} 
                    onChange={e => setData(prev => ({...prev, summary: e.target.value}))}
                    maxLength={CHAR_LIMITS.summary}></textarea>
                <CharacterCounter current={data.summary.length} max={CHAR_LIMITS.summary} />

                <button type="button" onClick={handleEnhanceSummary} disabled={aiLoading.summary} className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                    {aiLoading.summary ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>}
                    {aiLoading.summary ? 'Escrevendo...' : 'Escrever com IA'}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">Escreva um pouco sobre você no campo acima e clique no botão para aprimorar o texto.</p>
              </>
            );
            break;
          case 3:
            content = (
                <>
                    <div id="experience-list" className="space-y-4">
                        {data.experiences.map(exp => {
                            const isOpen = openAccordion.experience === exp.id;
                            return (
                                <div key={exp.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                    <div className="p-4 flex justify-between items-center cursor-pointer bg-gray-50" onClick={() => handleAccordionToggle('experience', exp.id)}>
                                        <h4 className="font-semibold text-gray-800">{exp.jobTitle || 'Nova Experiência'}</h4>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); onRequestDelete({ id: exp.id, type: 'experience' }); }} className="text-gray-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
                                            <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                    {isOpen && (
                                        <div className="p-4 border-t border-gray-200 space-y-3">
                                            <input type="text" placeholder="Cargo" className="w-full p-2 border rounded-lg bg-white border-gray-300 text-gray-900" value={exp.jobTitle} onChange={e => updateExperience(exp.id, 'jobTitle', e.target.value)} maxLength={CHAR_LIMITS.experience.jobTitle} />
                                            <input type="text" placeholder="Empresa" className="w-full p-2 border rounded-lg bg-white border-gray-300 text-gray-900" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} maxLength={CHAR_LIMITS.experience.company} />
                                            <input type="text" placeholder="Local (Ex: São Paulo, SP)" className="w-full p-2 border rounded-lg bg-white border-gray-300 text-gray-900" value={exp.location} onChange={e => updateExperience(exp.id, 'location', e.target.value)} maxLength={CHAR_LIMITS.experience.location}/>
                                            <div className="flex gap-3">
                                                <input type="text" placeholder="Início (Ex: Jan 2020)" className="w-1/2 p-2 border rounded-lg bg-white border-gray-300 text-gray-900" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} maxLength={CHAR_LIMITS.experience.date} />
                                                <input type="text" placeholder="Fim (Ex: Atual)" className="w-1/2 p-2 border rounded-lg bg-white border-gray-300 text-gray-900" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} maxLength={CHAR_LIMITS.experience.date} />
                                            </div>
                                            <div>
                                                <textarea placeholder="Principais responsabilidades e conquistas..." className="w-full p-2 border rounded-lg h-24 bg-white border-gray-300 text-gray-900" 
                                                    value={exp.description} 
                                                    onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                                                    maxLength={CHAR_LIMITS.experience.description}></textarea>
                                                <CharacterCounter current={exp.description.length} max={CHAR_LIMITS.experience.description} />
                                            </div>
                                            <button type="button" onClick={() => handleEnhanceExperience(exp)} disabled={aiLoading[exp.id]} className="mt-2 w-full flex items-center justify-center gap-2 bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-full hover:bg-indigo-200 transition-colors text-sm disabled:bg-indigo-50">
                                                {aiLoading[exp.id] ? '...' : 'Escrever com IA'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <button type="button" onClick={addExperience} className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-full transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        Adicionar mais
                    </button>
                </>
            );
            break;
          case 4:
            content = (
                <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preenchimento Rápido</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {EDUCATION_SHORTCUTS.map(degree => (
                            <button key={degree} type="button" onClick={() => handleEducationShortcut(degree)}
                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all bg-indigo-100 text-indigo-700 hover:bg-indigo-200`}>
                                {degree}
                            </button>
                        ))}
                    </div>
                    <div id="education-list" className="space-y-4">
                        {data.education.map(edu => {
                            const isOpen = openAccordion.education === edu.id;
                            return (
                                <div key={edu.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                    <div className="p-4 flex justify-between items-center cursor-pointer bg-gray-50" onClick={() => handleAccordionToggle('education', edu.id)}>
                                        <h4 className="font-semibold text-gray-800">{edu.degree || 'Nova Formação'}</h4>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); onRequestDelete({ id: edu.id, type: 'education' }); }} className="text-gray-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
                                            <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                    {isOpen && (
                                        <div className="p-4 border-t border-gray-200 space-y-3">
                                            <input type="text" placeholder="Curso/Formação" className="w-full p-2 border rounded-lg bg-white border-gray-300 text-gray-900" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} maxLength={CHAR_LIMITS.education.degree} />
                                            <input type="text" placeholder="Instituição de Ensino" className="w-full p-2 border rounded-lg bg-white border-gray-300 text-gray-900" value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} maxLength={CHAR_LIMITS.education.institution} />
                                            <div className="flex gap-3">
                                                <input type="tel" placeholder="Início (Ex: 2016)" className="w-1/2 p-2 border rounded-lg bg-white border-gray-300 text-gray-900" value={edu.startDate} onChange={e => updateEducation(edu.id, 'startDate', e.target.value.replace(/\D/g, '').substring(0, 4))} maxLength={4} />
                                                <input type="tel" placeholder="Fim (Ex: 2020)" className="w-1/2 p-2 border rounded-lg bg-white border-gray-300 text-gray-900" value={edu.endDate} onChange={e => updateEducation(edu.id, 'endDate', e.target.value.replace(/\D/g, '').substring(0, 4))} maxLength={4} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                     <button type="button" onClick={addEducation} className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-full transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        Adicionar mais
                    </button>
                </>
            );
            break;
          case 5:
            content = (
                <>
                    <div id="course-list" className="space-y-4">
                        {data.courses.map(course => {
                            const isOpen = openAccordion.course === course.id;
                            return (
                                <div key={course.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                    <div className="p-4 flex justify-between items-center cursor-pointer bg-gray-50" onClick={() => handleAccordionToggle('course', course.id)}>
                                        <h4 className="font-semibold text-gray-800">{course.name || 'Novo Curso'}</h4>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); onRequestDelete({ id: course.id, type: 'course' }); }} className="text-gray-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
                                            <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                    {isOpen && (
                                        <div className="p-4 border-t border-gray-200 space-y-3">
                                            <input type="text" placeholder="Nome do Curso" className="w-full p-2 border rounded-lg bg-white border-gray-300 text-gray-900" value={course.name} onChange={e => updateCourse(course.id, 'name', e.target.value)} maxLength={CHAR_LIMITS.course.name} />
                                            <input type="text" placeholder="Instituição" className="w-full p-2 border rounded-lg bg-white border-gray-300 text-gray-900" value={course.institution} onChange={e => updateCourse(course.id, 'institution', e.target.value)} maxLength={CHAR_LIMITS.course.institution} />
                                            <input type="tel" placeholder="Conclusão (Ex: 2023)" className="w-full p-2 border rounded-lg bg-white border-gray-300 text-gray-900" value={course.completionDate} onChange={e => updateCourse(course.id, 'completionDate', e.target.value.replace(/\D/g, '').substring(0, 4))} maxLength={4} />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                     <button type="button" onClick={addCourse} className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-full transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        Adicionar mais
                    </button>
                </>
            );
            break;
          case 6:
            content = (
                <>
                    <div id="language-list" className="space-y-4">
                        {data.languages.map(lang => {
                            const isOpen = openAccordion.language === lang.id;
                            return (
                                <div key={lang.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                    <div className="p-4 flex justify-between items-center cursor-pointer bg-gray-50" onClick={() => handleAccordionToggle('language', lang.id)}>
                                        <h4 className="font-semibold text-gray-800">{lang.language || 'Novo Idioma'}</h4>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); onRequestDelete({ id: lang.id, type: 'language' }); }} className="text-gray-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
                                            <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                    {isOpen && (
                                        <div className="p-4 border-t border-gray-200 space-y-3">
                                            <input type="text" placeholder="Idioma (Ex: Inglês)" className="w-full p-2 border rounded-lg bg-white border-gray-300 text-gray-900" value={lang.language} onChange={e => updateLanguage(lang.id, 'language', e.target.value)} maxLength={CHAR_LIMITS.language.language} />
                                            <select className="w-full p-2 border rounded-lg bg-white border-gray-300 text-gray-900" value={lang.proficiency} onChange={e => updateLanguage(lang.id, 'proficiency', e.target.value)}>
                                                <option value="">Nível de Proficiência</option>
                                                {PROFICIENCY_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                     <button type="button" onClick={addLanguage} className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-full transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        Adicionar mais
                    </button>
                </>
            );
            break;
          case 7:
            content = (
                <>
                    <input type="text" placeholder="Ex: HTML, CSS, Liderança" className="w-full p-2 border rounded-md bg-white border-gray-300 text-gray-900"
                        value={data.skills.join(', ')}
                        onChange={handleSkillsInputChange} 
                        maxLength={CHAR_LIMITS.skills}
                        />
                    <p className="text-xs text-gray-500 mt-1">Separe as habilidades por vírgula.</p>
                    
                    <div className="mt-4 mb-2">
                      <label className="block text-sm font-medium text-gray-700">Sugestões:</label>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {SKILL_SUGGESTIONS.map(skill => (
                            <button key={skill} type="button"
                                onClick={() => handleAddSkill(skill)}
                                disabled={data.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())}
                                className="py-1 px-3 rounded-full text-xs font-medium transition-all bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                {skill}
                            </button>
                        ))}
                    </div>

                    {aiSkillSuggestions.length > 0 && (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Sugestões da IA (clique para adicionar):</label>
                        <div className="flex flex-wrap gap-2">
                            {aiSkillSuggestions.map(skill => (
                                <button key={skill} type="button"
                                    onClick={() => handleAddSkill(skill)}
                                    disabled={data.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())}
                                    className="py-1 px-3 rounded-full text-xs font-medium transition-all bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {skill}
                                </button>
                            ))}
                        </div>
                      </>
                    )}

                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                        {aiSkillSuggestions.length > 0 && (
                            <button 
                                type="button" 
                                onClick={handleSuggestSkills} 
                                disabled={aiLoading.skills || !data.personalInfo.jobTitle}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm"
                                title={!data.personalInfo.jobTitle ? "Preencha o seu Cargo Desejado primeiro" : "Buscar novas sugestões"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                                Atualizar
                            </button>
                        )}
                        <button 
                            type="button" 
                            onClick={handleSuggestSkills} 
                            disabled={aiLoading.skills || !data.personalInfo.jobTitle}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                            title={!data.personalInfo.jobTitle ? "Preencha o seu Cargo Desejado primeiro" : "Sugerir habilidades com Inteligência Artificial"}
                        >
                            {aiLoading.skills ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                            )}
                            {aiSkillSuggestions.length > 0 ? 'Sugerir Mais' : 'Sugerir com IA'}
                        </button>
                    </div>
                </>
            );
            break;
          default:
            content = null;
        }
        {/* FIX: The ref callback for a DOM element should not return a value. Wrapped the assignment in braces to ensure an implicit `undefined` return. */}
        return <div key={index} ref={el => { stepRefs.current[index] = el }} className={`wizard-step p-4 ${currentStep === index ? 'step-active' : ''}`}>{content}</div>
    });
  };

  return (
    <div id="form-wizard" style={{scrollMarginTop: '9rem'}} className="w-full lg:w-1/3 bg-white p-6 rounded-lg shadow-md form-container">
      {!isFinished && (
        <div id="wizard-header" className="mb-4 text-center">
          <p id="wizard-step-info" className="text-sm font-medium text-gray-500 mb-1">
            Passo {currentStep + 1} de {WIZARD_STEPS.length}
          </p>
          <h3 id="wizard-step-title" className="gradient-text text-xl font-bold">
            {WIZARD_STEPS[currentStep]}
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div id="wizard-progress-bar" className="btn-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / WIZARD_STEPS.length) * 100}%` }}></div>
          </div>
        </div>
      )}

      <div id="wizard-steps-container" ref={stepsContainerRef} className="flex-grow">
          {isFinished ? (
                <div className="text-center p-8 flex-grow flex flex-col justify-center items-center">
                  <svg className="w-24 h-24 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <h3 className="text-2xl font-bold text-gray-800 mt-6">Seu currículo está pronto!</h3>
                  <p className="text-gray-600 mt-2">Pode agora baixar o seu PDF ou voltar para fazer mais edições.</p>
              </div>
          ) : (
              renderStepContent()
          )}
      </div>


      <div id="wizard-nav" className="mt-auto flex justify-between gap-4 p-6">
        <button type="button" onClick={handlePrev} disabled={currentStep === 0 && !isFinished} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          {isFinished ? 'Voltar' : 'Anterior'}
        </button>
        {isFinished ? (
             <button type="button" onClick={onExportPdf} disabled={isPdfLoading} className="btn-primary text-white font-semibold py-2 px-4 rounded-full transition-all flex-grow flex items-center justify-center gap-2">
                {isPdfLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                )}
                {isPdfLoading ? 'Gerando...' : 'Baixar PDF'}
            </button>
        ) : (
            <button type="button" onClick={handleNext} className="btn-primary text-white font-semibold py-2 px-4 rounded-full transition-all flex-grow">
              {(isDemoMode && currentStep === 0) ? 'Começar' : (currentStep === WIZARD_STEPS.length - 1 ? 'Concluir' : 'Próximo')}
            </button>
        )}
      </div>
    </div>
  );
};

export default ResumeForm;