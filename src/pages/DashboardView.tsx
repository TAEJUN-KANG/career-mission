import React from 'react';
import {
  UserProfile,
  UserStats,
  Mission,
  CompetenceAnalysis,
  NavigationTab,
} from '../types';
import { calculateLevel } from '../utils/storage';
import {
  Zap,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Target,
  FileCheck,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface DashboardViewProps {
  profile: UserProfile;
  stats: UserStats;
  missions: Mission[];
  analysis: CompetenceAnalysis;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenProofModal: (mission: Mission) => void;
  onOpenCreateMission: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  stats,
  missions,
  analysis,
  onSelectTab,
  onOpenProofModal,
  onOpenCreateMission,
}) => {
  const levelData = calculateLevel(stats.xp);

  const dailyMissions = missions.filter((m) => m.isDailyMission || m.status === 'IN_PROGRESS');
  const completedMissions = missions.filter((m) => m.status === 'COMPLETED');
  const activeMissions = missions.filter((m) => m.status !== 'COMPLETED');

  // Overall completion rate
  const totalMissionsCount = missions.length;
  const completionRate =
    totalMissionsCount > 0 ? Math.round((completedMissions.length / totalMissionsCount) * 100) : 0;

  // AI recommendations (TODO missions that are not started)
  const aiRecommended = missions.filter((m) => m.status === 'TODO').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Hero Level Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 shadow-md border border-indigo-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-amber-950 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Award className="w-3.5 h-3.5" />
                LEVEL {levelData.level}
              </span>
              <span className="text-xs text-indigo-200">
                {profile.targetCompany} · {profile.targetRole}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {profile.name}님, 오늘의 취업 준비 퀘스트가 준비되었습니다!
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
              취업 준비를 단순한 불안감이 아닌 매일 달성 가능한 게임 미션으로 해결하세요.
              실제 포트폴리오 산출물을 완성할 때마다 레벨이 상승합니다.
            </p>
          </div>

          {/* Level Progress Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 min-w-[240px] shrink-0">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-white">경험치 진행률</span>
              <span className="font-mono font-bold text-amber-300">
                {levelData.progressPercent}%
              </span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-300 h-2 rounded-full transition-all duration-500"
                style={{ width: `${levelData.progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-indigo-200">
              <span>누적 {stats.xp.toLocaleString()} XP</span>
              <span>다음 레벨까지 {levelData.xpNeededForNextLevel} XP</span>
            </div>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Level & XP */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>성장 레벨</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">Lv.{levelData.level}</div>
          <div className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-indigo-600" />
            <span>총 {stats.xp} XP 획득</span>
          </div>
        </div>

        {/* Card 2: Streak */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>연속 학습일</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Flame className="w-4 h-4 fill-amber-500" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.currentStreak}일 연속</div>
          <div className="text-xs text-amber-600 font-semibold mt-1">오늘도 불꽃 유지 중!</div>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>미션 달성률</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{completionRate}%</div>
          <div className="text-xs text-slate-500 mt-1">
            {completedMissions.length} / {totalMissionsCount}건 완료
          </div>
        </div>

        {/* Card 4: Daily study hours */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>일일 투자 시간</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{profile.dailyStudyHours}시간 / 일</div>
          <div className="text-xs text-slate-500 mt-1">설정된 목표 집중 시간</div>
        </div>
      </div>

      {/* Main Grid: Today's Missions & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Active Missions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">오늘의 집중 미션</h3>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                {dailyMissions.length}개
              </span>
            </div>
            <button
              onClick={() => onSelectTab('missions')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>전체 미션 보기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {dailyMissions.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">오늘의 미션을 모두 완료했습니다!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  새로운 미션을 생성하거나 AI 코치에게 다음 퀘스트를 추천받으세요.
                </p>
                <button
                  onClick={onOpenCreateMission}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 cursor-pointer"
                >
                  새 미션 추가하기
                </button>
              </div>
            ) : (
              dailyMissions.map((mission) => {
                const isCompleted = mission.status === 'COMPLETED';
                return (
                  <div
                    key={mission.id}
                    className={`bg-white rounded-xl border p-4.5 transition-all shadow-2xs hover:shadow-xs ${
                      isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
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
                            <Zap className="w-3 h-3 fill-indigo-600" />
                            +{mission.xp} XP
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {mission.estimatedHours}시간
                          </span>
                        </div>

                        <h4
                          className={`font-bold text-sm tracking-tight ${
                            isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                          }`}
                        >
                          {mission.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {mission.description}
                        </p>

                        {/* Completion condition pill */}
                        <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700">완료 조건:</span>
                          <span className="truncate">{mission.completionCondition}</span>
                        </div>
                      </div>

                      {/* Right: Submit Button */}
                      <div className="shrink-0 flex flex-col items-end gap-2">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            완료됨
                          </span>
                        ) : (
                          <button
                            onClick={() => onOpenProofModal(mission)}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>결과물 등록 & 완료</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: AI Recommended Quests & Quick Radar Preview */}
        <div className="space-y-6">
          {/* AI Recommended Quests */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-slate-900 text-sm">AI 추천 후속 미션</h4>
              </div>
              <button
                onClick={onOpenCreateMission}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>추가</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {aiRecommended.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/30 transition-all"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-700">{m.category}</span>
                    <span className="font-bold text-amber-600 font-mono">+{m.xp} XP</span>
                  </div>
                  <h5 className="font-semibold text-xs text-slate-800 line-clamp-1">{m.title}</h5>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => onOpenProofModal(m)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>도전하기</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Competence Snapshot Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-xl border border-indigo-100 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm">취업 역량 진단 요약</h4>
              </div>
              <button
                onClick={() => onSelectTab('goals')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>상세 진단</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
              {analysis.overallSummary}
            </p>

            <div className="pt-2 border-t border-indigo-100/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">우선순위 1순위 과제</span>
              <span className="font-bold text-indigo-700">
                {analysis.priorityRoadmap?.[0]?.title || '직무 툴 산출물 확보'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
