import React, { useState } from 'react';
import { PortfolioProject, SkillNode } from '../types';
import {
  FolderKanban,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Check,
  Calendar,
  Wrench,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';

interface PortfolioViewProps {
  projects: PortfolioProject[];
  skills: SkillNode[];
  onAddProject: (project: PortfolioProject) => void;
  onUpdateProject: (project: PortfolioProject) => void;
  onDeleteProject: (id: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  projects,
  skills,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [period, setPeriod] = useState('');
  const [techStackStr, setTechStackStr] = useState('');
  const [role, setRole] = useState('');
  const [problemSolving, setProblemSolving] = useState('');
  const [resultsAndImpact, setResultsAndImpact] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingProject(null);
    setTitle('');
    setSummary('');
    setPeriod('2026.03 ~ 2026.06');
    setTechStackStr('CATIA, ANSYS, Python');
    setRole('기구설계 및 해석 담당');
    setProblemSolving('');
    setResultsAndImpact('');
    setSelectedSkills([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: PortfolioProject) => {
    setEditingProject(p);
    setTitle(p.title);
    setSummary(p.summary);
    setPeriod(p.period);
    setTechStackStr(p.techStack.join(', '));
    setRole(p.role);
    setProblemSolving(p.problemSolving);
    setResultsAndImpact(p.resultsAndImpact);
    setSelectedSkills(p.linkedSkills || []);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('프로젝트 제목을 입력해주세요.');
      return;
    }
    if (!problemSolving.trim() || !resultsAndImpact.trim()) {
      setFormError('문제 해결 과정과 정량적 성과를 작성해주세요.');
      return;
    }

    const techStack = techStackStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingProject) {
      onUpdateProject({
        ...editingProject,
        title: title.trim(),
        summary: summary.trim(),
        period: period.trim(),
        techStack,
        role: role.trim(),
        problemSolving: problemSolving.trim(),
        resultsAndImpact: resultsAndImpact.trim(),
        linkedSkills: selectedSkills,
      });
    } else {
      const newP: PortfolioProject = {
        id: `p-${Date.now()}`,
        title: title.trim(),
        summary: summary.trim(),
        period: period.trim(),
        techStack,
        role: role.trim(),
        problemSolving: problemSolving.trim(),
        resultsAndImpact: resultsAndImpact.trim(),
        linkedSkills: selectedSkills,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddProject(newP);
    }

    setIsModalOpen(false);
  };

  const copyStarFormat = (p: PortfolioProject) => {
    const text = `[프로젝트 이력서/자소서 기술서]
■ 프로젝트명: ${p.title}
■ 기간: ${p.period}
■ 역할: ${p.role}
■ 사용 기술: ${p.techStack.join(', ')}

1. 주요 개요
${p.summary}

2. 문제 해결 과정 (Situation & Action)
${p.problemSolving}

3. 정량적 성과 및 결과 (Result & Impact)
${p.resultsAndImpact}
`;
    navigator.clipboard.writeText(text);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <FolderKanban className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              직무 포트폴리오 & STAR 경험 관리
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            완료한 미션 결과물과 프로젝트를 STAR(상황-과제-행동-성과) 형식으로 정밀하게 아카이빙합니다.
            서류 전형 자기소개서와 직무 면접에 즉시 복사하여 활용할 수 있습니다.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>새 프로젝트 등록</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">등록된 포트폴리오 프로젝트가 없습니다</h4>
            <p className="text-xs text-slate-400 mt-1">
              미션을 완료하고 결과물을 저장하거나, 상단의 '새 프로젝트 등록'을 클릭하세요.
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {project.period}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      역할: {project.role}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {project.title}
                  </h3>
                </div>

                {/* Top Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyStarFormat(project)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="자소서 STAR 서식으로 복사"
                  >
                    {copiedId === project.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>STAR 복사</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(project)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="수정"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('이 프로젝트를 삭제하시겠습니까?')) {
                        onDeleteProject(project.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {project.summary}
              </p>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5" /> 기술 스택:
                </span>
                {project.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[11px] font-semibold rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* STAR Detail Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Problem Solving (Situation & Action) */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    문제 정의 및 직무 해결 과정 (Action)
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {project.problemSolving}
                  </p>
                </div>

                {/* Results & Impact */}
                <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    정량적 성과 및 결과 (Result & Impact)
                  </div>
                  <p className="text-xs text-emerald-950/80 leading-relaxed whitespace-pre-line">
                    {project.resultsAndImpact}
                  </p>
                </div>
              </div>

              {/* Linked Skills */}
              {project.linkedSkills && project.linkedSkills.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-semibold">연계 직무 역량:</span>
                  {project.linkedSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] rounded font-medium border border-indigo-100"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editingProject ? '프로젝트 수정' : '새 포트폴리오 프로젝트 등록'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  프로젝트명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: CATIA를 활용한 자작자동차 스페이스 프레임 섀시 경량화 설계"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    수행 기간
                  </label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="2026.03 ~ 2026.08 (6개월)"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    담당 역할
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="팀장 / 기구설계 및 CAE 해석 담당"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  프로젝트 개요 (한 줄 요약)
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="프로젝트의 목적과 전체 작업 요약을 기재하세요."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  사용 기술 및 툴 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={techStackStr}
                  onChange={(e) => setTechStackStr(e.target.value)}
                  placeholder="CATIA V5, ANSYS, SolidWorks, Python"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  문제 해결 과정 (Situation & Action) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={problemSolving}
                  onChange={(e) => setProblemSolving(e.target.value)}
                  placeholder="어떤 엔지니어링 문제(강성 부족, 공차 오작 등)가 발생했으며, 본인이 어떤 기술적 조치와 분석을 적용하여 극복했는지 구체적으로 작성하세요."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  결과 및 정량적 성과 (Result & Impact) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={resultsAndImpact}
                  onChange={(e) => setResultsAndImpact(e.target.value)}
                  placeholder="예: 비틀림 강성 29% 개선, 중량 1.8kg 절감, 대회 장려상 수상, 내구 레이스 완주 등 수치 중심으로 기술하세요."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              {formError && <p className="text-xs text-red-600 font-medium">{formError}</p>}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
