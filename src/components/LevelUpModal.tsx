import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Zap, ArrowRight, X, Sparkles } from 'lucide-react';

interface LevelUpModalProps {
  level: number;
  xp: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, xp, onClose }) => {
  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#818CF8', '#F59E0B', '#10B981', '#EC4899'],
      });
      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
      return () => clearTimeout(timer);
    } catch (e) {
      console.log('Confetti err:', e);
    }
  }, [level]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden text-center p-7 transform transition-all animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decorative Badge */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-3xl rotate-6 flex items-center justify-center shadow-lg shadow-amber-300/40 mb-5 relative">
          <div className="absolute inset-0 bg-white/20 rounded-3xl" />
          <Award className="w-10 h-10 text-amber-900 -rotate-6" />
          <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            UP!
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          취업 역량 레벨 달성!
        </div>

        <h2 className="text-2xl font-bold text-slate-900">
          LEVEL <span className="text-indigo-600">{level}</span> 달성을 축하합니다!
        </h2>
        <p className="text-slate-600 text-sm mt-2 leading-relaxed">
          실제 취업 역량을 높이는 미션을 성공적으로 완수하여 경험치를 획득했습니다. 당신의 성장이
          합격 확률을 높이고 있습니다.
        </p>

        {/* Level Stats Highlight */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 my-5 flex items-center justify-around">
          <div>
            <div className="text-xs text-slate-500 font-medium">현재 레벨</div>
            <div className="text-xl font-bold text-indigo-600">Lv.{level}</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-xs text-slate-500 font-medium">누적 획득 XP</div>
            <div className="text-xl font-bold text-amber-600 flex items-center justify-center gap-1">
              <Zap className="w-4 h-4 fill-amber-500" />
              {xp.toLocaleString()} XP
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-medium shadow-md shadow-indigo-200 hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>다음 미션 도전하기</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
