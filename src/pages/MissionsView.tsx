import React, { useState } from 'react';
import {
  Mission,
  MissionCategory,
  MissionDifficulty,
  MissionStatus,
  UserProfile,
} from '../types';
import {
  Search,
  Filter,
  Plus,
  Sparkles,
  Clock,
  Zap,
  CheckCircle2,
  FileCheck,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Trash2,
  BookOpen,
} from 'lucide-react';

interface MissionsViewProps {
  missions: Mission[];
  profile: UserProfile;
  onOpenProofModal: (mission: Mission) => void;
  onOpenCreateMission: () => void;
  onUpdateMissionStatus: (id: string, status: MissionStatus) => void;
  onDeleteMission: (id: string) => void;
}

const CATEGORIES: Array<MissionCategory | 'ALL'> = [
  'ALL',
  '전공 공부',
  '기술 습득',
  '자격증',
  '어학',
  '프로젝트',
  '기업 분석',
  '취업 준비',
  '포트폴리오',
];

const DIFFICULTIES: Array<MissionDifficulty | 'ALL'> = ['ALL', 'EASY', 'NORMAL', 'HARD', 'EPIC'];

type StatusFilter = 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRING_SOON';

export const MissionsView: React.FC<MissionsViewProps> = ({
  missions,
  profile,
  onOpenProofModal,
  onOpenCreateMission,
  onUpdateMissionStatus,
  onDeleteMission,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<MissionCategory | 'ALL'>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<MissionDifficulty | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);

  // Check if expiring within 3 days
  const isExpiringSoon = (deadline: string) => {
    if (!deadline) return false;
    const target = new Date(deadline);
    const today = new Date();
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3;
  };

  const filteredMissions = missions.filter((m) => {
    // Status filter
    if (statusFilter === 'IN_PROGRESS' && m.status !== 'IN_PROGRESS' && m.status !== 'TODO')
      return false;
    if (statusFilter === 'COMPLETED' && m.status !== 'COMPLETED') return false;
    if (statusFilter === 'EXPIRING_SOON' && (!isExpiringSoon(m.deadline) || m.status === 'COMPLETED'))
      return false;

    // Category filter
    if (categoryFilter !== 'ALL' && m.category !== categoryFilter) return false;

    // Difficulty filter
    if (difficultyFilter !== 'ALL' && m.difficulty !== difficultyFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchDesc = m.description.toLowerCase().includes(q);
      const matchCond = m.completionCondition.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCond) return false;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="미션 제목, 산출물 조건, 키워드 검색..."
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateMission}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI 미션 생성 / 추가</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> 상태:
          </span>
          {[
            { id: 'ALL', label: `전체 (${missions.length})` },
            {
              id: 'IN_PROGRESS',
              label: `진행 중 (${missions.filter((m) => m.status !== 'COMPLETED').length})`,
            },
            {
              id: 'COMPLETED',
              label: `완료 (${missions.filter((m) => m.status === 'COMPLETED').length})`,
            },
            {
              id: 'EXPIRING_SOON',
              label: `마감 임박 (${
                missions.filter((m) => isExpiringSoon(m.deadline) && m.status !== 'COMPLETED').length
              })`,
            },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id as StatusFilter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Category & Difficulty Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1">분야:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat === 'ALL' ? '전체' : cat}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1">난이도:</span>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2 py-0.8 text-[11px] font-semibold rounded transition-all cursor-pointer ${
                  difficultyFilter === diff
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {diff === 'ALL' ? '전체' : diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mission List */}
      <div className="space-y-3">
        {filteredMissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">해당 조건의 미션이 없습니다</h4>
            <p className="text-xs text-slate-400 mt-1">
              필터를 변경하거나 AI 미션 생성 버튼을 눌러 새 퀘스트를 배정받으세요.
            </p>
          </div>
        ) : (
          filteredMissions.map((mission) => {
            const isCompleted = mission.status === 'COMPLETED';
            const isExpanded = expandedMissionId === mission.id;
            const expiring = isExpiringSoon(mission.deadline) && !isCompleted;

            return (
              <div
                key={mission.id}
                className={`bg-white rounded-xl border transition-all shadow-2xs ${
                  isCompleted
                    ? 'border-emerald-200/80 bg-emerald-50/15'
                    : expiring
                    ? 'border-amber-300 bg-amber-50/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Main Card Row */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {mission.category}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            mission.difficulty === 'EASY'
                              ? 'bg-emerald-100 text-emerald-800'
                              : mission.difficulty === 'NORMAL'
                              ? 'bg-blue-100 text-blue-800'
                              : mission.difficulty === 'HARD'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {mission.difficulty}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                          <Zap className="w-3 h-3 fill-indigo-600" />+{mission.xp} XP
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          예상 {mission.estimatedHours}시간
                        </span>
                        {mission.deadline && (
                          <span
                            className={`text-[11px] flex items-center gap-1 font-mono px-2 py-0.5 rounded ${
                              expiring
                                ? 'bg-amber-100 text-amber-800 font-bold'
                                : 'text-slate-500 bg-slate-50'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            마감: {mission.deadline} {expiring && '(임박!)'}
                          </span>
                        )}
                      </div>

                      {/* Title & Desc */}
                      <h3
                        className={`text-base font-bold tracking-tight ${
                          isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}
                      >
                        {mission.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {mission.description}
                      </p>

                      {/* Required Condition */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-xs text-slate-700 flex items-start gap-2">
                        <span className="font-bold text-indigo-700 shrink-0">완료 증빙 조건:</span>
                        <span className="text-slate-600">{mission.completionCondition}</span>
                      </div>
                    </div>

                    {/* Actions on right */}
                    <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {isCompleted ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            완료됨
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenProofModal(mission)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>결과물 등록 & XP 획득</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setExpandedMissionId(isExpanded ? null : mission.id)
                          }
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? '접기' : '상세보기'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('이 미션을 목록에서 삭제하시겠습니까?')) {
                              onDeleteMission(mission.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="미션 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/60 rounded-b-xl space-y-4 text-xs animate-in fade-in duration-150">
                    {/* Execution steps */}
                    {mission.steps && mission.steps.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          구체적인 수행 단계 가이드:
                        </h4>
                        <ol className="space-y-1.5 pl-5 list-decimal text-slate-600 leading-relaxed">
                          {mission.steps.map((step, idx) => (
                            <li key={idx} className="pl-1">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Recommended Resources */}
                    {mission.recommendedResources && mission.recommendedResources.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                          추천 학습 및 참고 자료:
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {mission.recommendedResources.map((res, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 text-[11px] font-medium"
                            >
                              {res}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submitted Proof Details (if completed) */}
                    {isCompleted && mission.proofSubmission && (
                      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-1">
                        <div className="font-bold text-emerald-900 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          제출 완료된 산출물 증빙
                        </div>
                        <div className="text-emerald-800 font-mono text-[11px]">
                          증빙 내용: {mission.proofSubmission.content}
                        </div>
                        {mission.proofSubmission.notes && (
                          <div className="text-emerald-700 text-[11px]">
                            메모: {mission.proofSubmission.notes}
                          </div>
                        )}
                        <div className="text-emerald-600 text-[10px]">
                          제출 일시: {mission.proofSubmission.submittedAt}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
