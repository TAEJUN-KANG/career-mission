import { Type } from '@google/genai';
import {
  generateContentWithFallback,
  parseCleanJson,
  generateFallbackMissions,
  getGeminiClient,
} from '../_gemini';

export default async function handler(req: any, res: any) {
  // CORS and Headers
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
    const { profile = {}, count = 3, focusCategory } = body;

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback if GEMINI_API_KEY is not set in Vercel environment
      console.warn('GEMINI_API_KEY is not configured in Vercel. Using tailored fallback generator.');
      return res.status(200).json({
        success: true,
        data: generateFallbackMissions(profile, count, focusCategory),
        isFallback: true,
        warning: 'Vercel 환경변수에 GEMINI_API_KEY가 설정되지 않아 사전 구성된 맞춤 미션이 제공되었습니다.',
      });
    }

    const company = profile.targetCompany || '목표 기업';
    const role = profile.targetRole || '목표 직무';
    const skills = profile.skills || '기초 전공지식';
    const hours = profile.dailyStudyHours || 3;

    const prompt = `
당신은 게이미피케이션 기반 취업 미션 시스템의 AI 퀘스트 마스터입니다.
지원자 목표 기업(${company}), 직무(${role}), 현재 스펙(${skills}), 하루 가용시간(${hours}시간)을 바탕으로 실행 가능한 취업 준비 미션을 정확히 ${count}개 생성하세요.

[핵심 원칙]
- 단순히 "책 읽기" 같은 모호한 미션은 금지합니다.
- 반드시 '실제로 제작한 결과물, 보고서, 3D 모델링, 코드, 깃허브 링크, 자격증 접수증/기출풀이 메모 등' 구체적인 증빙/완료 조건을 명시하세요.
- difficulty 값은 반드시 'EASY', 'NORMAL', 'HARD', 'EPIC' 중 하나여야 합니다.
- xp 값은 난이도에 따라 EASY: 100, NORMAL: 200, HARD: 350, EPIC: 500 중 하나로 부여하세요.
- category 값은 '전공 공부', '기술 습득', '자격증', '어학', '프로젝트', '기업 분석', '취업 준비', '포트폴리오' 중 하나여야 합니다.
${focusCategory ? `- 이번 요청 집중 카테고리: ${focusCategory}` : ''}
`;

    const rawJsonText = await generateContentWithFallback(prompt, {
      systemInstruction: '취업 준비생에게 매일 실질적인 산출물을 만들게 돕는 게임 퀘스트 생성기입니다. 한국어로 작성하세요.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            xp: { type: Type.INTEGER },
            estimatedHours: { type: Type.INTEGER },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            completionCondition: { type: Type.STRING },
            recommendedResources: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            linkedSkill: { type: Type.STRING },
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
    });

    const parsed = parseCleanJson(rawJsonText);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return res.status(200).json({
        success: true,
        data: parsed,
        isFallback: false,
      });
    }

    // If parse failed, use fallback
    return res.status(200).json({
      success: true,
      data: generateFallbackMissions(profile, count, focusCategory),
      isFallback: true,
    });
  } catch (err: any) {
    console.error('Error in /api/ai/generate-missions:', {
      status: err?.status || err?.code,
      message: err?.message?.slice(0, 100),
    });

    const fallbackData = generateFallbackMissions(
      req.body?.profile,
      req.body?.count || 3,
      req.body?.focusCategory
    );

    return res.status(200).json({
      success: true,
      data: fallbackData,
      isFallback: true,
      errorNotice: 'AI 서비스 일시적 지연으로 인해 직무 맞춤 퀘스트가 대체 생성되었습니다.',
    });
  }
}
