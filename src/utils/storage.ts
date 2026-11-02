import {
  UserProfile,
  Mission,
  UserStats,
  SkillNode,
  PortfolioProject,
  CoachMessage,
  CompetenceAnalysis,
  MissionDifficulty,
} from '../types';

export const DIFFICULTY_XP: Record<MissionDifficulty, number> = {
  EASY: 100,
  NORMAL: 200,
  HARD: 350,
  EPIC: 500,
};

// Level thresholds:
// Lv 1: 0, Lv 2: 300, Lv 3: 700, Lv 4: 1200, Lv 5: 1800, Lv 6+: +700 per level
export function getLevelThresholds(): number[] {
  const base = [0, 300, 700, 1200, 1800];
  let cur = 1800;
  for (let i = 6; i <= 50; i++) {
    cur += 700;
    base.push(cur);
  }
  return base;
}

export function calculateLevel(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  xpNeededForNextLevel: number;
} {
  const thresholds = getLevelThresholds();
  let level = 1;

  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const currentLevelFloor = thresholds[level - 1] || 0;
  const nextLevelCeil = thresholds[level] || currentLevelFloor + 700;

  const xpInCurrentLevel = xp - currentLevelFloor;
  const xpSpan = nextLevelCeil - currentLevelFloor;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpSpan) * 100)));
  const xpNeededForNextLevel = Math.max(0, nextLevelCeil - xp);

  return {
    level,
    currentLevelXp: xp,
    nextLevelXp: nextLevelCeil,
    progressPercent,
    xpNeededForNextLevel,
  };
}

export function updateStreak(lastActiveDate: string, currentStreak: number): {
  newStreak: number;
  newLastActiveDate: string;
} {
  const today = new Date().toISOString().split('T')[0];
  if (!lastActiveDate) {
    return { newStreak: 1, newLastActiveDate: today };
  }

  if (lastActiveDate === today) {
    return { newStreak: currentStreak || 1, newLastActiveDate: today };
  }

  const lastDate = new Date(lastActiveDate);
  const now = new Date(today);
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { newStreak: (currentStreak || 0) + 1, newLastActiveDate: today };
  } else {
    return { newStreak: 1, newLastActiveDate: today };
  }
}

// Preset Default Data (Korean Tech/Mobility Student)
export const DEFAULT_PROFILE: UserProfile = {
  name: '김민준',
  university: '한국공과대학교',
  major: '기계공학전공',
  grade: '3학년',
  graduationYear: '2026년 2월',
  targetIndustries: ['자동차 및 미래 모빌리티', '로봇 및 드론', '제조업'],
  targetCompany: '현대자동차',
  targetRole: 'R&D 차량설계 및 차체해석 엔지니어',
  certifications: '일반기계기사 필기 합격 (실기 준비중)',
  languageScores: 'TOEIC 830점, OPIc IM2 (목표: IH 이상)',
  skills: 'CATIA V5, SolidWorks, Python(기초), MATLAB, ANSYS 기초',
  experiences: '자작자동차 동아리 섀시 제작팀 (1년), 기계요소설계 캡스톤 A+ 수료',
  dailyStudyHours: 3,
  targetJobDate: '2026-09-01',
  isOnboarded: true,
};

export const DEFAULT_STATS: UserStats = {
  level: 3,
  xp: 850,
  currentStreak: 5,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedMissionsCount: 4,
};

