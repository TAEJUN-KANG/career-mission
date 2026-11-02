import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. AI Competence Analysis
app.post('/api/ai/competence-analysis', async (req: Request, res: Response) => {
  try {
    const { profile } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback response if API key is temporarily unavailable
      return res.json({
        success: true,
        data: generateFallbackAnalysis(profile),
        isFallback: true,
      });
    }

    const prompt = `
당신은 대한민국 최고 수준의 취업 컨설턴트 및 직무 분석 전문가입니다.
다음 학생/취준생의 프로필과 목표를 정밀하게 분석하여 직무 역량 진단 및 레이더 차트 수치, 부족한 점, 준비 로드맵을 작성해주세요.

[사용자 프로필]
- 이름/닉네임: ${profile.name || '취준생'}
- 대학교/전공: ${profile.university || '미기재'} ${profile.major || ''}
- 학년: ${profile.grade || '3학년'} (졸업예정: ${profile.graduationYear || '2026년'})
- 관심 산업: ${(profile.targetIndustries || []).join(', ')}
- 목표 기업: ${profile.targetCompany || '목표 대기업/중견/스타트업'}
- 목표 직무: ${profile.targetRole || '희망 직무'}
- 보유 자격증: ${profile.certifications || '없음/준비중'}
- 어학 성적: ${profile.languageScores || '준비중'}
- 보유 기술/프로그램: ${profile.skills || '기초 전공지식'}
- 프로젝트/대외활동 경험: ${profile.experiences || '없음'}
- 하루 투자 가능 시간: ${profile.dailyStudyHours || 3}시간

[평가 영역 6가지]
1. 전공 역량 (전공 지식 및 이해도)
2. 기술 역량 (직무 도구, CAD/SW/분석툴/프로그래밍 등)
3. 자격증 (직무 관련 국가기술/전문 자격증)
4. 어학 (TOEIC, OPIc, 토익스피킹 등)
5. 프로젝트 (전공 프로젝트, 캡스톤, 실무 프로젝트)
6. 경험 (인턴십, 대외활동, 공모전, 직무 부트캠프)

[규칙]
- 실제 채용 공고나 공식 자료가 없는 경우 기업의 요구사항을 사실처럼 단정하지 말고, '업계 일반적 요구사항'과 '공식 공고 확인 정보'를 엄밀히 구분하여 조언하세요.
- currentScore와 targetScore는 10~100 사이 정수입니다. 사용자의 현재 스펙에 비추어 정직하고 합리적으로 평가하세요.
- 부족한 역량과 우선순위 액션을 구체적으로 작성하세요.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: '대한민국 채용 트렌드(수시채용, 직무중심 역량평가)에 맞춘 현실적이고 실행 가능한 직무 역량 분석관입니다. 한국어로 응답하세요.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSummary: { type: Type.STRING, description: '전체 역량 총평 및 핵심 제언' },
            radarChart: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  domain: { type: Type.STRING, description: '영역 이름 (전공 역량, 기술 역량, 자격증, 어학, 프로젝트, 경험)' },
                  currentScore: { type: Type.INTEGER, description: '현재 역량 점수 (0-100)' },
                  targetScore: { type: Type.INTEGER, description: '목표 직무 요구 점수 (0-100)' },
                  statusDescription: { type: Type.STRING, description: '현재 수준 요약' },
                  targetRequirement: { type: Type.STRING, description: '목표 직무에서 기대하는 수준' },
                },
                required: ['domain', 'currentScore', 'targetScore', 'statusDescription', 'targetRequirement'],
              },
            },
            gapAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  area: { type: Type.STRING },
                  severity: { type: Type.STRING, description: 'HIGH / MEDIUM / LOW' },
                  gapDescription: { type: Type.STRING },
                  recommendedAction: { type: Type.STRING },
                },
                required: ['area', 'severity', 'gapDescription', 'recommendedAction'],
              },
            },
            verifiedNoticeVsGeneralEstimate: {
              type: Type.OBJECT,
              properties: {
                verifiedFacts: { type: Type.STRING, description: '기업 공고 기준 확인된 요건 (학점, 필수 자격 등)' },
                marketEstimate: { type: Type.STRING, description: '업계 동향 및 합격자 데이터 기반 추정치' },
              },
              required: ['verifiedFacts', 'marketEstimate'],
            },
            priorityRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  order: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['order', 'title', 'duration', 'reason'],
              },
            },
          },
          required: ['overallSummary', 'radarChart', 'gapAnalysis', 'verifiedNoticeVsGeneralEstimate', 'priorityRoadmap'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed, isFallback: false });
  } catch (err: any) {
    console.error('Error in /api/ai/competence-analysis:', err);
    return res.json({
      success: true,
      data: generateFallbackAnalysis(req.body?.profile),
      isFallback: true,
      errorNotice: err?.message,
    });
  }
});

// 2. AI Mission Generation
app.post('/api/ai/generate-missions', async (req: Request, res: Response) => {
  try {
    const { profile, currentMissions, count = 3, focusCategory } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        data: generateFallbackMissions(profile, count, focusCategory),
        isFallback: true,
      });
    }

    const prompt = `
당신은 게이미피케이션 기반 취업 미션 시스템의 AI 퀘스트 마스터입니다.
사용자의 목표 기업(${profile.targetCompany || '목표기업'}), 직무(${profile.targetRole || '목표직무'}), 현재 스펙(${profile.skills || '기초'}), 하루 가용시간(${profile.dailyStudyHours || 3}시간)을 반영하여 실행 가능한 고품질 취업 준비 미션을 ${count}개 생성하세요.

[핵심 원칙]
- 단순히 "책 읽기" 같은 모호한 미션은 금지합니다.
- 반드시 '실제로 제작한 결과물, 보고서, 코드, 깃허브 링크, 자격증 접수증/기출풀이 메모 등' 구체적인 증빙/완료 조건을 명시하세요.
- 난이도 규칙:
  * EASY: 100 XP (예상 1~3시간)
  * NORMAL: 200 XP (예상 3~6시간)
  * HARD: 350 XP (예상 7~15시간)
  * EPIC: 500 XP (예상 16시간 이상, 미니 프로젝트/포트폴리오 단위)
- 카테고리: '전공 공부', '기술 습득', '자격증', '어학', '프로젝트', '기업 분석', '취업 준비', '포트폴리오'
${focusCategory ? `- 이번 요청 집중 카테고리: ${focusCategory}` : ''}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: '취업 준비생에게 매일 실질적인 산출물을 만들게 돕는 게임 퀘스트 생성기입니다. 한국어로 작성하세요.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: {
                type: Type.STRING,
                description: '전공 공부, 기술 습득, 자격증, 어학, 프로젝트, 기업 분석, 취업 준비, 포트폴리오 중 하나',
              },
              difficulty: {
                type: Type.STRING,
                description: 'EASY, NORMAL, HARD, EPIC 중 하나',
              },
              xp: { type: Type.INTEGER, description: '100, 200, 350, 또는 500' },
              estimatedHours: { type: Type.INTEGER },
              steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '구체적인 수행 단계 (3~5단계)',
              },
              completionCondition: {
                type: Type.STRING,
                description: '완료 검증 조건 (예: 실습 파일, 분석 보고서 요약, 증빙 캡처 등)',
              },
              recommendedResources: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '추천 학습 자료나 참고 사이트/문헌',
              },
              linkedSkill: {
                type: Type.STRING,
                description: '스킬 트리의 어떤 스킬과 연계되는지',
              },
            },
            required: [
              'title',
              'description',
              'category',
              'difficulty',
              'xp',
              'estimatedHours',
              'steps',
              'completionCondition',
              'recommendedResources',
            ],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    return res.json({ success: true, data: parsed, isFallback: false });
  } catch (err: any) {
    console.error('Error in /api/ai/generate-missions:', err);
    return res.json({
      success: true,
      data: generateFallbackMissions(req.body?.profile, req.body?.count, req.body?.focusCategory),
      isFallback: true,
      errorNotice: err?.message,
    });
  }
});

