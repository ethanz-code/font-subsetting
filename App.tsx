import React, { useState } from 'react';
import { Dropzone } from './components/Dropzone';
import { Editor } from './components/Editor';
import { Result } from './components/Result';
import { AppStep, FontMetadata, ProcessedResult, Language } from './types';
import { parseFontFile, loadFontFromUrl } from './services/fontService';
import { translations } from './i18n';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [font, setFont] = useState<FontMetadata | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('zh');
  
  // Loading state
  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const t = translations[lang];

  const handleFileSelect = async (file: File) => {
    try {
      setError(null);
      setLoadingMessage(t.status.reading);
      setLoadingProgress(0);
      
      const metadata = await parseFontFile(file, (percent) => {
        setLoadingProgress(percent);
        if (percent === 100) setLoadingMessage(t.status.parsing);
      });
      
      setFont(metadata);
      setStep(AppStep.EDITOR);
    } catch (err: any) {
      setError(err.message || "Failed to load font.");
    } finally {
      setLoadingProgress(null);
    }
  };

  const handleUrlSubmit = async (url: string) => {
    try {
      setError(null);
      setLoadingMessage(t.status.downloading);
      setLoadingProgress(0);

      const metadata = await loadFontFromUrl(url, (percent) => {
        setLoadingProgress(percent);
        if (percent === 100) setLoadingMessage(t.status.parsing);
      });

      setFont(metadata);
      setStep(AppStep.EDITOR);
    } catch (err: any) {
      setError(err.message || "Failed to load font from URL.");
    } finally {
      setLoadingProgress(null);
    }
  };

  const handleProcessComplete = (res: ProcessedResult) => {
    setResult(res);
    setStep(AppStep.RESULT);
  };

  const handleReset = () => {
    setFont(null);
    setResult(null);
    setStep(AppStep.UPLOAD);
  };

  const toggleLang = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const getStepClass = (targetStep: AppStep) => {
    const isActive = step === targetStep;
    const isCompleted = 
      (step === AppStep.EDITOR && targetStep === AppStep.UPLOAD) ||
      (step === AppStep.RESULT && targetStep !== AppStep.RESULT);

    let baseClass = "text-xs font-bold uppercase tracking-widest px-3 py-1 rounded transition-colors duration-300 ";
    
    if (isActive) {
      return baseClass + "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900";
    }
    if (isCompleted) {
      return baseClass + "text-neutral-400 dark:text-neutral-600 decoration-neutral-300 dark:decoration-neutral-700 line-through decoration-1 opacity-50";
    }
    return baseClass + "text-neutral-300 dark:text-neutral-600";
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      
      {/* Loading Overlay */}
      {loadingProgress !== null && (
        <div className="absolute inset-0 z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
          <div className="w-full max-w-sm text-center">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
              <span>{loadingMessage}</span>
              <span>{loadingProgress}%</span>
            </div>
            <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
               <div 
                 className="h-full bg-orange-600 transition-all duration-300 ease-out"
                 style={{ width: `${loadingProgress}%` }}
               ></div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full py-8 px-8 flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-40 transition-colors duration-300">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
          <div className="w-4 h-4 bg-orange-600"></div>
          <h1 className="text-xl font-bold tracking-tighter text-neutral-900 dark:text-white">{t.title}</h1>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Stepper Navigation */}
          <nav className="hidden md:flex gap-4 items-center">
             <span className={getStepClass(AppStep.UPLOAD)}>{t.importer}</span>
             <span className="text-neutral-200 dark:text-neutral-800">/</span>
             <span className={getStepClass(AppStep.EDITOR)}>{t.subsetter}</span>
             <span className="text-neutral-200 dark:text-neutral-800">/</span>
             <span className={getStepClass(AppStep.RESULT)}>{t.converter}</span>
          </nav>
          
          <button 
            onClick={toggleLang}
            className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100 hover:text-orange-600 dark:hover:text-orange-500 border border-neutral-200 dark:border-neutral-700 px-3 py-1 rounded hover:border-orange-200 transition-colors"
          >
            {lang === 'zh' ? 'English' : '中文'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 relative">
        
        {step === AppStep.UPLOAD && (
          <div className="w-full max-w-2xl animate-fade-in-up">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-light text-neutral-900 dark:text-white mb-6">{t.heroTitle}</h2>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                {t.heroDesc}
              </p>
            </div>
            
            <Dropzone 
              onFileSelect={handleFileSelect} 
              onUrlSubmit={handleUrlSubmit}
              lang={lang} 
              disabled={loadingProgress !== null}
            />
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm text-center">
                {t.errorTitle}: {error}
              </div>
            )}

            <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-8 text-neutral-400 dark:text-neutral-600 text-xs uppercase tracking-wider">
               <span>{t.localProcessing}</span>
               <span className="hidden md:inline">•</span>
               <span>{t.noServer}</span>
               <span className="hidden md:inline">•</span>
               <span>{t.instantExport}</span>
            </div>
          </div>
        )}

        {step === AppStep.EDITOR && font && (
          <Editor 
            font={font} 
            onProcessComplete={handleProcessComplete}
            onBack={handleReset}
            lang={lang}
          />
        )}

        {step === AppStep.RESULT && result && (
          <Result result={result} onReset={handleReset} lang={lang} />
        )}

      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-neutral-100 dark:border-neutral-800 text-center bg-white dark:bg-neutral-900 transition-colors duration-300">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            &copy; {new Date().getFullYear()} {t.footer}
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
             <span>济宁若森软件开发中心</span>
             <span>|</span>
             <a href="mailto:business@itcox.cn" className="hover:text-orange-600 transition-colors">business@itcox.cn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;