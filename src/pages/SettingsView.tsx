import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  Settings,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle,
  Bell,
  Briefcase,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onResetAllData: () => void;
  onOpenOnboarding: () => void;
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

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onSaveProfile,
  onResetAllData,
  onOpenOnboarding,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [dDayAlert, setDDayAlert] = useState(true);

  const handleIndustryToggle = (ind: string) => {
    const cur = formData.targetIndustries || [];
    if (cur.includes(ind)) {
      setFormData({ ...formData, targetIndustries: cur.filter((i) => i !== ind) });
    } else {
      setFormData({ ...formData, targetIndustries: [...cur, ind] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Export JSON
  const handleExportData = () => {
    const fullData = {
      profile: formData,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career_mission_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Settings className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">프로필 및 환경 설정</h2>
          </div>
          <p className="text-xs text-slate-500">
            목표 기업, 전공, 보유 역량 및 알림 설정을 관리합니다.
          </p>
        </div>

        <button
          onClick={onOpenOnboarding}
          className="px-3.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>온보딩 마법사 다시 열기</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">인적사항 및 학업 정보</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                이름 또는 닉네임
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                대학교
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                전공
              </label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                현재 학년
              </label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white"
              >
                <option value="1학년">1학년</option>
                <option value="2학년">2학년</option>
                <option value="3학년">3학년</option>
                <option value="4학년">4학년</option>
                <option value="졸업유예/취준생">졸업유예/취준생</option>
                <option value="기졸업자">기졸업자</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                졸업 예정 연도
              </label>
              <input
                type="text"
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                하루 평균 투자 시간 ({formData.dailyStudyHours}시간)
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={formData.dailyStudyHours}
                onChange={(e) =>
                  setFormData({ ...formData, dailyStudyHours: Number(e.target.value) })
                }
                className="w-full accent-indigo-600 cursor-pointer mt-2"
              />
            </div>
          </div>
        </div>

        {/* Target Job & Industries */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">목표 기업 및 직무</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              관심 산업군 (복수 선택)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_INDUSTRIES.map((ind) => {
                const isSelected = formData.targetIndustries?.includes(ind);
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => handleIndustryToggle(ind)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {ind}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                목표 기업
              </label>
              <input
                type="text"
                value={formData.targetCompany}
                onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                목표 직무
              </label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              취업 목표일 (D-Day 카운트다운)
            </label>
            <input
              type="date"
              value={formData.targetJobDate}
              onChange={(e) => setFormData({ ...formData, targetJobDate: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white"
            />
          </div>
        </div>

        {/* Competence & Skills Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">보유 역량 및 스펙 상세</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                보유 자격증
              </label>
              <input
                type="text"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                어학 성적
              </label>
              <input
                type="text"
                value={formData.languageScores}
                onChange={(e) => setFormData({ ...formData, languageScores: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                보유 기술 / 툴
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                프로젝트 및 대외활동 경험
              </label>
              <textarea
                rows={2}
                value={formData.experiences}
                onChange={(e) => setFormData({ ...formData, experiences: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Notifications & Data Management */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">알림 및 데이터 백업</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800">매일 아침 일일 미션 알림</span>
                <p className="text-slate-500 text-[11px]">오늘 수행할 퀘스트를 대시보드 최상단에 고정합니다.</p>
              </div>
              <input
                type="checkbox"
                checked={dailyReminder}
                onChange={(e) => setDailyReminder(e.target.checked)}
                className="rounded text-indigo-600 w-4 h-4 accent-indigo-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800">취업 목표 D-Day 카운트다운 표시</span>
                <p className="text-slate-500 text-[11px]">상단 헤더에 잔여 준비 일수를 표시합니다.</p>
              </div>
              <input
                type="checkbox"
                checked={dDayAlert}
                onChange={(e) => setDDayAlert(e.target.checked)}
                className="rounded text-indigo-600 w-4 h-4 accent-indigo-600"
              />
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportData}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>데이터 백업 (JSON 내보내기)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    '정말 모든 미션과 프로필 데이터를 초기화하시겠습니까? 초기 기본 데이터로 복구됩니다.'
                  )
                ) {
                  onResetAllData();
                }
              }}
              className="px-3 py-1.5 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>전체 데이터 초기화</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              프로필이 성공적으로 저장되었습니다!
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>설정 저장하기</span>
          </button>
        </div>
      </form>
    </div>
  );
};
