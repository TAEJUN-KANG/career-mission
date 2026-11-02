export type MissionCategory =
  | '전공 공부'
  | '기술 습득'
  | '자격증'
  | '어학'
  | '프로젝트'
  | '기업 분석'
  | '취업 준비'
  | '포트폴리오';

export type MissionDifficulty = 'EASY' | 'NORMAL' | 'HARD' | 'EPIC';

export type MissionStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface MissionProof {
  type: 'file' | 'link' | 'text' | 'image';
  content: string;
  fileName?: string;
  fileDataUrl?: string;
  submittedAt: string;
  notes?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  xp: number;
  estimatedHours: number;
  deadline: string; // YYYY-MM-DD
  status: MissionStatus;
  completedAt?: string;
  steps: string[];
  completionCondition: string;
  proofSubmission?: MissionProof;
  recommendedResources: string[];
  isDailyMission?: boolean;
  linkedSkill?: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  university: string;
  major: string;
  grade: string; // '1학년' | '2학년' | '3학년' | '4학년' | '졸업생'
  graduationYear: string;
  targetIndustries: string[];
  targetCompany: string;
  targetRole: string;
  certifications: string;
  languageScores: string;
  skills: string;
  experiences: string;
  dailyStudyHours: number;
  targetJobDate: string; // YYYY-MM-DD
  isOnboarded: boolean;
}

export interface UserStats {
  level: number;
  xp: number;
  currentStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  completedMissionsCount: number;
}

export type SkillStatus = '미학습' | '학습 중' | '기본 역량 확보' | '프로젝트 완료' | '숙련';

export interface SkillNode {
  id: string;
  name: string;
  category: string; // e.g., '기초 공학', '설계 및 해석', '미래 기술', '비즈니스 & 어학'
  status: SkillStatus;
  level: number; // 1 to 5
  description: string;
  recommendedResources: string[];
  linkedMissions?: string[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  summary: string;
  period: string; // e.g. 2026.03 ~ 2026.06
  techStack: string[];
  role: string;
  problemSolving: string; // Situation & Action
  resultsAndImpact: string; // Result & Quantifiable outcome
  imageOrFileUrl?: string;
  linkedSkills: string[];
  createdAt: string;
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedAction?: string;
}

export interface RadarDataPoint {
  domain: string;
  currentScore: number;
  targetScore: number;
  statusDescription: string;
  targetRequirement: string;
}

export interface GapItem {
  area: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  gapDescription: string;
  recommendedAction: string;
}

export interface RoadmapMilestone {
  order: number;
  title: string;
  duration: string;
  reason: string;
}

export interface CompetenceAnalysis {
  overallSummary: string;
  radarChart: RadarDataPoint[];
  gapAnalysis: GapItem[];
  verifiedNoticeVsGeneralEstimate: {
    verifiedFacts: string;
    marketEstimate: string;
  };
  priorityRoadmap: RoadmapMilestone[];
  lastUpdated: string;
}

export type NavigationTab =
  | 'dashboard'
  | 'missions'
  | 'skill-tree'
  | 'portfolio'
  | 'coach'
  | 'goals'
  | 'settings';
