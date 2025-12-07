import React, { useState, useEffect } from 'react';
import { FontMetadata, ProcessedResult, Language } from '../types';
import { generateSampleText, suggestCssStack } from '../services/geminiService';
import { generateSubset } from '../services/fontService';
import { translations } from '../i18n';

interface EditorProps {
  font: FontMetadata;
  onProcessComplete: (result: ProcessedResult) => void;
  onBack: () => void;
  lang: Language;
}

export const Editor: React.FC<EditorProps> = ({ font, onProcessComplete, onBack, lang }) => {
  const t = translations[lang];
  const [subsetText, setSubsetText] = useState<string>(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [customName, setCustomName] = useState(font.familyName);
  const [uniqueChars, setUniqueChars] = useState(0);

  // Gemini suggested stack
  const [cssStack, setCssStack] = useState('');

  useEffect(() => {
    const chars = new Set(subsetText.split(''));
    setUniqueChars(chars.size);
  }, [subsetText]);

  useEffect(() => {
    // Fetch a suggestion on mount
    suggestCssStack(font.familyName).then(setCssStack);
  }, [font.familyName]);

  const handleGenerate = async () => {
    setIsProcessing(true);
    try {
      // Small delay to allow UI to update
      setTimeout(async () => {
        const result = await generateSubset(font, subsetText, customName);
        onProcessComplete(result);
        setIsProcessing(false);
      }, 100);
    } catch (e) {
      console.error(e);
      alert("Error processing font. The file might be corrupted or unsupported.");
      setIsProcessing(false);
    }
  };

  const handleAiAction = async (type: 'common_cn' | 'ascii' | 'marketing') => {
    const text = await generateSampleText(type, lang);
    if (text) {
      if (type === 'ascii') {
         setSubsetText(text);
      } else {
         setSubsetText(prev => prev + ' ' + text);
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
      
      {/* Left Column: Controls */}
      <div className="flex flex-col gap-8">
        
        {/* Header Info */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{font.fontName}</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{(font.originalSize / 1024).toFixed(1)} KB • {font.glyphCount} Glyphs</p>
          </div>
          <button onClick={onBack} className="text-sm text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-4">
            {t.changeFile}
          </button>
        </div>

        {/* Configuration */}
        <div className="space-y-6">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              {t.outputFamily}
            </label>
            <input 
              type="text" 
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors font-mono text-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t.subsetChars} ({uniqueChars})
              </label>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAiAction('ascii')}
                  className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 transition-colors"
                >
                  {t.asciiBtn}
                </button>
                <button 
                  onClick={() => handleAiAction('common_cn')}
                  className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 transition-colors"
                >
                  {t.commonCnBtn}
                </button>
              </div>
            </div>
            <textarea
              value={subsetText}
              onChange={(e) => setSubsetText(e.target.value)}
              className="w-full h-64 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono text-xs leading-relaxed resize-none shadow-inner dark:shadow-none"
              placeholder="..."
            />
             <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 text-right">
                {t.aiAssist}
             </p>
          </div>

        </div>

        {/* Action */}
        <button
          onClick={handleGenerate}
          disabled={isProcessing || uniqueChars === 0}
          className={`
            w-full py-4 text-center text-sm font-bold uppercase tracking-widest
            transition-all duration-300
            ${isProcessing 
              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed' 
              : 'bg-orange-600 text-white hover:bg-orange-500 shadow-lg hover:shadow-orange-200 dark:hover:shadow-none'
            }
          `}
        >
          {isProcessing ? t.processing : t.exportBtn}
        </button>

      </div>

      {/* Right Column: Preview */}
      <div className="bg-neutral-900 dark:bg-black text-neutral-100 p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden border border-neutral-800">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-[10rem] font-bold leading-none select-none pointer-events-none">
          Aa
        </div>
        
        <div className="relative z-10 border-b border-neutral-800 pb-4 mb-4">
           <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">{t.previewTitle}</h3>
           <p className="text-neutral-500 text-xs">{t.previewDesc}</p>
        </div>

        <div className="relative z-10 flex-grow overflow-y-auto space-y-8">
            <style>{`
              @font-face {
                font-family: 'PreviewFont';
                src: url('${URL.createObjectURL(new Blob([font.buffer]))}') format('truetype');
              }
            `}</style>
            
            <div style={{ fontFamily: 'PreviewFont, sans-serif' }}>
              <p className="text-6xl mb-4">Aa</p>
              <p className="text-4xl mb-6 break-words leading-tight">{customName}</p>
              <p className="text-lg opacity-80 leading-relaxed break-words whitespace-pre-wrap">
                {subsetText.substring(0, 300) || "..."}
                {subsetText.length > 300 && "..."}
              </p>
            </div>
        </div>

        <div className="relative z-10 mt-auto pt-6 border-t border-neutral-800">
           <p className="text-xs text-neutral-500 mb-2 font-mono">{t.suggestedStack}</p>
           <code className="block w-full bg-neutral-950 p-3 text-xs text-orange-400 font-mono">
             font-family: {cssStack};
           </code>
        </div>
      </div>
    </div>
  );
};