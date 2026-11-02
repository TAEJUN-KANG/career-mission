import React, { useState } from 'react';
import { Mission, MissionCategory, MissionDifficulty, UserProfile } from '../types';
import { DIFFICULTY_XP } from '../utils/storage';
import { postApiJson } from '../utils/apiClient';
import { X, Sparkles, Plus, Loader2, Target, Calendar } from 'lucide-react';

interface CreateMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onAddMission: (mission: Mission) => void;
  onAddGeneratedMissions: (missions: Mission[]) => void;
}

const CATEGORIES: MissionCategory[] = [
  '전공 공부',
  '기술 습득',
  '자격증',
  '어학',
  '프로젝트',
  '기업 분석',
  '취업 준비',
  '포트폴리오',
];

const DIFFICULTIES: MissionDifficulty[] = ['EASY', 'NORMAL', 'HARD', 'EPIC'];

export const CreateMissionModal: React.FC<CreateMissionModalProps> = ({
  isOpen,
  onClose,
  profile,
  onAddMission,
  onAddGeneratedMissions,
}) => {
  const [tab, setTab] = useState<'ai' | 'manual'>('ai');

  // AI Tab state
  const [aiFocusCategory, setAiFocusCategory] = useState<string>('');
  const [aiCount, setAiCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  // Manual Tab state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MissionCategory>('기술 습득');
  const [difficulty, setDifficulty] = useState<MissionDifficulty>('NORMAL');
  const [estimatedHours, setEstimatedHours] = useState<number>(3);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [stepsText, setStepsText] = useState('');
  const [completionCondition, setCompletionCondition] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [manualError, setManualError] = useState('');

  if (!isOpen) return null;

  const normalizeDifficulty = (d: any): MissionDifficulty => {
    if (!d) return 'NORMAL';
    const s = String(d).toUpperCase().trim();
    if (s === 'EASY' || s === '초급' || s === '쉬움' || s === 'BASIC') return 'EASY';
    if (s === 'NORMAL' || s === '중급' || s === '보통' || s === 'MEDIUM') return 'NORMAL';
    if (s === 'HARD' || s === '고급' || s === '어려움' || s === 'ADVANCED') return 'HARD';
    if (s === 'EPIC' || s === '최고급' || s === '전문가' || s === 'EXPERT') return 'EPIC';
    return 'NORMAL';
  };

  const normalizeCategory = (c: any): MissionCategory => {
    if (!c) return '기술 습득';
    const s = String(c).trim();
    if (s.includes('전공')) return '전공 공부';
    if (s.includes('기술') || s.includes('도구') || s.includes('툴') || s.includes('SW')) return '기술 습득';
    if (s.includes('자격') || s.includes('기사')) return '자격증';
    if (s.includes('어학') || s.includes('영어') || s.includes('스피킹')) return '어학';
    if (s.includes('프로젝트') || s.includes('캡스톤')) return '프로젝트';
    if (s.includes('기업') || s.includes('산업') || s.includes('회사') || s.includes('분석')) return '기업 분석';
    if (s.includes('포트폴리오')) return '포트폴리오';
    if (s.includes('취업') || s.includes('면접') || s.includes('자소서')) return '취업 준비';
    return '기술 습득';
  };

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    setAiError('');
    try {
      const data = await postApiJson<any[]>(
        '/api/ai/generate-missions',
        {
          profile,
          count: aiCount,
          focusCategory: aiFocusCategory || undefined,
        }
      );

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const newMissions: Mission[] = data.data.map((item: any, idx: number) => {
          const diff = normalizeDifficulty(item.difficulty);
          const cat = normalizeCategory(item.category);
          const xpVal = Number(item.xp) || DIFFICULTY_XP[diff] || 200;

          return {
            id: `ai-m-${Date.now()}-${idx}`,
            title: item.title || `${profile.targetCompany} 맞춤 역량 실습 과제`,
            description: item.description || '목표 직무 역량을 높이기 위한 실천 미션입니다.',
            category: cat,
            difficulty: diff,
            xp: xpVal,
            estimatedHours: Number(item.estimatedHours) || 3,
            deadline: new Date(Date.now() + (idx + 3) * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            status: 'TODO',
            steps: Array.isArray(item.steps) && item.steps.length > 0
              ? item.steps
              : ['실행 계획 수립', '결과물 작성 및 실습', '최종 검토'],
            completionCondition:
              item.completionCondition || '실행 결과물 파일 또는 요약 보고서 등록',
            recommendedResources: Array.isArray(item.recommendedResources)
              ? item.recommendedResources
              : [],
            isDailyMission: idx === 0,
            linkedSkill: item.linkedSkill || cat,
            createdAt: new Date().toISOString().split('T')[0],
          };
        });

        onAddGeneratedMissions(newMissions);
        onClose();
      } else {
        setAiError(data.error || data.errorNotice || '미션 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setManualError('미션 제목을 입력해주세요.');
      return;
    }
    if (!completionCondition.trim()) {
      setManualError('구체적인 완료 조건을 작성해주세요 (예: 모델링 파일 등록, 요약본 첨부 등)');
      return;
    }

    const steps = stepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newMission: Mission = {
      id: `manual-m-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || '목표 역량 강화를 위한 직접 생성 미션',
      category,
      difficulty,
      xp: DIFFICULTY_XP[difficulty],
      estimatedHours,
      deadline,
      status: 'TODO',
      steps: steps.length > 0 ? steps : ['실행 계획 수립', '실습 및 산출물 작성'],
      completionCondition: completionCondition.trim(),
      recommendedResources: [],
      isDailyMission: isDaily,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddMission(newMission);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">새 미션(퀘스트) 배정</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              취업 목표를 달성하기 위한 실질적인 액션을 추가합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setTab('ai')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              tab === 'ai'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI 맞춤 미션 자동 생성 (추천)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('manual')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              tab === 'manual'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>직접 미션 입력</span>
          </button>
        </div>

        {/* Tab 1: AI Generator */}
        {tab === 'ai' && (
          <div className="p-6 space-y-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900">
              <div className="font-bold flex items-center gap-1.5 text-indigo-900 mb-1">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>현재 목표: {profile.targetCompany} {profile.targetRole}</span>
              </div>
              <p className="text-indigo-800/90 leading-relaxed text-[11px]">
                Gemini AI가 당신의 전공({profile.major}), 보유 스킬, 남은 기간을 종합 분석하여
                서류 및 면접에서 직접적인 무기가 되는 산출물 중심의 미션을 설계합니다.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                집중하고 싶은 카테고리 (선택 시 해당 영역 미션 생성)
              </label>
              <select
                value={aiFocusCategory}
                onChange={(e) => setAiFocusCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option value="">전체 균형 추천 (전공/기술/어학/기업분석 등)</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                생성할 미션 개수
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setAiCount(cnt)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      aiCount === cnt
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {cnt}개
                  </button>
                ))}
              </div>
            </div>

            {aiError && <p className="text-xs text-red-600 font-medium">{aiError}</p>}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleAiGenerate}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>AI 맞춤형 미션 분석 및 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>AI 미션 {aiCount}개 즉시 생성하기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Manual Creator */}
        {tab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="p-6 space-y-3.5 max-h-[65vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                미션 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: CATIA 기초 서피스 모델링 완성 및 저장"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  카테고리
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MissionCategory)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  난이도 & XP
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as MissionDifficulty)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white font-medium"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d} (+{DIFFICULTY_XP[d]} XP)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  예상 소요 시간
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  완료 기한
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                완료 조건 (필수 증빙 산출물) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={completionCondition}
                onChange={(e) => setCompletionCondition(e.target.value)}
                placeholder="예: 3D 모델링 캡처본 또는 작업 파일 등록"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                수행 단계 (줄바꿈으로 구분)
              </label>
              <textarea
                rows={3}
                value={stepsText}
                onChange={(e) => setStepsText(e.target.value)}
                placeholder="1. 기초 튜토리얼 학습&#10;2. 도면 기반 모델링 작업&#10;3. 치수 검증 및 저장"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isDailyCheck"
                checked={isDaily}
                onChange={(e) => setIsDaily(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600"
              />
              <label htmlFor="isDailyCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                오늘의 일일 미션으로 지정하기
              </label>
            </div>

            {manualError && <p className="text-xs text-red-600 font-medium">{manualError}</p>}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>미션 추가하기</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
