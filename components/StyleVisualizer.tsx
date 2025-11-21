import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { StyleMetrics } from '../types';
import { Info, AlertTriangle } from 'lucide-react';

interface StyleVisualizerProps {
  metrics: StyleMetrics | null;
  isLoading: boolean;
  hasSamples: boolean;
  onAnalyze: () => void;
}

const StyleVisualizer: React.FC<StyleVisualizerProps> = ({ metrics, isLoading, hasSamples, onAnalyze }) => {
  
  if (!hasSamples) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-800/30 rounded-xl border border-slate-700 border-dashed">
        <Info className="w-12 h-12 text-slate-500 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Стиль ще не проаналізовано</h3>
        <p className="text-slate-400 mb-6 max-w-md">
          Додайте хоча б один приклад вашого тексту у вкладці "База Робіт", щоб ШІ міг вивчити ваш стиль.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-800/30 rounded-xl border border-slate-700 animate-pulse">
        <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
        <p className="text-emerald-400 font-medium">Аналіз вашого унікального стилю...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-800/30 rounded-xl border border-slate-700">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Профіль не створено</h3>
        <p className="text-slate-400 mb-6">
          У вас є зразки, але профіль ще не згенеровано.
        </p>
        <button 
          onClick={onAnalyze}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-emerald-900/50"
        >
          Аналізувати Стиль
        </button>
      </div>
    );
  }

  const radarData = [
    { subject: 'Лексика', A: metrics.vocabularyComplexity, fullMark: 10 },
    { subject: 'Довжина речень', A: metrics.sentenceLengthVariance, fullMark: 10 },
    { subject: 'Грамотність', A: metrics.grammarCorrectness, fullMark: 10 },
    { subject: 'Неформальність', A: metrics.informalityLevel, fullMark: 10 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Radar Chart Card */}
      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl flex flex-col items-center">
        <h3 className="text-lg font-semibold text-white mb-4 w-full text-left">Метрики Стилю</h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
              <Radar
                name="Мій стиль"
                dataKey="A"
                stroke="#10b981"
                strokeWidth={2}
                fill="#10b981"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full mt-4">
          <p className="text-sm text-slate-400 italic border-l-2 border-emerald-500 pl-3">
            "{metrics.toneDescription}"
          </p>
        </div>
      </div>

      {/* Details Card */}
      <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 p-6 rounded-xl flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-white">Деталі "ДНК"</h3>
          <button onClick={onAnalyze} className="text-xs text-emerald-400 hover:text-emerald-300 underline">
            Оновити аналіз
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-400 uppercase mb-3">Улюблені слова-зв'язки</h4>
            <div className="flex flex-wrap gap-2">
              {metrics.commonConnectors.map((word, i) => (
                <span key={i} className="px-3 py-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-full text-sm">
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-400 uppercase mb-3">Типові особливості</h4>
            <ul className="space-y-2">
              {metrics.typicalErrors.map((err, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  {err}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Simple stat bars */}
        <div className="mt-auto space-y-4">
             <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Складність лексики</span>
                    <span className="text-white">{metrics.vocabularyComplexity}/10</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${metrics.vocabularyComplexity * 10}%` }}></div>
                </div>
             </div>
             <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Рівень "Офіціозу"</span>
                    <span className="text-white">{10 - metrics.informalityLevel}/10</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(10 - metrics.informalityLevel) * 10}%` }}></div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default StyleVisualizer;