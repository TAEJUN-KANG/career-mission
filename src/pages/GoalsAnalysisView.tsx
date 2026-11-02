import React, { useState } from 'react';
import { UserProfile, CompetenceAnalysis } from '../types';
import { RadarChart } from '../components/RadarChart';
import {
  Target,
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  TrendingUp,
  Clock,
  Layers,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface GoalsAnalysisViewProps {
  profile: UserProfile;
  analysis: CompetenceAnalysis;
  onRefreshAnalysis: () => Promise<void>;
}

export const GoalsAnalysisView: React.FC<GoalsAnalysisViewProps> = ({
  profile,
  analysis,
  onRefreshAnalysis,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>(
    analysis.radarChart[0]?.domain || '전공 역량'
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshAnalysis();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate D-Day
  const getDDay = () => {
    if (!profile.targetJobDate) return null;
    const target = new Date(profile.targetJobDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const diffDays = getDDay();
  const selectedPoint = analysis.radarChart.find((d) => d.domain === selectedDomain);

  return (
    <div className="space-y-6">
      {/* Top Goal Status Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Target className="w-3.5 h-3.5 text-amber-300" />
              최종 취업 목표
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {profile.targetCompany} · {profile.targetRole}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span>지원자: {profile.name} ({profile.university} {profile.major})</span>
              <span>·</span>
              <span>관심 산업: {(profile.targetIndustries || []).join(', ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {diffDays !== null && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 text-center min-w-[120px]">
                <div className="text-[11px] text-indigo-200 font-medium">목표일까지</div>
                <div className="text-2xl font-black text-amber-400 mt-0.5">
                  {diffDays > 0 ? `D-${diffDays}` : diffDays === 0 ? 'D-Day' : `D+${Math.abs(diffDays)}`}
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">{profile.targetJobDate}</div>
              </div>
            )}

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Gemini 진단 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI 역량 재진단</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Analysis Section: Radar Chart on Left, Domain Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive 6-Domain Radar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                6대 직무 역량 다이어그램 (Radar Chart)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              최근 진단: {analysis.lastUpdated ? analysis.lastUpdated.split('T')[0] : '방금'}
            </span>
          </div>

          {/* SVG Radar Chart */}
          <div className="py-2 w-full flex justify-center">
            <RadarChart data={analysis.radarChart} size={360} />
          </div>

          {/* Domain Selector Pills */}
          <div className="w-full pt-2 border-t border-slate-100 flex flex-wrap justify-center gap-1.5">
            {analysis.radarChart.map((d) => (
              <button
                key={d.domain}
                onClick={() => setSelectedDomain(d.domain)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                  selectedDomain === d.domain
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d.domain} ({d.currentScore}/{d.targetScore})
              </button>
            ))}
          </div>
        </div>

        {/* Right: Selected Domain Deep-Dive Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedPoint && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500">선택된 역량 영역</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedPoint.domain}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">역량 격차</div>
                  <div className="text-sm font-bold text-amber-600 font-mono">
                    {selectedPoint.targetScore - selectedPoint.currentScore > 0
                      ? `-${selectedPoint.targetScore - selectedPoint.currentScore}점 부족`
                      : '목표 달성 완료!'}
                  </div>
                </div>
              </div>

              {/* Score visual bars */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">내 현재 역량 점수</span>
                    <span className="font-bold text-indigo-700 font-mono">
                      {selectedPoint.currentScore} / 100점
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${selectedPoint.currentScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">목표 직무 요구치</span>
                    <span className="font-bold text-amber-600 font-mono">
                      {selectedPoint.targetScore} / 100점
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${selectedPoint.targetScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status & Requirement Detail */}
              <div className="space-y-2.5 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">내 현재 상태 평가:</span>
                  <p className="text-slate-600 leading-relaxed">{selectedPoint.statusDescription}</p>
                </div>

                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                  <span className="font-bold text-amber-900 block mb-1">목표 직무 요구 수준:</span>
                  <p className="text-amber-950/80 leading-relaxed">{selectedPoint.targetRequirement}</p>
                </div>
              </div>
            </div>
          )}

          {/* Overall AI Summary */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-5 shadow-2xs space-y-2">
            <h4 className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              AI 취업 컨설턴트 총평
            </h4>
            <p className="text-xs text-indigo-950/80 leading-relaxed">
              {analysis.overallSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Verified Notice vs Market Estimate Breakdown (Crucial AI Rule) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              공식 채용 공고 vs AI 업계 추정 데이터 구분
            </h3>
            <p className="text-[11px] text-slate-400">
              기업 공식 발표 요건과 AI 합격자 표본 추정치를 투명하게 분리하여 안내합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Verified Notice */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              공식 채용 공고 상 확인된 필수 요건
            </div>
            <p className="text-xs text-emerald-950/85 leading-relaxed">
              {analysis.verifiedNoticeVsGeneralEstimate.verifiedFacts}
            </p>
          </div>

          {/* Market Estimate */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              업계 합격자 데이터 및 AI 트렌드 추정치
            </div>
            <p className="text-xs text-blue-950/85 leading-relaxed">
              {analysis.verifiedNoticeVsGeneralEstimate.marketEstimate}
            </p>
          </div>
        </div>
      </div>

      {/* Gap Analysis & Priority Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gap Analysis Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">부족한 역량 정밀 갭 분석 (Gap Analysis)</h3>
          </div>

          <div className="space-y-3">
            {analysis.gapAnalysis.map((gap, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{gap.area}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      gap.severity === 'HIGH'
                        ? 'bg-red-100 text-red-700'
                        : gap.severity === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    중요도: {gap.severity}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{gap.gapDescription}</p>
                <div className="pt-1 text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                  <span>추천 액션:</span>
                  <span className="text-slate-700 font-normal">{gap.recommendedAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Roadmap */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">단계별 취업 준비 우선순위 로드맵</h3>
          </div>

          <div className="space-y-3">
            {analysis.priorityRoadmap.map((item) => (
              <div
                key={item.order}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-[11px]">
                  {item.order}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.title}</span>
                    <span className="text-[11px] text-indigo-600 font-semibold font-mono">
                      {item.duration}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
