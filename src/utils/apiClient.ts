/**
 * Career Mission API Client
 * Safely communicates with /api/* serverless routes,
 * validates HTTP status and Content-Type, and prevents SyntaxError from HTML/text responses.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  reply?: string;
  isFallback?: boolean;
  error?: string;
  errorNotice?: string;
  warning?: string;
}

export async function postApiJson<T = any>(
  endpoint: string,
  payload: any,
  fallbackData?: T
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const status = response.status;
    const contentType = response.headers.get('content-type') || '';

    // Handle non-JSON responses (HTML 404/500, plain text errors)
    if (!contentType.includes('application/json')) {
      const rawSnippet = (await response.text()).slice(0, 150).trim();

      let descriptiveError = '';
      if (status === 404) {
        descriptiveError = `[HTTP 404] API 경로(${endpoint})를 찾을 수 없습니다. Vercel의 Serverless Function(/api 폴더) 배포 및 vercel.json 설정을 확인해주세요.`;
      } else if (status === 401 || status === 403) {
        descriptiveError = `[HTTP ${status}] Gemini API 키 인증에 실패했습니다. Vercel 환경변수(GEMINI_API_KEY) 설정을 확인해주세요.`;
      } else if (status === 429) {
        descriptiveError = `[HTTP 429] Gemini API 요청 한도를 일시적으로 초과했습니다. 잠시 후 다시 시도해주세요.`;
      } else if (status >= 500) {
        descriptiveError = `[HTTP ${status}] 서버 내부 처리 중 오류가 발생했습니다.`;
      } else {
        descriptiveError = `[HTTP ${status}] 서버가 JSON이 아닌 응답(${contentType || 'text'})을 반환했습니다: "${rawSnippet}"`;
      }

      console.warn(`[API Client Warning] ${endpoint}: ${descriptiveError}`);

      if (fallbackData !== undefined) {
        return {
          success: true,
          data: fallbackData,
          isFallback: true,
          errorNotice: descriptiveError,
        };
      }

      return {
        success: false,
        error: descriptiveError,
      };
    }

    // Safe JSON parsing
    const parsedData: ApiResponse<T> = await response.json();
    return parsedData;
  } catch (networkError: any) {
    const errorMsg =
      networkError instanceof TypeError
        ? `네트워크 연결 실패 또는 CORS 오류 (${endpoint})`
        : networkError?.message || '알 수 없는 네트워크 오류';

    console.warn(`[API Client Network Exception] ${endpoint}: ${errorMsg}`);

    if (fallbackData !== undefined) {
      return {
        success: true,
        data: fallbackData,
        isFallback: true,
        errorNotice: `오프라인/네트워크 불안정으로 기본 맞춤 데이터가 생성되었습니다. (${errorMsg})`,
      };
    }

    return {
      success: false,
      error: errorMsg,
    };
  }
}
