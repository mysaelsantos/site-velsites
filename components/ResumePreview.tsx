import React, { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import type { ResumeData } from '../types';
import QRCodeComponent from './QRCode';

interface PageData extends Partial<ResumeData> {
    continuation?: {
        [itemId: string]: {
            offset: number;
            totalHeight: number;
        };
    };
}

interface ResumePreviewProps {
  data: PageData;
  isDemoMode: boolean;
  isFirstPage: boolean;
  isMeasurement?: boolean;
}

export interface ResumePreviewRef {
  getElement: () => HTMLDivElement | null;
}

const ResumePreview = forwardRef<ResumePreviewRef, ResumePreviewProps>(({ data, isDemoMode, isFirstPage, isMeasurement }, ref) => {
  const { personalInfo, summary, experiences, education, courses, languages, skills, style, continuation } = data;
  const previewRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getElement: () => previewRef.current,
  }));

  useEffect(() => {
    if (style?.color) {
        document.documentElement.style.setProperty('--theme-color', style.color);
    }
  }, [style?.color]);

  const renderWithContinuation = (itemId: string, content: React.ReactNode, isSection: boolean = false) => {
    const continuationInfo = continuation?.[itemId];
    if (continuationInfo) {
      const height = continuationInfo.totalHeight - continuationInfo.offset;
      return (
        <div style={{ height: `${height}px`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: '100%', top: `-${continuationInfo.offset}px` }}>
            {content}
          </div>
        </div>
      );
    }
    return content;
  };
  
  const skillsContent = skills && skills.length > 0 ? (
      skills.map((skill, index) => (
        <span key={index} className="inline-block h-5 leading-5 bg-gray-200 rounded-full px-2.5 text-xs font-semibold text-gray-700 mr-1.5 mb-1.5 align-top">
          {skill}
        </span>
      ))
  ) : isDemoMode ? null : <p className="text-gray-400 italic text-sm">Suas habilidades aparecerão aqui...</p>;

  return (
    <div id="resume-preview" ref={previewRef} className={`resume-preview bg-white text-gray-900 ${style?.template} ${!isMeasurement ? 'resume-preview-paginated rounded-lg shadow-xl' : ''}`}>
      {isFirstPage && personalInfo && (
        <>
            <div id="profile-pic-container" className={personalInfo.profilePicture ? 'visible' : ''}>
                {personalInfo.profilePicture && <img id="profile-pic-img" src={personalInfo.profilePicture} alt="Foto de Perfil" />}
            </div>
            <header className={`pb-4 ${(style?.template === 'template-minimalist' || style?.template === 'template-modern') && personalInfo.profilePicture ? 'has-photo' : ''}`}>
                <div className="flex justify-between items-start">
                    <div className="pr-4" style={{ maxWidth: personalInfo.profilePicture ? 'calc(100% - 120px)' : '100%' }}>
                        <h1 id="resume-name" className="font-bold">{personalInfo.name || (isDemoMode ? '' : 'Seu Nome')}</h1>
                        <h2 id="resume-job-title" className="font-medium text-gray-600 mt-1">{personalInfo.jobTitle || (isDemoMode ? '' : 'Cargo Desejado')}</h2>
                    </div>
                </div>

                <div id="contact-info" className="mt-3">
                    {personalInfo.email && <a href={`mailto:${personalInfo.email}`} id="resume-email-container" className="text-gray-700 hover:text-blue-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span id="resume-email">{personalInfo.email}</span></a>}
                    {personalInfo.phone && <a href={`tel:${personalInfo.phone}`} id="resume-phone-container" className="text-gray-700 hover:text-blue-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span id="resume-phone">{personalInfo.phone}</span></a>}
                    {personalInfo.address && <div id="resume-address-container" className="text-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span id="resume-address">{personalInfo.address}</span></div>}
                    {personalInfo.age && <div id="resume-age-container" className="text-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg><span id="resume-age">{personalInfo.age} anos</span></div>}
                    {personalInfo.maritalStatus && <div id="resume-marital-status-container" className="text-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span id="resume-marital-status">{personalInfo.maritalStatus}</span></div>}
                    {personalInfo.cnh && personalInfo.cnh !== 'Não possuo' && <div id="resume-cnh-container" className="text-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L1 16v5c0 .6.4 1 1 1h3c.6 0 1-.4 1-1v-1h12v1c0 .6.4 1 1 1zM2 16l1.5-4.5h11L16 16H2zm13 1v-1H5v1h10zm-1-4h.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5H14v1z"/></svg><span id="resume-cnh">CNH: {personalInfo.cnh}</span></div>}
                </div>
            </header>
        </>
      )}
      <main className={`${isFirstPage ? 'mt-4' : 'pt-14'} space-y-4`}>
        {summary && (
            renderWithContinuation('summary',
                <section id="summary-section">
                    <h3 className="section-title">Resumo Profissional{(continuation?.summary && !isFirstPage) ? ' (continuação)' : ''}</h3>
                    <p id="resume-summary" className="text-gray-700 leading-relaxed">{summary || (isDemoMode ? '' : <span className="text-gray-400 italic">Seu resumo profissional aparecerá aqui...</span>)}</p>
                </section>,
                true
            )
        )}
        {(experiences && experiences.length > 0) && (
        <section id="experience-section">
            <h3 className="section-title">Experiência Profissional</h3>
            <div id="resume-experience-list" className="space-y-3">
                {experiences.map(exp => (
                    <div key={exp.id}>
                        {renderWithContinuation(exp.id, 
                            <>
                                <div className="flex justify-between items-baseline flex-wrap">
                                    <div className="pr-4">
                                        <h4 className="font-semibold">{exp.jobTitle || 'Cargo'}</h4>
                                        <p className="text-gray-700">{exp.company || 'Empresa'} {exp.location ? `• ${exp.location}` : ''}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 text-right whitespace-nowrap">{exp.startDate} {exp.startDate && exp.endDate ? ' - ' : ''} {exp.endDate}</p>
                                </div>
                                {exp.description && <p className="mt-1 text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description.replace(/\n/g, '<br />') }} />}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </section>
        )}
        {(education && education.length > 0) && (
        <section id="education-section">
            <h3 className="section-title">Formação Acadêmica</h3>
            <div id="resume-education-list" className="space-y-2">
            {education.map(edu => (
                <div key={edu.id}>
                    <div className="flex justify-between items-baseline flex-wrap">
                        <div className="pr-4">
                            <h4 className="font-semibold">{edu.degree || 'Curso/Formação'}</h4>
                            <p className="text-gray-700">{edu.institution || 'Instituição'}</p>
                        </div>
                        <p className="text-xs text-gray-500 text-right whitespace-nowrap">{edu.startDate} {edu.startDate && edu.endDate ? ' - ' : ''} {edu.endDate}</p>
                    </div>
                </div>
            ))}
            </div>
        </section>
        )}
        {(courses && courses.length > 0) && (
        <section id="courses-section">
            <h3 className="section-title">Cursos Complementares</h3>
            <div id="resume-courses-list" className="space-y-2">
            {courses.map(course => (
                <div key={course.id}>
                    <div className="flex justify-between items-baseline flex-wrap">
                        <div className="pr-4">
                            <h4 className="font-semibold">{course.name || 'Nome do Curso'}</h4>
                            <p className="text-gray-700">{course.institution || 'Instituição'}</p>
                        </div>
                        <p className="text-xs text-gray-500 text-right whitespace-nowrap">{course.completionDate}</p>
                    </div>
                </div>
            ))}
            </div>
        </section>
        )}
        {(languages && languages.length > 0) && (
        <section id="languages-section">
            <h3 className="section-title">Idiomas</h3>
            <div id="resume-languages-list" className="flex flex-wrap gap-x-4 gap-y-1">
            {languages.map(lang => (
                <div key={lang.id} className="flex items-baseline">
                    <h4 className="font-semibold">{lang.language || 'Idioma'}:&nbsp;</h4>
                    <p className="text-gray-700">{lang.proficiency || 'Nível'}</p>
                </div>
            ))}
            </div>
        </section>
        )}
        {(skills && skills.length > 0) && (
        <section id="skills-section">
            <h3 className="section-title">Habilidades</h3>
            <div id="resume-skills">
                {skillsContent}
            </div>
        </section>
        )}
      </main>
      {isFirstPage && personalInfo && style && <QRCodeComponent phone={personalInfo.phone} show={style.showQRCode} />}
    </div>
  );
});

export default ResumePreview;