/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  UserStats,
  Mission,
  SkillNode,
  PortfolioProject,
  CoachMessage,
  CompetenceAnalysis,
  NavigationTab,
  MissionProof,
  SkillStatus,
  MissionStatus,
} from './types';
import {
  storage,
  calculateLevel,
  updateStreak,
  DEFAULT_PROFILE,
  DEFAULT_STATS,
  DEFAULT_MISSIONS,
  DEFAULT_SKILLS,
  DEFAULT_PORTFOLIO,
  DEFAULT_COACH_MESSAGES,
  DEFAULT_ANALYSIS,
} from './utils/storage';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OnboardingModal } from './components/OnboardingModal';
import { CreateMissionModal } from './components/CreateMissionModal';
import { MissionProofModal } from './components/MissionProofModal';
import { LevelUpModal } from './components/LevelUpModal';

import { DashboardView } from './pages/DashboardView';
import { MissionsView } from './pages/MissionsView';
import { SkillTreeView } from './pages/SkillTreeView';
import { PortfolioView } from './pages/PortfolioView';
import { AICoachView } from './pages/AICoachView';
import { GoalsAnalysisView } from './pages/GoalsAnalysisView';
import { SettingsView } from './pages/SettingsView';

export default function App() {
  // Persistent States
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile());
  const [stats, setStats] = useState<UserStats>(() => storage.getStats());
  const [missions, setMissions] = useState<Mission[]>(() => storage.getMissions());
  const [skills, setSkills] = useState<SkillNode[]>(() => storage.getSkills());
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>(() => storage.getPortfolio());
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>(() =>
    storage.getCoachMessages()
  );
  const [analysis, setAnalysis] = useState<CompetenceAnalysis>(() => storage.getAnalysis());

  // UI Navigation & Modals
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => !profile.isOnboarded);
  const [isCreateMissionOpen, setIsCreateMissionOpen] = useState(false);
  const [proofMission, setProofMission] = useState<Mission | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ level: number; xp: number } | null>(null);

  // Sync Streak on initial app load
  useEffect(() => {
    const { newStreak, newLastActiveDate } = updateStreak(
      stats.lastActiveDate,
      stats.currentStreak
    );
    if (newStreak !== stats.currentStreak || newLastActiveDate !== stats.lastActiveDate) {
      const updated = {
        ...stats,
        currentStreak: newStreak,
        lastActiveDate: newLastActiveDate,
      };
      setStats(updated);
      storage.saveStats(updated);
    }
  }, []);

  // Save changes to storage
  useEffect(() => {
    storage.saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    storage.saveStats(stats);
  }, [stats]);

  useEffect(() => {
    storage.saveMissions(missions);
  }, [missions]);

  useEffect(() => {
    storage.saveSkills(skills);
  }, [skills]);

  useEffect(() => {
    storage.savePortfolio(portfolio);
  }, [portfolio]);

  useEffect(() => {
    storage.saveCoachMessages(coachMessages);
  }, [coachMessages]);

  useEffect(() => {
    storage.saveAnalysis(analysis);
  }, [analysis]);

  // Complete mission with proof & XP reward (Anti-exploit check)
  const handleProofSubmit = (
    missionId: string,
    proof: MissionProof,
    addToPortfolio: boolean
  ) => {
    const targetMission = missions.find((m) => m.id === missionId);
    if (!targetMission) return;

    // Prevent duplicate XP claiming
    if (targetMission.status === 'COMPLETED') {
      return;
    }

    const prevLevel = calculateLevel(stats.xp).level;
    const gainedXp = targetMission.xp || 100;
    const newTotalXp = stats.xp + gainedXp;
    const newLevel = calculateLevel(newTotalXp).level;

    // Update mission
    const updatedMissions = missions.map((m) => {
      if (m.id === missionId) {
        return {
          ...m,
          status: 'COMPLETED' as MissionStatus,
          completedAt: new Date().toISOString(),
          proofSubmission: proof,
        };
      }
      return m;
    });

    // Update stats
    const updatedStats: UserStats = {
      ...stats,
      xp: newTotalXp,
      level: newLevel,
      completedMissionsCount: stats.completedMissionsCount + 1,
    };

    setMissions(updatedMissions);
    setStats(updatedStats);

    // Optional: Add to portfolio automatically
    if (addToPortfolio) {
      const newProject: PortfolioProject = {
        id: `p-${Date.now()}`,
        title: targetMission.title,
        summary: targetMission.description,
        period: `${new Date().toISOString().split('T')[0]} (미션 완수 산출물)`,
        techStack: targetMission.linkedSkill ? [targetMission.linkedSkill] : ['직무 실무 도구'],
        role: `${profile.name} (단독 수행)`,
        problemSolving: `미션 과제: ${targetMission.completionCondition}\n수행 기록: ${proof.content}\n${proof.notes || ''}`,
        resultsAndImpact: `미션 검증 완료, ${targetMission.xp} XP 획득 및 직무 기술 역량 증빙 확보.`,
        linkedSkills: targetMission.linkedSkill ? [targetMission.linkedSkill] : [],
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPortfolio((prev) => [newProject, ...prev]);
    }

    // Check for level up celebration!
    if (newLevel > prevLevel) {
      setLevelUpData({ level: newLevel, xp: newTotalXp });
    }
  };

  // Add a single mission
  const handleAddMission = (newMission: Mission) => {
    setMissions((prev) => [newMission, ...prev]);
  };

  // Add multiple AI generated missions
  const handleAddGeneratedMissions = (newMissions: Mission[]) => {
    setMissions((prev) => [...newMissions, ...prev]);
  };

  // Update mission status
  const handleUpdateMissionStatus = (id: string, status: MissionStatus) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  };

  // Delete mission
  const handleDeleteMission = (id: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== id));
  };

  // Update skill status
  const handleUpdateSkillStatus = (skillId: string, status: SkillStatus) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, status } : s))
    );
  };

  // Portfolio handlers
  const handleAddProject = (p: PortfolioProject) => {
    setPortfolio((prev) => [p, ...prev]);
  };

  const handleUpdateProject = (p: PortfolioProject) => {
    setPortfolio((prev) => prev.map((item) => (item.id === p.id ? p : item)));
  };

  const handleDeleteProject = (id: string) => {
    setPortfolio((prev) => prev.filter((item) => item.id !== id));
  };

  // Send message to AI Coach
  const handleSendCoachMessage = async (userText: string) => {
    const userMsg: CoachMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...coachMessages, userMsg];
    setCoachMessages(newMessages);

    try {
      const active = missions.filter((m) => m.status !== 'COMPLETED');
      const res = await fetch('/api/ai/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userMessage: userText,
          profile,
          activeMissions: active,
          level: stats.level,
          xp: stats.xp,
        }),
      });

      const data = await res.json();
      const aiMsg: CoachMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: data.reply || '답변을 불러오지 못했습니다.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: '오늘의 미션을 수행하고 경험치를 올려보세요.',
      };

      setCoachMessages([...newMessages, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: CoachMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: '네트워크 연결 상태를 확인해주세요. 잠시 후 다시 시도해주세요.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setCoachMessages([...newMessages, errorMsg]);
    }
  };

  // Refresh Competence Analysis with Gemini
  const handleRefreshAnalysis = async () => {
    try {
      const res = await fetch('/api/ai/competence-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAnalysis({
          ...data.data,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to refresh analysis:', err);
    }
  };

  // Reset all data
  const handleResetAllData = () => {
    storage.resetAll();
    setProfile(DEFAULT_PROFILE);
    setStats(DEFAULT_STATS);
    setMissions(DEFAULT_MISSIONS);
    setSkills(DEFAULT_SKILLS);
    setPortfolio(DEFAULT_PORTFOLIO);
    setCoachMessages(DEFAULT_COACH_MESSAGES);
    setAnalysis(DEFAULT_ANALYSIS);
  };

  // Onboarding complete callback
  const handleOnboardingComplete = (updatedProfile: UserProfile, runAi: boolean = true) => {
    setProfile(updatedProfile);
    setIsOnboardingOpen(false);
    if (runAi) {
      handleRefreshAnalysis();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
        stats={stats}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenCreateMission={() => setIsCreateMissionOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          profile={profile}
          stats={stats}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenCreateMission={() => setIsCreateMissionOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              stats={stats}
              missions={missions}
              analysis={analysis}
              onSelectTab={setCurrentTab}
              onOpenProofModal={(m) => setProofMission(m)}
              onOpenCreateMission={() => setIsCreateMissionOpen(true)}
            />
          )}

          {currentTab === 'missions' && (
            <MissionsView
              missions={missions}
              profile={profile}
              onOpenProofModal={(m) => setProofMission(m)}
              onOpenCreateMission={() => setIsCreateMissionOpen(true)}
              onUpdateMissionStatus={handleUpdateMissionStatus}
              onDeleteMission={handleDeleteMission}
            />
          )}

          {currentTab === 'skill-tree' && (
            <SkillTreeView
              skills={skills}
              missions={missions}
              profile={profile}
              onUpdateSkillStatus={handleUpdateSkillStatus}
              onOpenProofModal={(m) => setProofMission(m)}
            />
          )}

          {currentTab === 'portfolio' && (
            <PortfolioView
              projects={portfolio}
              skills={skills}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {currentTab === 'coach' && (
            <AICoachView
              messages={coachMessages}
              profile={profile}
              missions={missions}
              stats={stats}
              onSendMessage={handleSendCoachMessage}
              onResetChat={() => setCoachMessages(DEFAULT_COACH_MESSAGES)}
            />
          )}

          {currentTab === 'goals' && (
            <GoalsAnalysisView
              profile={profile}
              analysis={analysis}
              onRefreshAnalysis={handleRefreshAnalysis}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              profile={profile}
              onSaveProfile={setProfile}
              onResetAllData={handleResetAllData}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <OnboardingModal
        initialProfile={profile}
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />

      <CreateMissionModal
        isOpen={isCreateMissionOpen}
        onClose={() => setIsCreateMissionOpen(false)}
        profile={profile}
        onAddMission={handleAddMission}
        onAddGeneratedMissions={handleAddGeneratedMissions}
      />

      {proofMission && (
        <MissionProofModal
          mission={proofMission}
          isOpen={!!proofMission}
          onClose={() => setProofMission(null)}
          onSubmitProof={handleProofSubmit}
        />
      )}

      {levelUpData && (
        <LevelUpModal
          level={levelUpData.level}
          xp={levelUpData.xp}
          onClose={() => setLevelUpData(null)}
        />
      )}
    </div>
  );
}