export const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'm-1',
    title: 'CATIA V5 서피스(GSD) 모델링 실습 및 형상 파일 등록',
    description: '차량 유선형 곡면 설계를 위한 Generative Shape Design 기초 실습을 진행하고 3D 모델링 결과물을 캡처 및 저장합니다.',
    category: '기술 습득',
    difficulty: 'NORMAL',
    xp: 200,
    estimatedHours: 4,
    deadline: '2026-11-05',
    status: 'IN_PROGRESS',
    steps: [
      'CATIA GSD 워크벤치 진입 및 Wireframe 툴바(Point, Line, Spline) 복습',
      'Extrude, Revolve, Sweep 기능으로 기본 곡면 생성',
      '차량 사이드미러 외형 모작 모델링 완성',
      '완성된 3D 뷰 캡처 및 CATPart 파일 저장',
    ],
    completionCondition: '직접 제작한 3D 모델 캡처 이미지 또는 작업 파일 업로드',
    recommendedResources: ['유튜브 CATIA 기초 서피스 튜토리얼', '기계설계 표준 핸드북'],
    isDailyMission: true,
    linkedSkill: 'CATIA',
    createdAt: '2026-11-01',
  },
  {
    id: 'm-2',
    title: '현대자동차 최신 지속가능경영보고서 R&D 전략 3대 키워드 분석',
    description: '공식 발표된 현대자동차 지속가능경영보고서에서 SDV(소프트웨어 중심 자동차), 수소/전동화, 차세대 플랫폼 관련 핵심 내용을 1페이지로 정리합니다.',
    category: '기업 분석',
    difficulty: 'EASY',
    xp: 100,
    estimatedHours: 2,
    deadline: '2026-11-04',
    status: 'TODO',
    steps: [
      '현대자동차 공식 홈페이지 IR 자료실에서 최신 보고서 열람',
      '샤시/플랫폼 및 전동화 기술 투자 동향 발췌',
      '지원 직무와의 접점을 정리한 3줄 요약 노트 작성',
    ],
    completionCondition: 'A4 1페이지 분량의 핵심 분석 요약본 등록',
    recommendedResources: ['현대자동차 IR 리포트', 'DART 전자공시시스템'],
    isDailyMission: true,
    linkedSkill: '산업/기업 분석',
    createdAt: '2026-11-01',
  },
  {
    id: 'm-3',
    title: '일반기계기사 실기 작업형 CAD 단면도 및 치수 공차 1도면 완성',
    description: '기사 실기 시험 빈출 기출 도면(동력전달장치 1번)의 2D 부품도 작성 및 IT 공차를 기입합니다.',
    category: '자격증',
    difficulty: 'HARD',
    xp: 350,
    estimatedHours: 6,
    deadline: '2026-11-08',
    status: 'TODO',
    steps: [
      '3D 인벤터/솔리드웍스로 본체, 축, 스퍼기어 모델링',
      '2D AutoCAD로 도면 배치 및 투상도 전개',
      '끼워맞춤 공차(H7, js6 등) 및 표면거칠기 기호 정확히 기입',
      'PDF 도면 출력 및 자가 오작 검수',
    ],
    completionCondition: '완성된 작업형 2D PDF 도면 제출',
    recommendedResources: ['국가기술자격 일반기계기사 실기 가이드북', 'KS 규격집'],
    isDailyMission: false,
    linkedSkill: 'CAD/도면해석',
    createdAt: '2026-11-01',
  },
  {
    id: 'm-4',
    title: 'OPIc 롤플레이(Role-Play) 빈출 질문 5세트 스크립트 작성 및 음성 녹음',
    description: '11~13번 롤플레이 문제 유형(상황 질문, 문제 발생 시 대안 제시)을 완벽 대비합니다.',
    category: '어학',
    difficulty: 'EASY',
    xp: 100,
    estimatedHours: 2,
    deadline: '2026-11-06',
    status: 'TODO',
    steps: [
      '가게 예약 취소, 렌터카 고장 등 빈출 롤플레이 스크립트 작성',
      '어색한 어휘 교정 및 연음 발음 훈련',
      '음성 녹음기 앱으로 녹음 후 발화 속도 체크',
    ],
    completionCondition: '작성한 롤플레이 스크립트 및 녹음 완료 일지 등록',
    recommendedResources: ['OPIc IH/AL 전략집', '네이버 파파고 영어 발음'],
    isDailyMission: false,
    linkedSkill: '영어 스피킹',
    createdAt: '2026-11-01',
  },
  {
    id: 'm-0',
    title: '동역학/재료역학 4대 역학 공식 요약 노트 제작 및 개념 복습',
    description: '기계공학 전공 면접 단골 질문인 모어원, 응력-변형률 선도, 보의 굽힘응력 공식을 한 장에 정리했습니다.',
    category: '전공 공부',
    difficulty: 'NORMAL',
    xp: 200,
    estimatedHours: 3,
    deadline: '2026-10-30',
    status: 'COMPLETED',
    completedAt: '2026-10-30',
    steps: [
      '재료역학 핵심 챕터 복습',
      '공식 유도 과정 3선 필기',
      '전공 구술 면접 예상 질문 5개 작성',
    ],
    completionCondition: '필기 요약 노트 스캔/사진 등록',
    proofSubmission: {
      type: 'image',
      content: '재료역학_핵심공식_요약_A4.pdf',
      fileName: '재료역학_핵심공식_요약_A4.pdf',
      submittedAt: '2026-10-30 18:30',
      notes: '모어원 유도 및 보의 전단력 선도(SFD), 굽힘모멘트 선도(BMD) 핵심 완벽 정리 완료.',
    },
    recommendedResources: ['Beer의 재료역학 8판', '기계공학 전공면접 가이드'],
    isDailyMission: true,
    linkedSkill: '재료역학',
    createdAt: '2026-10-28',
  },
];

