import React, { useState, useRef } from 'react';
import { Trash2, Plus, Save, Loader2, FileUp } from 'lucide-react';
import { StudentSample } from '../types';

interface SamplesManagerProps {
  samples: StudentSample[];
  setSamples: React.Dispatch<React.SetStateAction<StudentSample[]>>;
}

const SamplesManager: React.FC<SamplesManagerProps> = ({ samples, setSamples }) => {
  const [newText, setNewText] = useState('');
  const [newTag, setNewTag] = useState('Есе');
  const [isReading, setIsReading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSample = () => {
    if (!newText.trim()) return;
    
    const newSample: StudentSample = {
      id: Date.now().toString(),
      text: newText,
      tag: newTag,
      dateAdded: Date.now()
    };

    setSamples(prev => [...prev, newSample]);
    setNewText('');
  };

  const handleDelete = (id: string) => {
    setSamples(prev => prev.filter(s => s.id !== id));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsReading(true);
    let successCount = 0;
    
    try {
        const newSamples: StudentSample[] = [];
        
        // Loop through all selected files
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let text = '';
            
            try {
                if (file.name.endsWith('.docx')) {
                    const arrayBuffer = await file.arrayBuffer();
                    // @ts-ignore - mammoth is loaded globally via index.html script tag
                    const result = await window.mammoth.extractRawText({ arrayBuffer });
                    if (result.value) {
                        text = result.value;
                    }
                } else if (file.name.endsWith('.txt')) {
                    text = await file.text();
                }

                if (text.trim()) {
                    newSamples.push({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        text: text,
                        tag: 'Файл', // Default tag for uploads
                        dateAdded: Date.now()
                    });
                    successCount++;
                }
            } catch (err) {
                console.error(`Failed to read file ${file.name}`, err);
            }
        }

        if (newSamples.length > 0) {
            setSamples(prev => [...prev, ...newSamples]);
        }

    } catch (error) {
      console.error("Error reading files:", error);
      alert("Помилка при обробці файлів.");
    } finally {
      setIsReading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      {/* Input Column */}
      <div className="md:col-span-1 bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Додати зразок</h3>
          <p className="text-sm text-slate-400">Завантажте ваші роботи (.docx), і вони автоматично додадуться до бази.</p>
        </div>

        {/* File Upload Button */}
        <div className="flex flex-col gap-2">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".docx,.txt"
            multiple
            className="hidden"
          />
          <button 
            onClick={triggerFileUpload}
            disabled={isReading}
            className="w-full border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500 text-emerald-400 py-8 rounded-xl transition-all flex flex-col items-center justify-center gap-3 text-sm group"
          >
            {isReading ? (
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            ) : (
              <FileUp className="w-10 h-10 group-hover:scale-110 transition-transform" />
            )}
            <div className="text-center">
                <span className="font-bold text-base block mb-1">
                    {isReading ? "Обробка файлів..." : "Завантажити Word файли"}
                </span>
                {!isReading && <span className="text-xs text-slate-500">Підтримує .docx та .txt<br/>Можна декілька одразу</span>}
            </div>
          </button>
        </div>

        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase">Або вручну</span>
            <div className="flex-grow border-t border-slate-700"></div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-400 uppercase">Тип роботи</label>
          <select 
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="Есе">Есе</option>
            <option value="Курсова">Курсова / Дипломна</option>
            <option value="Листування">Листування / Чат</option>
            <option value="Доповідь">Доповідь</option>
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-2 relative">
          <textarea 
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Вставте текст тут..."
            className="w-full h-full min-h-[100px] bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
          />
        </div>

        <button 
          onClick={handleAddSample}
          disabled={!newText.trim()}
          className="w-full bg-slate-700 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-slate-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Додати текст вручну
        </button>
      </div>

      {/* List Column */}
      <div className="md:col-span-2 bg-slate-800/30 border border-slate-700 rounded-xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Збережені зразки ({samples.length})</h3>
          <div className="text-xs text-slate-400">ШІ навчається на цих текстах</div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {samples.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
              <Save className="w-8 h-8 mb-2 opacity-50" />
              <p>Зразки відсутні</p>
            </div>
          ) : (
            samples.slice().reverse().map(sample => (
              <div key={sample.id} className="bg-slate-900 border border-slate-700 p-4 rounded-lg group hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-900/50">
                    {sample.tag}
                  </span>
                  <button 
                    onClick={() => handleDelete(sample.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-300 text-sm line-clamp-3 font-light leading-relaxed">
                  {sample.text.slice(0, 300)}...
                </p>
                <div className="mt-2 text-xs text-slate-600 text-right">
                  {new Date(sample.dateAdded).toLocaleDateString()} {new Date(sample.dateAdded).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SamplesManager;