import React, { useState } from 'react';
import { SkillNode, SkillStatus, Mission, UserProfile } from '../types';
import {
  GitFork,
  BookOpen,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Award,
} from 'lucide-react';

interface SkillTreeViewProps {
  skills: SkillNode[];
  missions: Mission[];
  profile: UserProfile;
  onUpdateSkillStatus: (skillId: string, status: SkillStatus) => void;
  onOpenProofModal: (mission: Mission) => void;
}

const STATUS_CONFIG: Record<
  SkillStatus,
  { label: string; bg: string; text: string; border: string; dots: number }
> = {
  미학습: { label: '미학습', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dots: 1 },
  '학습 중': { label: '학습 중', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dots: 2 },
  '기본 역량 확보': {
    label: '기본 역량 확보',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dots: 3,
  },
  '프로젝트 완료': {
    label: '프로젝트 완료',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dots: 4,
  },
  숙련: { label: '숙련 (Master)', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300', dots: 5 },
};

export const SkillTreeView: React.FC<SkillTreeViewProps> = ({
  skills,
  missions,
  profile,
  onUpdateSkillStatus,
  onOpenProofModal,
}) => {
  const [selectedSkillId, setSelectedSkillId] = useState<string>(skills[0]?.id || '');

  // Group skills by category
  const categories = Array.from(new Set(skills.map((s) => s.category)));

  const selectedSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  // Calculate overall mastery
  const masteredCount = skills.filter(
    (s) => s.status === '프로젝트 완료' || s.status === '숙련' || s.status === '기본 역량 확보'
  ).length;
  const masteryPercent = Math.round((masteredCount / Math.max(1, skills.length)) * 100);

  // Linked active missions for selected skill
  const relatedMissions = missions.filter(
    (m) =>
      m.linkedSkill === selectedSkill?.name ||
      (selectedSkill?.linkedMissions && selectedSkill.linkedMissions.includes(m.id))
  );

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <GitFork className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              {profile.targetRole} 핵심 스킬 트리
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
              {profile.major} 기반
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            목표 기업 및 직무에서 요구하는 핵심 역량을 노드별로 정복하세요. 각 스킬을 클릭하여
            숙련도를 전환하고 연계된 실습 미션을 즉시 수행할 수 있습니다.
          </p>
        </div>

        {/* Overall Skill Progress Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 min-w-[220px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">스킬 달성률</span>
            <span className="font-bold text-indigo-600 font-mono">{masteryPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 text-right">
            총 {skills.length}개 중 {masteredCount}개 확보
          </div>
        </div>
      </div>

      {/* Main Layout: Left Categories Tree & Right Skill Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Skill Tree Clusters */}
        <div className="lg:col-span-2 space-y-6">
          {categories.map((category) => {
            const catSkills = skills.filter((s) => s.category === category);
            return (
              <div
                key={category}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-sm">{category}</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {catSkills.length}개 스킬 노드
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catSkills.map((skill) => {
                    const isSelected = selectedSkill?.id === skill.id;
                    const cfg = STATUS_CONFIG[skill.status] || STATUS_CONFIG['미학습'];

                    return (
                      <div
                        key={skill.id}
                        onClick={() => setSelectedSkillId(skill.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left relative ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                            {skill.name}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}
                          >
                            {cfg.label}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {skill.description}
                        </p>

                        {/* Mastery level dots */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">숙련 단계:</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((dot) => (
                              <span
                                key={dot}
                                className={`w-2 h-2 rounded-full ${
                                  dot <= cfg.dots ? 'bg-indigo-600' : 'bg-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Selected Skill Detail & Mission Connection */}
        <div className="space-y-5">
          {selectedSkill ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 sticky top-20">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-600">
                    {selectedSkill.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedSkill.name}
                  </h3>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    STATUS_CONFIG[selectedSkill.status].bg
                  } ${STATUS_CONFIG[selectedSkill.status].text} ${
                    STATUS_CONFIG[selectedSkill.status].border
                  }`}
                >
                  {selectedSkill.status}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-1">스킬 개요 및 요구 수준</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedSkill.description}
                </p>
              </div>

              {/* Status Update Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  내 숙련도 상태 업데이트:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['미학습', '학습 중', '기본 역량 확보', '프로젝트 완료', '숙련'] as SkillStatus[]).map(
                    (st) => {
                      const active = selectedSkill.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => onUpdateSkillStatus(selectedSkill.id, st)}
                          className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border transition-all text-center cursor-pointer ${
                            active
                              ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Recommended Resources */}
              {selectedSkill.recommendedResources &&
                selectedSkill.recommendedResources.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      추천 학습 레퍼런스
                    </h4>
                    <div className="space-y-1">
                      {selectedSkill.recommendedResources.map((res, i) => (
                        <div
                          key={i}
                          className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100 flex items-center justify-between"
                        >
                          <span>{res}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Linked Missions */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  연계 실습 미션 ({relatedMissions.length}건)
                </h4>
                {relatedMissions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    현재 연결된 미션이 없습니다. '새 미션 배정'에서 이 스킬 실습 미션을 생성해보세요.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {relatedMissions.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs space-y-1"
                      >
                        <div className="font-semibold text-slate-800 line-clamp-1">{m.title}</div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>+{m.xp} XP</span>
                          {m.status === 'COMPLETED' ? (
                            <span className="text-emerald-600 font-bold">완료됨</span>
                          ) : (
                            <button
                              onClick={() => onOpenProofModal(m)}
                              className="text-indigo-600 font-bold hover:underline cursor-pointer"
                            >
                              미션 수행 & 증빙
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              스킬을 선택해주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
