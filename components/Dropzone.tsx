import React, { useRef, useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  lang: Language;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileSelect, onUrlSubmit, lang, disabled }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    if (activeTab === 'file' && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    if (activeTab === 'file' && !disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim() && !disabled) {
      onUrlSubmit(urlInput.trim());
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto transition-opacity ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Tabs */}
      <div className="flex mb-4 gap-4 justify-center">
        <button 
          onClick={() => setActiveTab('file')}
          className={`pb-2 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'file' ? 'border-orange-600 text-neutral-900 dark:text-white' : 'border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
        >
          {t.fileTab}
        </button>
        <button 
          onClick={() => setActiveTab('url')}
          className={`pb-2 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'url' ? 'border-orange-600 text-neutral-900 dark:text-white' : 'border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
        >
          {t.urlTab}
        </button>
      </div>

      {activeTab === 'file' ? (
        <div
          className={`
            relative group cursor-pointer
            w-full h-64 mx-auto
            flex flex-col items-center justify-center
            border-2 border-dashed transition-all duration-300 ease-out
            ${isDragging 
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' 
              : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 bg-white dark:bg-neutral-800'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept=".ttf,.otf,.woff,.woff2"
            className="hidden"
            disabled={disabled}
          />
          
          <div className="text-center p-8 pointer-events-none">
            <div className={`
              w-16 h-16 mb-6 mx-auto rounded-full flex items-center justify-center
              transition-colors duration-300
              ${isDragging ? 'bg-orange-600 text-white' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-300 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-600'}
            `}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-xl font-medium text-neutral-900 dark:text-white mb-2">
              {t.dropTitle}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t.dropSub}
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full h-64 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-center p-8 shadow-sm">
           <input
             type="text"
             value={urlInput}
             onChange={(e) => setUrlInput(e.target.value)}
             placeholder={t.urlInputPlaceholder}
             className="w-full max-w-lg mb-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-3 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 font-mono text-sm placeholder-neutral-400 dark:placeholder-neutral-600"
             disabled={disabled}
           />
           <button 
             onClick={handleUrlSubmit}
             disabled={!urlInput || disabled}
             className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase tracking-widest text-xs hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {t.importBtn}
           </button>
           <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500 max-w-sm text-center leading-relaxed">
             {t.proxyNote}
           </p>
        </div>
      )}
    </div>
  );
};