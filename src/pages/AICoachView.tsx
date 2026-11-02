import React, { useState, useRef, useEffect } from 'react';
import { CoachMessage, UserProfile, Mission, UserStats } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  User,
  Zap,
  Target,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface AICoachViewProps {
  messages: CoachMessage[];
  profile: UserProfile;
  missions: Mission[];
  stats: UserStats;
  onSendMessage: (userText: string) => Promise<void>;
  onResetChat?: () => void;
}

const QUICK_PROMPTS = [
  '오늘 1시간 안에 끝낼 수 있는 가장 효과적인 미션은 무엇인가요?',
  '목표 기업 서류/면접에서 차별화할 수 있는 핵심 기술 키워드를 알려주세요.',
  '현재 제 스펙에서 가장 시급하게 보완해야 할 약점 1가지는?',
  '작성한 프로젝트를 STAR 기법으로 더 매력적으로 다듬는 조언을 해주세요.',
];

export const AICoachView: React.FC<AICoachViewProps> = ({
  messages,
  profile,
  missions,
  stats,
  onSendMessage,
  onResetChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    setInputText('');
    setIsLoading(true);
    try {
      await onSendMessage(text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Top Coach Info Bar */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Career Mission 전담 AI 코치</h2>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 font-semibold px-2 py-0.2 rounded-full">
                Gemini AI 기반
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{profile.name}님 프로필</span>
              <span>·</span>
              <span>{profile.targetCompany} {profile.targetRole}</span>
              <span>·</span>
              <span>Lv.{stats.level} ({stats.xp} XP)</span>
            </p>
          </div>
        </div>

        {onResetChat && (
          <button
            onClick={onResetChat}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="대화 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">대화 초기화</span>
          </button>
        )}
      </div>

      {/* Grounding Notice Badge */}
      <div className="bg-indigo-50/70 border-b border-indigo-100 px-4 py-2 text-[11px] text-indigo-900 flex items-center gap-2 shrink-0">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span>
          AI 코치는 사용자의 전공, 목표 기업, 현재 진행 중인 미션({missions.filter((m) => m.status !== 'COMPLETED').length}건)을 실시간 참조하여 답변합니다.
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-3xl ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-amber-300" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line font-medium">{msg.text}</div>

                {/* Suggested Action Pill */}
                {msg.suggestedAction && !isUser && (
                  <div className="pt-2 border-t border-slate-200/80 flex items-center gap-1.5 text-indigo-700 font-bold text-[11px]">
                    <Zap className="w-3 h-3 fill-indigo-600" />
                    <span>추천 액션: {msg.suggestedAction}</span>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right font-mono ${
                    isUser ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5 max-w-xl mr-auto animate-in fade-in">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-amber-300" />
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>
                {profile.targetCompany} {profile.targetRole} 직무 분석 및 맞춤 답변 작성 중...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-200/80 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-500" /> 빠른 질문:
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-[11px] bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3.5 bg-white border-t border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="취업 고민, 직무 역량 분석, 포트폴리오 첨삭 질문을 입력하세요..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-slate-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">전송</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
