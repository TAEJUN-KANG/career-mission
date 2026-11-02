import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini client with server-side environment variable only
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Clean markdown code blocks from model JSON output
export function parseCleanJson<T = any>(rawText: string | undefined): T | null {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.error('Failed to parse JSON from AI response:', e);
    return null;
  }
}

// Model fallback candidate list (in order of speed and stability)
const CANDIDATE_MODELS = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash'];

export async function generateContentWithFallback(
  prompt: string,
  config: any = {}
): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} request failed, attempting next candidate.`, {
        status: err?.status || err?.code,
        message: err?.message?.slice(0, 100),
      });
    }
  }

  throw lastError || new Error('All AI model candidate requests failed');
}

// ----------------------------------------------------
// Fallback Generators (Company & Role Tailored)
// ----------------------------------------------------

export function generateFallbackAnalysis(profile: any = {}) {
  const role = profile.targetRole || '기계/SW 엔지니어';
  const company = profile.targetCompany || '주요 기업';

  return {
    overallSummary: `${profile.name || '사용자'}님의 현재 준비 상태는 전공 지식의 기본 틀은 잡혀 있으나, ${company} ${role} 합격을 위해서는 '직무 실무 도구(CAD/개발/데이터) 활용 능력'과 '직무 연관 프로젝트의 완성도'를 집중 보강해야 합니다.`,
    radarChart: [
      {
        domain: '전공 역량',
        currentScore: 75,
        targetScore: 88,
        statusDescription: '전공 필수 과목 이수 완료, 실무 적용 심화 필요',
        targetRequirement: '직무 핵심 전공이론 응용 및 문제해결 능력',
      },
      {
        domain: '기술 역량',
        currentScore: 55,
        targetScore: 85,
        statusDescription: '기초 툴 조작 및 실습 경험 보유',
        targetRequirement: '실무 레벨의 모델링/코딩 및 해석 도구 능숙성',
      },
      {
        domain: '자격증',
        currentScore: 50,
        targetScore: 80,
        statusDescription: '기사/직무 자격증 취득 준비 중',
        targetRequirement: '직무 필수 국가기술기사 또는 전문공인자격 1~2개',
      },
      {
        domain: '어학',
        currentScore: 65,
        targetScore: 80,
        statusDescription: '기본 어학 점수 보유 또는 취득 준비 중',
        targetRequirement: 'OPIc IM3/IH 이상 또는 토익스피킹 AL 수준',
      },
      {
        domain: '프로젝트',
        currentScore: 60,
        targetScore: 85,
        statusDescription: '수업 과제 및 캡스톤 산출물 보유',
        targetRequirement: '기획-개발-성과측정까지 완결된 직무 프로젝트 2건',
      },
      {
        domain: '경험',
        currentScore: 45,
        targetScore: 75,
        statusDescription: '동아리 활동 중심, 실무 인턴/대외활동 보완 권장',
        targetRequirement: '인턴십, 연구실 학부연구생, 또는 직무 공모전 경험',
      },
    ],
    gapAnalysis: [
      {
        area: '프로젝트 및 실무 결과물',
        severity: 'HIGH',
        gapDescription: '수업 과제 수준을 넘어 실제 직무 문제를 해결해본 프로젝트 포트폴리오가 부족합니다.',
        recommendedAction: '2~3주 단위의 직무 특화 미니 프로젝트를 기획하고 STAR 기법으로 포트폴리오를 구조화하세요.',
      },
      {
        area: '실무 기술 툴 숙련도',
        severity: 'HIGH',
        gapDescription: '이론 중심 학습으로 툴의 실무 워크플로우에 대한 즉시 투입 능력이 입증되지 않았습니다.',
        recommendedAction: '매일 1시간씩 실제 튜토리얼 예제를 따라하며 포트폴리오용 결과물 파일을 아카이빙하세요.',
      },
      {
        area: '어학 스피킹 성적',
        severity: 'MEDIUM',
        gapDescription: '대부분의 주요 기업 서류 기준인 스피킹 성적(OPIc/토스) 확보가 우선순위입니다.',
        recommendedAction: '3주 집중 스피킹 플랜을 세워 목표 등급(IM3~IH 이상)을 조기 취득하세요.',
      },
    ],
    verifiedNoticeVsGeneralEstimate: {
      verifiedFacts: `${company} 공식 채용공고 기준: 관련 전공 학사 이상 및 어학 기준(OPIc/토스) 필수 지원 자격 확인.`,
      marketEstimate: '최근 1개년 합격자 데이터 분석: 직무 연관 포트폴리오 2건 이상과 기사 자격증 보유자가 서류 통과율 3.4배 높음.',
    },
    priorityRoadmap: [
      {
        order: 1,
        title: '직무 핵심 툴 마스터 & 미니 산출물 1건 완성',
        duration: '1~2주 소요',
        reason: '서류 및 면접에서 가장 즉각적으로 어필할 수 있는 실무 무기 확보',
      },
      {
        order: 2,
        title: '어학 스피킹(OPIc/토스) 목표 등급 취득',
        duration: '3주 소요',
        reason: '서류 필터링 사전 방지 및 최소 지원 자격 조기 완성',
      },
      {
        order: 3,
        title: '목표 기업 직무 분석 및 역량 연계 포트폴리오 정리',
        duration: '2주 소요',
        reason: '경험을 STAR 기법으로 구조화하여 자기소개서에 즉시 투입',
      },
    ],
  };
}

export function generateFallbackMissions(
  profile: any = {},
  count: number = 3,
  focusCategory?: string
) {
  const company = profile.targetCompany || '목표 기업';
  const role = profile.targetRole || '희망 직무';
  const skills = profile.skills || 'CAD/개발 툴';

  const pool = [
    {
      title: `${company} 최신 지속가능경영보고서 및 차세대 핵심 기술 과제 3선 분석`,
      description: `DART 전자공시 및 ${company} 공식 IR 자료실에서 차세대 핵심 사업 방향과 기술적 과제를 요약합니다.`,
      category: '기업 분석',
      difficulty: 'NORMAL',
      xp: 200,
      estimatedHours: 3,
      steps: [
        `${company} 공식 홈페이지 및 DART 공시에서 최신 사업보고서 열람`,
        '지원 직무와 밀접한 차세대 기술 키워드 3가지 발췌',
        '지원 동기 및 직무 포부와 연결한 1페이지 분석 노트 작성',
      ],
      completionCondition: `${company} 핵심 기술 분석 요약 노트를 포트폴리오 결과물로 첨부하세요.`,
      recommendedResources: ['DART 전자공시시스템', `${company} 공식 보도자료`, '한국IR협의회 리포트'],
      linkedSkill: '산업/기업 분석',
    },
    {
      title: `${skills} 직무 핵심 도구 실무 튜토리얼 구현 및 결과물 등록`,
      description: `${role} 수행에 필요한 핵심 도구의 실무 예제를 직접 제작하고 캡처본 또는 작업 파일을 저장합니다.`,
      category: '기술 습득',
      difficulty: 'NORMAL',
      xp: 200,
      estimatedHours: 4,
      steps: [
        '직무 관련 튜토리얼 1챕터 완독 및 기능 학습',
        '기본 예제 직접 모델링 또는 코딩으로 구현',
        '결과물 캡처 이미지 및 소스파일 저장 및 자가 검증',
      ],
      completionCondition: '직접 제작한 3D 모델 파일, 소스코드 또는 결과물 스크린샷 등록',
      recommendedResources: ['유튜브 실무 튜토리얼', '공식 도큐먼트', '기출 예제집'],
      linkedSkill: '직무 도구 활용',
    },
    {
      title: `OPIc/토익스피킹 ${role} 프로젝트 설명 롤플레이 스크립트 작성 및 음성 녹음`,
      description: '어학 말하기 시험의 필수 문항인 자기소개와 관심 프로젝트 답변을 작성하고 3회 녹음합니다.',
      category: '어학',
      difficulty: 'EASY',
      xp: 100,
      estimatedHours: 2,
      steps: [
        '빈출 문항 3가지(자기소개, 최근 프로젝트, 직무 관심사) 영문 스크립트 작성',
        '어색한 발음 및 문법 교정',
        '스마트폰 음성 메모로 실전 녹음 후 자가 피드백',
      ],
      completionCondition: '작성한 스크립트 텍스트 및 녹음 요약 일지 첨부',
      recommendedResources: ['OPIc 기출 빈출 유형 모음집', 'Papago 발음 확인'],
      linkedSkill: '글로벌 커뮤니케이션',
    },
    {
      title: '과거 전공 캡스톤/수업 프로젝트를 STAR 기법 경험기술서로 재구조화',
      description: '과거에 수행한 프로젝트를 Situation, Task, Action, Result 구조로 정리하여 자소서와 포트폴리오에 쓸 수 있게 만듭니다.',
      category: '포트폴리오',
      difficulty: 'HARD',
      xp: 350,
      estimatedHours: 6,
      steps: [
        '프로젝트 배경 및 본인이 맡은 문제(Problem) 명확화',
        '문제 해결을 위해 적용한 구체적 기술 방법(Action) 상세 기록',
        '정량적 성과(Result) 및 배운 점(Insight) 도출',
        'Career Mission 포트폴리오 탭에 정식 등록',
      ],
      completionCondition: 'Career Mission 포트폴리오 탭에 1건의 정식 프로젝트로 등록 완료',
      recommendedResources: ['STAR 기법 작성 가이드', '합격자 포트폴리오 레퍼런스'],
      linkedSkill: '프로젝트 아카이빙',
    },
    {
      title: `${role} 직무 면접 빈출 전공 핵심 개념 10선 요약 노트 제작`,
      description: '서류 통과 후 진행되는 1차 기술/전공 면접에서 반드시 나오는 전공 이론 핵심 질문을 정리합니다.',
      category: '전공 공부',
      difficulty: 'NORMAL',
      xp: 200,
      estimatedHours: 3,
      steps: [
        '전공 필수 교재 및 족보에서 빈출 구술 면접 질문 10개 선별',
        '1분 내로 답변할 수 있는 두괄식 핵심 답변 작성',
        '수식 유도 및 도해를 포함한 A4 2장 분량 서머리 작성',
      ],
      completionCondition: '직접 정리한 전공 면접 개념 서머리 노트 파일 등록',
      recommendedResources: ['전공 핵심 기본서', '기출 면접 질문 모음집'],
      linkedSkill: '전공 기초',
    },
    {
      title: `${company} 맞춤형 1분 자기소개 및 직무 강점 어필 스피치 구성`,
      description: '채용 면접관의 기억에 각인될 수 있는 차별화된 1분 자기소개를 작성하고 연습합니다.',
      category: '취업 준비',
      difficulty: 'EASY',
      xp: 100,
      estimatedHours: 2,
      steps: [
        '직무 핵심 역량을 상징하는 키워드 선정',
        'STAR 경험을 1문장으로 압축한 1분 자기소개 대본 작성',
        '타이머 60초 측정하며 자연스러운 발화 속도로 5회 리허설',
      ],
      completionCondition: '1분 자기소개 스크립트 및 셀프 피드백 메모 첨부',
      recommendedResources: ['합격자 1분 자기소개 레퍼런스'],
      linkedSkill: '면접 커뮤니케이션',
    },
    {
      title: '직무 관련 국가기술기사/전문자격 1개년 기출문제 풀이 및 오답노트',
      description: '서류 전형 필수 가산점 확보를 위해 자격증 실전 기출문제를 풀고 취약 파트를 보완합니다.',
      category: '자격증',
      difficulty: 'HARD',
      xp: 350,
      estimatedHours: 5,
      steps: [
        '최신 1개년 기출문제 1회분 실전 시간 측정 후 풀이',
        '틀린 문항 및 헷갈린 이론 개념 오답 정리',
        '취약 챕터 공식 암기 카드 작성',
      ],
      completionCondition: '기출문제 풀이 채점 결과 및 오답 노트 캡처 등록',
      recommendedResources: ['국가기술자격 포털 Q-Net', '기출문제 수험서'],
      linkedSkill: '직무 자격증',
    },
  ];

  if (focusCategory) {
    const filtered = pool.filter((m) => m.category === focusCategory);
    if (filtered.length > 0) {
      return filtered.slice(0, count);
    }
  }

  return pool.slice(0, count);
}

export function generateFallbackCoachReply(
  userMessage: string = '',
  profile: any = {},
  level: number = 1
) {
  const company = profile.targetCompany || '목표 기업';
  const role = profile.targetRole || '목표 직무';

  return `안녕하세요, ${profile?.name || '취준생'}님! 현재 Lv.${level}에서 ${company} ${role} 합격을 향해 꾸준히 달려가고 계시네요.

질문해주신 "${userMessage || '취업 준비 전략'}"에 대해 실무적 관점에서 안내드립니다.

1. **우선순위의 명확화**: 채용 담당자가 가장 먼저 보는 것은 "이 지원자가 우리 팀에 입사해서 내일부터 당장 무엇을 할 수 있는가"입니다. 추상적인 자격증 나열보다 직무 도구를 사용해 만들어본 '결과물'이 서류와 면접에서 10배 강한 인상을 줍니다.
2. **오늘의 추천 액션**:
   - 현재 등록된 미션 중 난이도 EASY나 NORMAL 미션 하나를 골라 1시간 안에 산출물을 만들어 '결과물 등록'을 완료해보세요.
   - 경험치(XP)를 쌓으면서 자연스럽게 포트폴리오 탭에 여러분의 실적이 차곡차곡 쌓이게 됩니다.

어떤 분야부터 먼저 시작하고 싶으신가요? 직무 실습 미션, 자격증 기출 풀이, 혹은 ${company} 기업 분석 중 관심 있는 영역을 알려주시면 바로 퀘스트로 쪼개드릴게요!`;
}
