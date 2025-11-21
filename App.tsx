import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SamplesManager from './components/SamplesManager';
import StyleVisualizer from './components/StyleVisualizer';
import HumanizerTool from './components/HumanizerTool';
import { StudentSample, StyleMetrics } from './types';
import { analyzeStudentStyle } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'samples' | 'humanizer'>('dashboard');
  
  // Persistent State Mock (In a real app, use localStorage or DB)
  const [samples, setSamples] = useState<StudentSample[]>([]);
  const [styleProfile, setStyleProfile] = useState<StyleMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Effect: Check if we have analysis results in localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('studentify_profile');
    const savedSamples = localStorage.getItem('studentify_samples');
    if (savedProfile) setStyleProfile(JSON.parse(savedProfile));
    if (savedSamples) setSamples(JSON.parse(savedSamples));
  }, []);

  // Effect: Save samples to local storage
  useEffect(() => {
    localStorage.setItem('studentify_samples', JSON.stringify(samples));
  }, [samples]);

  const handleAnalyzeStyle = async () => {
    if (samples.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const profile = await analyzeStudentStyle(samples);
      setStyleProfile(profile);
      localStorage.setItem('studentify_profile', JSON.stringify(profile));
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Не вдалося проаналізувати стиль. Перевірте ваш API ключ або з'єднання.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'samples':
        return (
          <div className="h-[calc(100vh-6rem)]">
            <SamplesManager samples={samples} setSamples={setSamples} />
          </div>
        );
      case 'humanizer':
        return (
            <HumanizerTool 
                styleProfile={styleProfile} 
                hasSamples={samples.length > 0}
                onAnalyze={handleAnalyzeStyle}
                isAnalyzing={isAnalyzing}
            />
        );
      case 'dashboard':
      default:
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Панель Студента</h2>
                        <p className="text-slate-400">Ваша персональна статистика стилю письма</p>
                    </div>
                    {samples.length > 0 && (
                        <button 
                            onClick={handleAnalyzeStyle}
                            disabled={isAnalyzing}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium border border-slate-600 transition-all"
                        >
                            {isAnalyzing ? 'Аналіз...' : 'Оновити аналіз'}
                        </button>
                    )}
                </div>
                <StyleVisualizer 
                    metrics={styleProfile} 
                    isLoading={isAnalyzing} 
                    hasSamples={samples.length > 0}
                    onAnalyze={handleAnalyzeStyle}
                />
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      <Navbar currentView={view} setView={setView} />
      
      <main className="max-w-6xl mx-auto p-4 lg:p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;