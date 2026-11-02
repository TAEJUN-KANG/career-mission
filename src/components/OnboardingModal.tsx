import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Sparkles, Check, ArrowRight, ArrowLeft, Rocket, Briefcase, GraduationCap, Clock, Award } from 'lucide-react';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile, runAiAnalysis?: boolean) => void;
  isOpen: boolean;
}

const AVAILABLE_INDUSTRIES = [
  '자동차 및 미래 모빌리티',
  '로봇 및 드론',
  '반도체',
  '제조업',
  '에너지 및 발전',
  '공기업',
  'IT 및 소프트웨어',
  '바이오/헬스케어',
  '금융/핀테크',
  '기타',
];

const PRESETS: Array<{ label: string; company: string; role: string; major: string; desc: string; data: Partial<UserProfile> }> = [
  {
    label: '현대자동차 모빌리티 R&D',
    company: '현대자동차',
    role: 'R&D 차량설계 및 차체해석 엔지니어',
    major: '기계공학과 3학년',
    desc: 'CATIA, 일반기계기사, OPIc, 자작자동차 프로젝트',
    data: {
      name: '김민준',
      university: '한국공과대학교',
      major: '기계공학과',
      grade: '3학년',
      graduationYear: '2026년 2월',
      targetIndustries: ['자동차 및 미래 모빌리티', '제조업', '로봇 및 드론'],
      targetCompany: '현대자동차',
      targetRole: 'R&D 차량설계 및 차체해석 엔지니어',
      certifications: '일반기계기사 필기 합격',
      languageScores: 'TOEIC 830점, OPIc IM2',
      skills: 'CATIA V5, SolidWorks, Python 기초, ANSYS 기초',
      experiences: '자작자동차 동아리 프레임 제작팀 1년, 기계요소설계 캡스톤',
      dailyStudyHours: 3,
      targetJobDate: '2026-09-01',
    },
  },
  {
    label: '삼성전자 반도체 공정설계',
    company: '삼성전자 DS',
    role: '반도체 공정기술 / 설비기술 엔지니어',
    major: '전자공학과 4학년',
    desc: '반도체 8대 공정, MATLAB, 전기기사, 반도체 실습',
    data: {
      name: '이수진',
      university: '서울과학기술대학교',
      major: '전자전기공학부',
      grade: '4학년',
      graduationYear: '2026년 8월',
      targetIndustries: ['반도체', 'IT 및 소프트웨어', '제조업'],
      targetCompany: '삼성전자 DS부문',
      targetRole: '반도체 공정기술 엔지니어',
      certifications: '전기기사 취득, 무선설비기사 필기',
      languageScores: 'OPIc IH, TOEIC 880점',
      skills: 'MATLAB, C/C++, 반도체 8대 공정 지식, TCAD 기초',
      experiences: '나노종합기술원 공정실습 40시간 수료, 학부연구생 6개월',
      dailyStudyHours: 4,
      targetJobDate: '2026-08-31',
    },
  },
  {
    label: '네이버 클라우드 SW개발자',
    company: '네이버',
    role: '백엔드/플랫폼 소프트웨어 엔지니어',
    major: '컴퓨터공학과 4학년',
    desc: 'Java/Spring, AWS, 알고리즘, 오픈소스 프로젝트',
    data: {
      name: '박준호',
      university: '숭실대학교',
      major: '소프트웨어학부',
      grade: '4학년',
      graduationYear: '2026년 2월',
      targetIndustries: ['IT 및 소프트웨어'],
      targetCompany: '네이버',
      targetRole: '서버 백엔드 엔지니어',
      certifications: '정보처리기사 취득, SQLD',
      languageScores: 'TOEIC Speaking 160(AL)',
      skills: 'Java, Spring Boot, MySQL, Docker, Redis, Git',
      experiences: '웹 서비스 캡스톤 우수상, 동아리 해커톤 2회 참가',
      dailyStudyHours: 4,
      targetJobDate: '2026-07-01',
    },
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onComplete,
  isOpen,
}) => {
  const [step, setStep] = useState<number>(1);
  const [profile, setProfile] = useState<UserProfile>({
    ...initialProfile,
    targetIndustries: initialProfile.targetIndustries || ['자동차 및 미래 모빌리티'],
  });

  if (!isOpen) return null;

  const handleIndustryToggle = (ind: string) => {
    const cur = profile.targetIndustries || [];
    if (cur.includes(ind)) {
      setProfile({ ...profile, targetIndustries: cur.filter((i) => i !== ind) });
    } else {
      setProfile({ ...profile, targetIndustries: [...cur, ind] });
    }
  };

  const applyPreset = (presetData: Partial<UserProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...presetData,
      isOnboarded: true,
    }));
  };

  const handleFinish = (runAi: boolean = true) => {
    onComplete({ ...profile, isOnboarded: true }, runAi);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Rocket className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Career Mission 온보딩</h1>
                <p className="text-indigo-200 text-xs mt-0.5">
                  당신의 취업 준비를 하나의 성장 게임으로 시작합니다
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 text-indigo-100 border border-white/20">
                STEP {step} / 3
              </span>
            </div>
          </div>

          {/* Quick preset selector banner */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-[11px] font-medium text-indigo-200 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>빠른 시작 추천 프로필 (클릭 시 자동 입력):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p.data)}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/15 transition-all text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="font-semibold">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-indigo-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-800 text-base">기본 인적사항 및 학업 정보</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    이름 또는 닉네임 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="예: 김민준"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    대학교 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.university}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                    placeholder="예: 한국공과대학교"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    전공 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.major}
                    onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                    placeholder="예: 기계공학과"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    현재 학년
                  </label>
                  <select
                    value={profile.grade}
                    onChange={(e) => setProfile({ ...profile, grade: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    <option value="1학년">1학년</option>
                    <option value="2학년">2학년</option>
                    <option value="3학년">3학년</option>
                    <option value="4학년">4학년</option>
                    <option value="졸업유예/취준생">졸업유예 / 취업준비생</option>
                    <option value="기졸업자">기졸업자</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    졸업 예정 연도
                  </label>
                  <input
                    type="text"
                    value={profile.graduationYear}
                    onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                    placeholder="예: 2026년 2월"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    하루 평균 투자 가능 시간
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={profile.dailyStudyHours}
                      onChange={(e) =>
                        setProfile({ ...profile, dailyStudyHours: Number(e.target.value) })
                      }
                      className="flex-1 accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-indigo-700 min-w-[50px] text-right">
                      {profile.dailyStudyHours}시간
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-800 text-base">목표 기업 및 관심 산업 설정</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  관심 산업군 (복수 선택 가능) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_INDUSTRIES.map((ind) => {
                    const isSelected = profile.targetIndustries?.includes(ind);
                    return (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => handleIndustryToggle(ind)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{ind}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    목표 기업 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.targetCompany}
                    onChange={(e) => setProfile({ ...profile, targetCompany: e.target.value })}
                    placeholder="예: 현대자동차, 삼성전자, 네이버 등"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    목표 직무 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.targetRole}
                    onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                    placeholder="예: R&D 차량설계, 백엔드 개발자 등"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  취업 목표일 (D-Day 기준일)
                </label>
                <input
                  type="date"
                  value={profile.targetJobDate}
                  onChange={(e) => setProfile({ ...profile, targetJobDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-800 text-base">현재 보유 역량 및 경험 입력</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  보유 자격증 (준비 중인 자격증 포함)
                </label>
                <input
                  type="text"
                  value={profile.certifications}
                  onChange={(e) => setProfile({ ...profile, certifications: e.target.value })}
                  placeholder="예: 일반기계기사 필기 합격, 컴활 1급, 한국사 1급"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  어학 성적 (공인 시험 점수 또는 현재 등급)
                </label>
                <input
                  type="text"
                  value={profile.languageScores}
                  onChange={(e) => setProfile({ ...profile, languageScores: e.target.value })}
                  placeholder="예: TOEIC 830점, OPIc IM2 (준비중인 경우 '준비중' 기재)"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  보유 기술 및 프로그램 활용 능력 (도구, 툴, 언어 등)
                </label>
                <input
                  type="text"
                  value={profile.skills}
                  onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                  placeholder="예: CATIA V5, SolidWorks, Python, MATLAB, ANSYS"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  프로젝트 및 대외활동 / 인턴 경험
                </label>
                <textarea
                  rows={3}
                  value={profile.experiences}
                  onChange={(e) => setProfile({ ...profile, experiences: e.target.value })}
                  placeholder="예: 자작자동차 동아리 섀시 제작팀 (1년), 기계요소설계 캡스톤 프로젝트 수료 등"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">AI 역량 분석 및 맞춤형 퀘스트 생성</span>
                  <p className="text-indigo-700 text-[11px] mt-0.5">
                    완료 즉시 Gemini AI가 목표 기업/직무의 역량 갭을 분석하고, 오늘부터 실행 가능한 맞춤형 미션을 자동 배정합니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>이전</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>다음 단계</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleFinish(true)}
                className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-lg transition-all flex items-center gap-2 shadow-md shadow-indigo-200 cursor-pointer"
              >
                <Rocket className="w-4 h-4 text-amber-300" />
                <span>커리어 미션 시작하기</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