export const DEFAULT_SKILLS: SkillNode[] = [
  // 기초 공학
  {
    id: 's-1',
    name: '공업수학 & 동역학',
    category: '기초 공학',
    status: '기본 역량 확보',
    level: 3,
    description: '미분방정식, 라플라스 변환, 진동 해석 기초 및 운동방정식 유도',
    recommendedResources: ['공업수학 Kreyszig 10판', 'Engineering Dynamics'],
    linkedMissions: ['m-0'],
  },
  {
    id: 's-2',
    name: '재료역학 & 응력해석',
    category: '기초 공학',
    status: '프로젝트 완료',
    level: 4,
    description: '응력-변형률 선도, 모어원, 보의 처짐 해석 및 파손 이론',
    recommendedResources: ['재료역학 Beer', '기계구조역학 핸드북'],
    linkedMissions: ['m-0'],
  },
  {
    id: 's-3',
    name: '열역학 & 유체역학',
    category: '기초 공학',
    status: '기본 역량 확보',
    level: 3,
    description: '이상기체 사이클, 냉각 및 배터리 열관리 기초, 나비에-스토크스 유동 이해',
    recommendedResources: ['Cengel 열역학', 'White 유체역학'],
  },
  // 설계 및 해석
  {
    id: 's-4',
    name: 'CAD & 2D 도면 해독',
    category: '설계 및 해석',
    status: '기본 역량 확보',
    level: 3,
    description: 'AutoCAD 도면 투상도 작성, KS 기하공차 및 끼워맞춤 공차 표준 규격 적용',
    recommendedResources: ['KS 기계제도 규격 핸드북'],
    linkedMissions: ['m-3'],
  },
  {
    id: 's-5',
    name: 'CATIA V5 3D 모델링',
    category: '설계 및 해석',
    status: '학습 중',
    level: 2,
    description: 'Part Design 솔리드 모델링 및 Generative Shape Design 곡면 형상 설계',
    recommendedResources: ['Dassault CATIA 공식 튜토리얼', '유튜브 실무 모델링 채널'],
    linkedMissions: ['m-1'],
  },
  {
    id: 's-6',
    name: 'ANSYS 구조해석(FEA)',
    category: '설계 및 해석',
    status: '미학습',
    level: 1,
    description: '유한요소법 기초, 정적 구조 해석, 메시 분할 및 폰 미세스 응력 분석',
    recommendedResources: ['ANSYS Workbench 구조해석 입문'],
  },
  // 미래 기술
  {
    id: 's-7',
    name: 'Python 데이터/엔지니어링 자동화',
    category: '미래 기술',
    status: '기본 역량 확보',
    level: 3,
    description: 'NumPy, Pandas를 활용한 차량 센서 데이터 전처리 및 그래프 시각화',
    recommendedResources: ['점프 투 파이썬', '엔지니어를 위한 파이썬'],
  },
  {
    id: 's-8',
    name: '스마트팩토리 & SDV 기본 지식',
    category: '미래 기술',
    status: '학습 중',
    level: 2,
    description: '제조 지능화, 디지털 트윈, 전동화 플랫폼 아키텍처 이해',
    recommendedResources: ['현대차그룹 테크 테크블로그 (HMG Tech)'],
    linkedMissions: ['m-2'],
  },
  // 비즈니스 & 취업
  {
    id: 's-9',
    name: '영어 스피킹 (OPIc)',
    category: '비즈니스 & 어학',
    status: '학습 중',
    level: 2,
    description: '돌발 질문 답변 능력, 직무 프로젝트 영어 설명, OPIc IH 레벨 목표',
    recommendedResources: ['OPIc 빈출 롤플레이 공략'],
    linkedMissions: ['m-4'],
  },
];

