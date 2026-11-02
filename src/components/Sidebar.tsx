import React from 'react';
import { NavigationTab, UserProfile, UserStats } from '../types';
import { calculateLevel } from '../utils/storage';
import {
  LayoutDashboard,
  CheckSquare,
  GitFork,
  FolderKanban,
  Bot,
  Target,
  Settings,
  Flame,
  Zap,
  Sparkles,
  ChevronRight,
  GraduationCap,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  profile: UserProfile;
  stats: UserStats;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenCreateMission: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  stats,
  isMobileOpen,
  onCloseMobile,
  onOpenCreateMission,
}) => {
  const levelData = calculateLevel(stats.xp);

  const navItems: Array<{ id: NavigationTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'dashboard', label: '대시보드', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'missions', label: '나의 미션', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'skill-tree', label: '스킬 트리', icon: <GitFork className="w-4 h-4" /> },
    { id: 'portfolio', label: '포트폴리오', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'coach', label: 'AI 취업 코치', icon: <Bot className="w-4 h-4" />, badge: 'AI' },
    { id: 'goals', label: '취업 목표 & 역량', icon: <Target className="w-4 h-4" /> },
    { id: 'settings', label: '설정 & 프로필', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-200 font-black text-lg">
              C
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base tracking-tight">
                  Career Mission
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-200">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">취업 준비 성장 게임</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Target & Level Card */}
        <div className="p-4 pb-2">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">{profile.name}</span>
                <span className="text-[10px] text-slate-500 font-medium">{profile.grade}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{stats.currentStreak}일 연속</span>
              </div>
            </div>

            {/* Target Job preview */}
            <div className="text-[11px] text-slate-600 bg-white border border-slate-200/60 rounded-lg p-2 mb-2 flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-semibold text-slate-800 truncate">
                {profile.targetCompany}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 truncate">{profile.targetRole}</span>
            </div>

            {/* Level Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-extrabold text-indigo-600">Lv.{levelData.level}</span>
                <span className="font-medium text-slate-500 font-mono text-[10px]">
                  {stats.xp} / {levelData.nextLevelXp} XP
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${levelData.progressPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 text-right font-medium">
                다음 레벨까지 {levelData.xpNeededForNextLevel} XP
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Action Button */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => {
              onOpenCreateMission();
              onCloseMobile();
            }}
            className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI 미션 추가 / 생성</span>
          </button>
        </div>
      </aside>
    </>
  );
};
