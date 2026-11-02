import React from 'react';
import { NavigationTab, UserProfile, UserStats } from '../types';
import { calculateLevel } from '../utils/storage';
import { Menu, Sparkles, Flame, Plus, Bot, Calendar, Zap } from 'lucide-react';

interface HeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  profile: UserProfile;
  stats: UserStats;
  onOpenMobileMenu: () => void;
  onOpenCreateMission: () => void;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: '취업 미션 대시보드',
    subtitle: '오늘의 취업 퀘스트를 달성하고 실질적인 역량 경험치를 쌓으세요.',
  },
  missions: {
    title: '나의 취업 미션',
    subtitle: '기업·직무별 맞춤 퀘스트를 수행하고 결과물 증빙으로 XP를 획득하세요.',
  },
  'skill-tree': {
    title: '직무 역량 스킬 트리',
    subtitle: '게임 스킬 트리처럼 목표 직무에 필요한 핵심 지식과 도구를 정복하세요.',
  },
  portfolio: {
    title: '취업 포트폴리오 관리',
    subtitle: '완료한 미션 산출물을 STAR 기법 기반의 프로젝트 이력으로 구조화합니다.',
  },
  coach: {
    title: 'AI 취업 코치 (Gemini)',
    subtitle: '목표 기업 분석, 포트폴리오 조언, 매일의 실행 전략을 실시간 상담하세요.',
  },
  goals: {
    title: '취업 목표 & 역량 진단',
    subtitle: '목표 직무 요구 역량과 내 현재 수준의 갭을 레이더 차트로 정밀 진단합니다.',
  },
  settings: {
    title: '설정 및 프로필 관리',
    subtitle: '목표 기업, 직무, 보유 자격증 및 산업군 정보를 수정합니다.',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  profile,
  stats,
  onOpenMobileMenu,
  onOpenCreateMission,
}) => {
  const currentInfo = TAB_TITLES[currentTab] || TAB_TITLES.dashboard;
  const levelData = calculateLevel(stats.xp);

  // Calculate D-Day
  const getDDay = () => {
    if (!profile.targetJobDate) return null;
    const target = new Date(profile.targetJobDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0) return `D-${diff}`;
    if (diff === 0) return 'D-Day';
    return `D+${Math.abs(diff)}`;
  };

  const dDay = getDDay();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              {currentInfo.title}
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 truncate">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Stat Badges & Quick Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* D-Day badge */}
          {dDay && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{dDay}</span>
            </div>
          )}

          {/* Streak badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{stats.currentStreak}일</span>
          </div>

          {/* Level & XP pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
            <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded font-extrabold">
              Lv.{levelData.level}
            </span>
            <span className="font-mono text-[11px]">{stats.xp} XP</span>
          </div>

          {/* Quick AI Coach or Create button */}
          <button
            onClick={onOpenCreateMission}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">미션 배정</span>
          </button>
        </div>
      </div>
    </header>
  );
};