export const DEFAULT_PORTFOLIO: PortfolioProject[] = [
  {
    id: 'p-1',
    title: '대학생 자작자동차 대회 튜블러 스페이스 프레임 섀시 설계 및 비틀림 강성 최적화',
    summary: '경주용 소형 자작차량의 전복 안정성 및 비틀림 강성을 극대화하기 위해 CATIA와 ANSYS를 활용하여 섀시를 직접 설계하고 용접 제작한 프로젝트입니다.',
    period: '2025.03 ~ 2025.10 (8개월)',
    techStack: ['CATIA V5', 'ANSYS Workbench', '알루미늄 6061', 'TIG 용접'],
    role: '섀시 파트 팀장 (프레임 3D 모델링, 비틀림 하중 해석, 파이프 레이저 가공 발주 및 치구 제작 총괄)',
    problemSolving: '초기 설계 프레임의 비틀림 강성이 1,200 N·m/deg로 규정 목표(1,500 N·m/deg)에 미달했습니다. 롤후프와 서스펜션 마운트 지점의 트러스 삼각 구조를 재배치하고 응력 집중부를 보강하여 중량 증가는 단 1.8kg에 그치며 강성을 29% 개선(1,550 N·m/deg)했습니다.',
    resultsAndImpact: '2025 전국 대학생 자작자동차대회(KSAE) Baja 부문 장려상 수상, 내구 레이스 40바퀴 무감점 완주 및 프레임 크랙 0건 달성.',
    linkedSkills: ['CATIA', 'ANSYS', '재료역학', 'CAD'],
    createdAt: '2026-10-25',
  },
];

export const DEFAULT_COACH_MESSAGES: CoachMessage[] = [
  {
    id: 'cm-1',
    sender: 'ai',
    text: `안녕하세요, 김민준님! Career Mission의 AI 전담 취업 코치입니다.

현재 현대자동차 R&D 차량설계 직무를 목표로 Lv.3(850 XP)까지 멋지게 달려오셨네요!
최근 완료하신 **'재료역학 핵심공식 요약'**은 전공 구술 면접의 훌륭한 무기가 될 것입니다.

오늘 무엇부터 시작해야 할지 막막하시다면 아래 추천 질문을 눌러보시거나, 궁금한 점을 언제든 편하게 물어보세요!`,
    timestamp: '2026-11-01 10:00',
    suggestedAction: '오늘의 미션 [CATIA 서피스 모델링]을 시작해보세요.',
  },
];

export const DEFAULT_ANALYSIS: CompetenceAnalysis = {
  overallSummary: '김민준님은 기계공학 핵심 전공 이수와 자작자동차 동아리 실무 경험을 갖추어 기본기가 탄탄합니다. 다만 현대자동차 및 주요 모빌리티 기업 합격을 위해서는 CAD/CATIA의 고난도 곡면 설계 포트폴리오와 OPIc IH 이상의 어학 스펙 보강이 시급합니다.',
  radarChart: [
    {
      domain: '전공 역량',
      currentScore: 78,
      targetScore: 90,
      statusDescription: '4대 역학 이수 완료, 전공 프로젝트 적용 우수',
      targetRequirement: '차량 운동학 및 동역학 해석 역량 심화',
    },
    {
      domain: '기술 역량',
      currentScore: 58,
      targetScore: 85,
      statusDescription: 'SolidWorks 가능, CATIA 서피스/ANSYS 실습 초기',
      targetRequirement: 'CATIA V5 실무 수준 모델링 및 구조/유동해석 능력',
    },
    {
      domain: '자격증',
      currentScore: 65,
      targetScore: 80,
      statusDescription: '일반기계기사 필기 합격, 실기 시험 대비 중',
      targetRequirement: '기계기사 최종 취득 (서류 가산점 및 공학 인증)',
    },
    {
      domain: '어학',
      currentScore: 62,
      targetScore: 80,
      statusDescription: 'TOEIC 830, OPIc IM2 보유',
      targetRequirement: '현대차 서류 우대 기준 OPIc IH 이상 확보',
    },
    {
      domain: '프로젝트',
      currentScore: 82,
      targetScore: 90,
      statusDescription: 'KSAE 자작자동차 대회 섀시 제작 수상 경험',
      targetRequirement: 'STAR 기법으로 수치화된 설계 검증 포트폴리오 2건',
    },
    {
      domain: '경험',
      currentScore: 50,
      targetScore: 75,
      statusDescription: '동아리 중심 활동, 인턴십 경험 부재',
      targetRequirement: '학부연구생 또는 부품사/스타트업 현장실습 경험',
    },
  ],
  gapAnalysis: [
    {
      area: '어학 말하기(OPIc) 등급',
      severity: 'HIGH',
      gapDescription: '현재 OPIc IM2로, 현대차 R&D 서류 합격자 평균(IH 이상) 대비 다소 아쉽습니다.',
      recommendedAction: '3주 집중 스피킹 롤플레이 미션을 수행하여 이번 분기 내 OPIc IH를 달성하세요.',
    },
    {
      area: 'CATIA 곡면(Surface) 및 해석 데이터',
      severity: 'HIGH',
      gapDescription: '차량 외관 및 차체 설계에서 가장 필수적인 CATIA GSD 모델링 결과물이 아직 부족합니다.',
      recommendedAction: '오늘의 추천 미션인 CATIA 서피스 예제 3종을 수행하고 모델링 캡처본을 포트폴리오에 등록하세요.',
    },
    {
      area: '일반기계기사 실기 최종 취득',
      severity: 'MEDIUM',
      gapDescription: '필기는 통과했으나 실기 작업형 캐드 투상도 작도 속도 단축이 필요합니다.',
      recommendedAction: '주 3회 2시간씩 기출 도면을 실전 시간 내 완도하는 연습 미션을 지속하세요.',
    },
  ],
  verifiedNoticeVsGeneralEstimate: {
    verifiedFacts: '현대자동차 공식 채용공고 기준: 기계공학 전공 학사 이상, OPIc IM2 이상 필수 지원 자격 확인.',
    marketEstimate: '최근 합격자 1,200명 표본 분석: R&D 차체/샤시 직무 합격자의 83%가 OPIc IH 이상, 76%가 자작차/학부연구생 등 하드웨어 제작 프로젝트 보유.',
  },
  priorityRoadmap: [
    {
      order: 1,
      title: 'OPIc IH 단기 완성 (3주 집중)',
      duration: '3주 (11월)',
      reason: '모든 대기업 하반기/수시채용 서류 접수 시 가장 강력한 필수 스펙 방어',
    },
    {
      order: 2,
      title: 'CATIA V5 차량 부품 모델링 포트폴리오 2종 등록',
      duration: '4주 (11월~12월)',
      reason: '자작차 프레임 프로젝트와 연계하여 서류 및 1차 직무면접 핵심 증빙 마련',
    },
    {
      order: 3,
      title: '일반기계기사 4회차 실기 작업형 최종 합격',
      duration: '5주 (12월)',
      reason: '국가공인 기계전공 실무 자격 마침표로 기계공학 전공 신뢰도 100% 확보',
    },
  ],
  lastUpdated: new Date().toISOString(),
};