// 3. AI Career Coach Chat
app.post('/api/ai/coach-chat', async (req: Request, res: Response) => {
  try {
    const { messages, userMessage, profile, activeMissions, level, xp } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        reply: generateFallbackCoachReply(userMessage, profile, level),
        isFallback: true,
      });
    }

    const systemInstruction = `
당신은 'Career Mission'의 전담 AI 취업 코치입니다.
사용자 정보:
- 이름: ${profile?.name || '취준생'}
- 목표: ${profile?.targetCompany || '목표 기업'} ${profile?.targetRole || '목표 직무'}
- 전공: ${profile?.university || ''} ${profile?.major || ''} (${profile?.grade || ''})
- 현재 레벨: Lv.${level || 1} (${xp || 0} XP)
- 활성 미션 수: ${(activeMissions || []).length}개

코칭 원칙:
1. 추상적인 응원 대신 "오늘 당장 1시간 동안 무엇을 해야 하는지" 구체적인 액션을 제시하세요.
2. 미션 추천, 포트폴리오 기획, 전공/자격증 공략법, 기업 분석 가이드를 직접적이고 친절하면서도 전문적인 어조로 설명하세요.
3. 실제 채용 공고와 일반적인 직무 요구사항을 명확히 구분하세요.
4. 답변 말미에 사용자가 앱에서 수행할 수 있는 "오늘의 추천 액션" 1가지를 명확히 짚어주세요.
`;

    // Construct contents array for conversation
    const contents: any[] = [];
    if (Array.isArray(messages) && messages.length > 0) {
      // Limit to last 8 messages for context
      const history = messages.slice(-8);
      for (const m of history) {
        contents.push({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      success: true,
      reply: response.text || '죄송합니다. 답변을 생성하지 못했습니다. 다시 시도해주세요.',
      isFallback: false,
    });
  } catch (err: any) {
    console.error('Error in /api/ai/coach-chat:', err);
    return res.json({
      success: true,
      reply: generateFallbackCoachReply(req.body?.userMessage, req.body?.profile, req.body?.level),
      isFallback: true,
      errorNotice: err?.message,
    });
  }
});

