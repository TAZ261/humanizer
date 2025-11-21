import React from 'react';
import { BrainCircuit, User, FileText, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'samples' | 'humanizer';
  setView: (view: 'dashboard' | 'samples' | 'humanizer') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 text-emerald-400 cursor-pointer" onClick={() => setView('dashboard')}>
          <BrainCircuit className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-white">Studentify AI</span>
        </div>
        
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
          <button 
            onClick={() => setView('samples')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              currentView === 'samples' 
                ? 'bg-slate-700 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            База Робіт
          </button>
          <button 
            onClick={() => setView('humanizer')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              currentView === 'humanizer' 
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Олюднити
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;