// Storage keys
const STORAGE_KEYS = {
  PROFILE: 'career_mission_profile_v1',
  STATS: 'career_mission_stats_v1',
  MISSIONS: 'career_mission_missions_v1',
  SKILLS: 'career_mission_skills_v1',
  PORTFOLIO: 'career_mission_portfolio_v1',
  COACH: 'career_mission_coach_v1',
  ANALYSIS: 'career_mission_analysis_v1',
};

export const storage = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },
  saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getStats(): UserStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      return data ? JSON.parse(data) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  },
  saveStats(stats: UserStats): void {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  },

  getMissions(): Mission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISSIONS);
      return data ? JSON.parse(data) : DEFAULT_MISSIONS;
    } catch {
      return DEFAULT_MISSIONS;
    }
  },
  saveMissions(missions: Mission[]): void {
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
  },

  getSkills(): SkillNode[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SKILLS);
      return data ? JSON.parse(data) : DEFAULT_SKILLS;
    } catch {
      return DEFAULT_SKILLS;
    }
  },
  saveSkills(skills: SkillNode[]): void {
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  },

  getPortfolio(): PortfolioProject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
      return data ? JSON.parse(data) : DEFAULT_PORTFOLIO;
    } catch {
      return DEFAULT_PORTFOLIO;
    }
  },
  savePortfolio(portfolio: PortfolioProject[]): void {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
  },

  getCoachMessages(): CoachMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COACH);
      return data ? JSON.parse(data) : DEFAULT_COACH_MESSAGES;
    } catch {
      return DEFAULT_COACH_MESSAGES;
    }
  },
  saveCoachMessages(messages: CoachMessage[]): void {
    localStorage.setItem(STORAGE_KEYS.COACH, JSON.stringify(messages));
  },

  getAnalysis(): CompetenceAnalysis {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANALYSIS);
      return data ? JSON.parse(data) : DEFAULT_ANALYSIS;
    } catch {
      return DEFAULT_ANALYSIS;
    }
  },
  saveAnalysis(analysis: CompetenceAnalysis): void {
    localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(analysis));
  },

  resetAll(): void {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.MISSIONS);
    localStorage.removeItem(STORAGE_KEYS.SKILLS);
    localStorage.removeItem(STORAGE_KEYS.PORTFOLIO);
    localStorage.removeItem(STORAGE_KEYS.COACH);
    localStorage.removeItem(STORAGE_KEYS.ANALYSIS);
  },
};