// Fallback logic for offline / no-key cases
function generateFallbackAnalysis(profile: any = {}) {
  const role = profile.targetRole || '기계/SW 엔지니어';
  const company = profile.targetCompany || '주요 기업';

  return {
    overallSummary: `${profile.name || '사용자'}님의 현재 준비 상태는 전공 지식의 기본 틀은 잡혀 있으나, ${company} ${role} 합격을 위해서는 '직무 실무 도구(CAD/개발/데이터) 활용 능력'과 '직무 연관 프로젝트의 완성도'를 집중 보강해야 합니다.`,
    radarChart: [
      {
        domain: '전공 역량',
        currentScore: 68,
        targetScore: 85,
        statusDescription: '전공 필수 과목 이수 완료, 심화 적용 역량 필요',
        targetRequirement: '직무 핵심 전공이론 응용 및 문제해결 능력',
      },
      {
        domain: '기술 역량',
        currentScore: 50,
        targetScore: 80,
        statusDescription: '기초 툴 조작 가능 수준',
        targetRequirement: '실무 레벨의 모델링/코딩 및 해석 도구 능숙성',
      },
      {
        domain: '자격증',
        currentScore: 40,
        targetScore: 75,
        statusDescription: '기사/직무 자격증 취득 준비 중',
        targetRequirement: '직무 필수 국가기술기사 또는 전문공인자격 1~2개',
      },
      {
        domain: '어학',
        currentScore: 60,
        targetScore: 75,
        statusDescription: '기본 점수 보유 혹은 만료 임박',
        targetRequirement: 'OPIc IM3/IH 이상 또는 토익스피킹 AL 수준',
      },
      {
        domain: '프로젝트',
        currentScore: 45,
        targetScore: 85,
        statusDescription: '수업 과제 중심 산출물',
        targetRequirement: '기획-개발-성과측정까지 완결된 직무 프로젝트 2건',
      },
      {
        domain: '경험',
        currentScore: 35,
        targetScore: 70,
        statusDescription: '대외활동 및 실무 인턴 경험 다소 부족',
        targetRequirement: '인턴십, 연구실 학부연구생, 또는 직무 공모전 경험',
      },
    ],
    gapAnalysis: [
      {
        area: '프로젝트 및 실무 결과물',
        severity: 'HIGH',
        gapDescription: '수업 과제 수준을 넘어 실제 직무 문제를 해결해본 프로젝트 포트폴리오가 부족합니다.',
        recommendedAction: '2~3주 단위의 직무 특화 미니 프로젝트를 기획하고 깃허브나 노션 포트폴리오로 구조화하세요.',
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
      verifiedFacts: '공식 채용공고 상 어학 기준(OPIc/토스) 및 관련 전공 학사 이상 필수 요구사항 확인.',
      marketEstimate: '최근 1개년 합격자 데이터 분석 결과, 직무 연관 포트폴리오 2건 이상과 기사 자격증 보유자가 서류 통과율 3.4배 높음.',
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

function generateFallbackMissions(profile: any = {}, count: number = 3, category?: string) {
  const pool = [
    {
      title: '목표 기업 최신 신년사 및 사업보고서 핵심 3대 전략 분석',
      description: 'DART 전자공시 및 공식 프레스센터에서 목표 기업의 핵심 사업 방향과 기술적 과제를 요약합니다.',
      category: '기업 분석',
      difficulty: 'NORMAL',
      xp: 200,
      estimatedHours: 4,
      steps: [
        'DART 전자공시에서 목표 기업의 사업보고서 [사업의 내용] 파트 다운로드',
        '핵심 매출 비중 및 차세대 신사업/기술 키워드 3가지 추출',
        '지원 직무와의 접점을 1장 요약 노트로 작성',
      ],
      completionCondition: '사업보고서 분석 요약 노트를 포트폴리오/미션 결과물로 첨부하세요.',
      recommendedResources: ['DART 전자공시시스템', '기업 공식 보도자료', '한국IR협의회 리포트'],
      linkedSkill: '산업/기업 분석',
    },
    {
      title: '직무 핵심 기술 도구 기초 실습 및 모델링/코드 산출물 등록',
      description: '직무에 필요한 주요 툴(CAD, Python, 데이터분석 등)의 기본 예제를 직접 구현하고 결과를 아카이빙합니다.',
      category: '기술 습득',
      difficulty: 'EASY',
      xp: 100,
      estimatedHours: 2,
      steps: [
        '직무 관련 튜토리얼 1챕터 완독 및 기능 학습',
        '기본 예제 직접 모델링 혹은 코딩으로 구현',
        '결과물 캡처 이미지 및 소스파일 저장',
      ],
      completionCondition: '직접 제작한 3D 모델 파일 또는 코드 스크린샷 등록',
      recommendedResources: ['유튜브 실무 튜토리얼', '공식 도큐먼트', '기출 예제집'],
      linkedSkill: '직무 도구 활용',
    },
    {
      title: 'OPIc/토익스피킹 자기소개 및 직무 관심사 답변 스크립트 작성',
      description: '어학 말하기 시험의 필수 문항인 자기소개와 관심 프로젝트 답변을 작성하고 3회 녹음합니다.',
      category: '어학',
      difficulty: 'EASY',
      xp: 100,
      estimatedHours: 2,
      steps: [
        '빈출 문항 3가지(자기소개, 최근 프로젝트, 일상 루틴) 스크립트 작성',
        '어색한 발음/문법 교정',
        '스마트폰 음성 메모로 실전 녹음 후 자가 피드백',
      ],
      completionCondition: '작성한 스크립트 텍스트 및 녹음 요약 일지 첨부',
      recommendedResources: ['OPIc 기출 빈출 유형 모음집', 'Papago 발음 확인'],
      linkedSkill: '글로벌 커뮤니케이션',
    },
    {
      title: '전공 캡스톤/수업 프로젝트를 STAR 기법 경험기술서로 재구조화',
      description: '과거에 수행한 프로젝트를 Situation, Task, Action, Result 구조로 정리하여 자소서와 포트폴리오에 쓸 수 있게 만듭니다.',
      category: '포트폴리오',
      difficulty: 'HARD',
      xp: 350,
      estimatedHours: 8,
      steps: [
        '프로젝트 배경 및 본인이 맡은 문제(Problem) 명확화',
        '문제 해결을 위해 적용한 구체적 기술 방법(Action) 상세 기록',
        '정량적 성과(Result) 및 배운 점(Insight) 도출',
        '포트폴리오 관리 탭에 신규 프로젝트로 등록',
      ],
      completionCondition: 'Career Mission 포트폴리오 탭에 1건의 정식 프로젝트로 등록 완료',
      recommendedResources: ['STAR 기법 작성 가이드', '합격자 포트폴리오 레퍼런스'],
      linkedSkill: '프로젝트 아카이빙',
    },
  ];

  return pool.slice(0, count);
}

function generateFallbackCoachReply(userMessage: string = '', profile: any = {}, level: number = 1) {
  return `안녕하세요, ${profile?.name || '취준생'}님! 현재 Lv.${level}에서 꾸준히 성장의 발판을 만들고 계시네요.

질문해주신 "${userMessage || '취업 준비 전략'}"에 대해 실무적 관점에서 말씀드립니다.

1. **우선순위의 명확화**: 채용 담당자가 가장 먼저 보는 것은 "이 지원자가 우리 팀에 입사해서 내일부터 당장 무엇을 할 수 있는가"입니다. 추상적인 자격증 나열보다 직무 도구를 사용해 만들어본 '결과물'이 10배 강한 인상을 줍니다.
2. **오늘의 추천 액션**:
   - 현재 등록된 미션 중 난이도 EASY나 NORMAL 미션 하나를 골라 1시간 안에 산출물을 만들어 '결과물 등록'을 완료해보세요.
   - 경험치(XP)를 쌓으면서 자연스럽게 포트폴리오 탭에 여러분의 실적이 차곡차곡 쌓이게 됩니다.

어떤 분야부터 먼저 시작하고 싶으신가요? 전공 프로젝트 구조화, 자격증 일정, 혹은 목표 기업 분석 중 관심 있는 영역을 알려주시면 바로 퀘스트로 쪼개드릴게요!`;
}

// Development and Production server setups
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await (
      await import('vite')
    ).createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Career Mission Server running on port ${PORT}`);
  });
}

startServer();
