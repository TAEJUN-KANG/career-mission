import { Type } from '@google/genai';
import {
  generateContentWithFallback,
  parseCleanJson,
  generateFallbackAnalysis,
  getGeminiClient,
} from '../_gemini';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. POST is required.',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { profile = {} } = body;

    const ai = getGeminiClient();
    if (!ai) {
      console.warn('GEMINI_API_KEY is not configured in Vercel. Using fallback analysis.');
      return res.status(200).json({
        success: true,
        data: generateFallbackAnalysis(profile),
        isFallback: true,
        warning: 'Vercel 환경변수에 GEMINI_API_KEY가 설정되지 않아 기본 진단 결과가 표시되었습니다.',
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
`;

    const rawJsonText = await generateContentWithFallback(prompt, {
      systemInstruction: '대한민국 채용 트렌드(수시채용, 직무중심 역량평가)에 맞춘 현실적이고 실행 가능한 직무 역량 분석관입니다. 한국어로 응답하세요.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallSummary: { type: Type.STRING },
          radarChart: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                domain: { type: Type.STRING },
                currentScore: { type: Type.INTEGER },
                targetScore: { type: Type.INTEGER },
                statusDescription: { type: Type.STRING },
                targetRequirement: { type: Type.STRING },
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
                severity: { type: Type.STRING },
                gapDescription: { type: Type.STRING },
                recommendedAction: { type: Type.STRING },
              },
              required: ['area', 'severity', 'gapDescription', 'recommendedAction'],
            },
          },
          verifiedNoticeVsGeneralEstimate: {
            type: Type.OBJECT,
            properties: {
              verifiedFacts: { type: Type.STRING },
              marketEstimate: { type: Type.STRING },
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
    });

    const parsed = parseCleanJson(rawJsonText);
    if (parsed && parsed.radarChart) {
      return res.status(200).json({
        success: true,
        data: parsed,
        isFallback: false,
      });
    }

    return res.status(200).json({
      success: true,
      data: generateFallbackAnalysis(profile),
      isFallback: true,
    });
  } catch (err: any) {
    console.error('Error in /api/ai/competence-analysis:', {
      status: err?.status || err?.code,
      message: err?.message?.slice(0, 100),
    });

    return res.status(200).json({
      success: true,
      data: generateFallbackAnalysis(req.body?.profile),
      isFallback: true,
      errorNotice: 'AI 서비스 일시적 지연으로 인해 기본 직무 분석 데이터가 표시됩니다.',
    });
  }
}
