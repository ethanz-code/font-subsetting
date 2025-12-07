import React from 'react';
import { ProcessedResult, Language } from '../types';
import { translations } from '../i18n';

interface ResultProps {
  result: ProcessedResult;
  onReset: () => void;
  lang: Language;
}

export const Result: React.FC<ResultProps> = ({ result, onReset, lang }) => {
  const t = translations[lang];
  const handleDownload = () => {
    // Native download to avoid module import issues
    const url = URL.createObjectURL(result.zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'font-subset-package.zip');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const savingsPercent = (result.savings * 100).toFixed(1);

  return (
    <div className="w-full max-w-4xl mx-auto text-center animate-fade-in py-12">
      
      <div className="mb-8 flex justify-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
      </div>

      <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">{t.optimizationComplete}</h2>
      <p className="text-neutral-500 dark:text-neutral-400 mb-12 max-w-lg mx-auto">
        {t.optDesc} <span className="text-green-600 dark:text-green-400 font-bold">{savingsPercent}%</span>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
         <div className="p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">{t.newSize}</p>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{(result.subsetSize / 1024).toFixed(1)} <span className="text-sm font-normal text-neutral-400">KB</span></p>
         </div>
         <div className="p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">{t.format}</p>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">TTF <span className="text-sm font-normal text-neutral-400">Subset</span></p>
         </div>
         <div className="p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">{t.files}</p>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">3 <span className="text-sm font-normal text-neutral-400">Included</span></p>
         </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-4">
        <button
          onClick={handleDownload}
          className="px-8 py-4 bg-orange-600 text-white font-bold uppercase tracking-widest shadow-xl hover:bg-orange-500 hover:shadow-2xl hover:-translate-y-1 transition-all"
        >
          {t.downloadBtn}
        </button>
        <button
          onClick={onReset}
          className="px-8 py-4 bg-transparent border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 font-bold uppercase tracking-widest hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white transition-all"
        >
          {t.resetBtn}
        </button>
      </div>

      <div className="mt-16 text-left max-w-2xl mx-auto">
        <h3 className="text-sm font-bold uppercase text-neutral-400 dark:text-neutral-500 mb-4">{t.integrationGuide}</h3>
        <div className="bg-neutral-900 dark:bg-black p-6 rounded text-neutral-300 font-mono text-xs overflow-x-auto border border-neutral-800">
          <pre>{result.cssSnippet}</pre>
        </div>
      </div>

    </div>
  );
};