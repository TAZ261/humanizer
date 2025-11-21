import React, { useState } from 'react';
import { ArrowRight, Sparkles, Copy, RefreshCw, CheckCircle2, BrainCircuit } from 'lucide-react';
import { StyleMetrics, TransformationSettings, ProcessingResult } from '../types';
import { humanizeText } from '../services/geminiService';

interface HumanizerToolProps {
  styleProfile: StyleMetrics | null;
  hasSamples: boolean;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const HumanizerTool: React.FC<HumanizerToolProps> = ({ styleProfile, hasSamples, onAnalyze, isAnalyzing }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [settings, setSettings] = useState<TransformationSettings>({
    humanizationLevel: 80,
    retainKeyFacts: true,
    addTypos: false,
    mode: 'balanced'
  });

  const handleProcess = async () => {
    if (!input.trim() || !styleProfile) return;
    
    setIsProcessing(true);
    setError(null);
    setCopied(false);

    try {
      const output = await humanizeText(input, styleProfile, settings);
      setResult(output);
    } catch (err) {
      setError("Щось пішло не так під час обробки. Спробуйте ще раз.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.humanized);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!styleProfile) {
     return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 max-w-md w-full">
                <Sparkles className="w-12 h-12 text-slate-600 mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-white mb-2">Стиль не знайдено</h3>
                
                {hasSamples ? (
                    <div className="mt-4">
                         <p className="text-slate-400 mb-6 text-sm">
                            Ви завантажили приклади робіт, але ми ще не проаналізували ваш стиль. 
                            Натисніть кнопку нижче, щоб створити ваш "цифровий підпис".
                        </p>
                        <button 
                            onClick={onAnalyze}
                            disabled={isAnalyzing}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 w-full"
                        >
                             {isAnalyzing ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Аналізуємо стиль...
                                </>
                            ) : (
                                <>
                                    <BrainCircuit className="w-5 h-5" />
                                    Аналізувати мої роботи
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm">
                        Будь ласка, спочатку завантажте ваші роботи у вкладці "База Робіт", щоб ми знали, як саме переписувати текст.
                    </p>
                )}
            </div>
        </div>
     )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      {/* Input Side */}
      <div className="flex flex-col gap-4 h-full">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col h-full">
            <label className="text-sm font-medium text-slate-300 mb-2 flex justify-between">
                <span>Вхідний текст (AI)</span>
                <span className="text-xs text-slate-500">{input.length} chars</span>
            </label>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Вставте сюди текст від ChatGPT, Claude або Gemini..."
                className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none font-light leading-relaxed"
            />
            
            {/* Settings Panel */}
            <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Режим студента</label>
                    <select 
                        value={settings.mode}
                        onChange={(e) => setSettings({...settings, mode: e.target.value as any})}
                        className="w-full bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 p-2"
                    >
                        <option value="balanced">Збалансований</option>
                        <option value="lazy_student">Лінивий (спрощення)</option>
                        <option value="try_hard_student">Старанний (розумні слова)</option>
                    </select>
                </div>
                <div>
                     <label className="text-xs font-medium text-slate-400 mb-1 block">Сила змін: {settings.humanizationLevel}%</label>
                     <input 
                        type="range" 
                        min="0" max="100" 
                        value={settings.humanizationLevel}
                        onChange={(e) => setSettings({...settings, humanizationLevel: Number(e.target.value)})}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                     />
                </div>
                <div className="col-span-2 flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={settings.addTypos}
                            onChange={(e) => setSettings({...settings, addTypos: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span>Додати "людські" помилки</span>
                    </label>
                     <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={settings.retainKeyFacts}
                            onChange={(e) => setSettings({...settings, retainKeyFacts: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span>Зберігати факти</span>
                    </label>
                </div>
            </div>
        </div>

        <button
            onClick={handleProcess}
            disabled={isProcessing || !input.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
        >
            {isProcessing ? (
                <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Обробка...
                </>
            ) : (
                <>
                    Олюднити Текст
                    <ArrowRight className="w-5 h-5" />
                </>
            )}
        </button>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>

      {/* Output Side */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-1 flex flex-col h-full relative overflow-hidden">
        {result ? (
            <div className="flex flex-col h-full bg-slate-800/30 rounded-lg">
                 <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-800/80">
                    <span className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Результат готовий
                    </span>
                    <button 
                        onClick={handleCopy}
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-xs bg-slate-700 px-2 py-1 rounded transition-colors"
                    >
                        {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Скопійовано" : "Копіювати"}
                    </button>
                 </div>
                 
                 <div className="flex-1 p-6 overflow-y-auto">
                    <p className="text-slate-200 whitespace-pre-wrap font-serif text-lg leading-relaxed">
                        {result.humanized}
                    </p>
                 </div>

                 <div className="p-4 bg-slate-900/80 border-t border-slate-700 backdrop-blur-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Що змінилося:</h4>
                    <p className="text-sm text-slate-400 italic">
                        {result.changesExplanation}
                    </p>
                 </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-10 h-10 opacity-20" />
                </div>
                <p>Результат з'явиться тут</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default HumanizerTool;