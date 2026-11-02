import React, { useState } from 'react';
import { Mission, MissionProof } from '../types';
import { X, CheckCircle, Upload, Link as LinkIcon, FileText, Zap, Sparkles, FolderPlus } from 'lucide-react';

interface MissionProofModalProps {
  mission: Mission;
  isOpen: boolean;
  onClose: () => void;
  onSubmitProof: (missionId: string, proof: MissionProof, addToPortfolio: boolean) => void;
}

export const MissionProofModal: React.FC<MissionProofModalProps> = ({
  mission,
  isOpen,
  onClose,
  onSubmitProof,
}) => {
  const [proofType, setProofType] = useState<'file' | 'link' | 'text'>('file');
  const [content, setContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [addToPortfolio, setAddToPortfolio] = useState<boolean>(
    mission.category === '프로젝트' || mission.category === '기술 습득'
  );
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
      setContent(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (proofType === 'file' && !fileName && !content) {
      setError('실제 수행한 산출물 파일이나 스크린샷 이미지를 등록해주세요.');
      return;
    }
    if (proofType === 'link' && !content.trim()) {
      setError('증빙 URL (GitHub, 블로그, 노션 등)을 입력해주세요.');
      return;
    }
    if (proofType === 'text' && !content.trim()) {
      setError('수행한 결과 내용 및 요약을 입력해주세요.');
      return;
    }

    const proof: MissionProof = {
      type: proofType,
      content: content.trim() || fileName,
      fileName,
      fileDataUrl,
      submittedAt: new Date().toISOString(),
      notes: notes.trim(),
    };

    onSubmitProof(mission.id, proof, addToPortfolio);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-1 border border-indigo-500/30">
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              보상: +{mission.xp} XP 획득 예정
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white line-clamp-1">
              미션 결과물 등록 & 완료
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{mission.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Required Condition Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
            <span className="font-bold flex items-center gap-1 text-amber-800 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              미션 완료 검증 조건:
            </span>
            <p className="text-amber-800/90 leading-relaxed">{mission.completionCondition}</p>
          </div>

          {/* Proof Type Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              증빙 방식 선택
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProofType('file')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  proofType === 'file'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>파일 / 이미지</span>
              </button>
              <button
                type="button"
                onClick={() => setProofType('link')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  proofType === 'link'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>웹 링크 (URL)</span>
              </button>
              <button
                type="button"
                onClick={() => setProofType('text')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  proofType === 'text'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>요약 텍스트</span>
              </button>
            </div>
          </div>

          {/* Input field depending on type */}
          {proofType === 'file' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                산출물 파일 첨부 (이미지, PDF, 도면, 소스파일 등)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="mission-file-input"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.dwg,.catpart,.sldprt,.zip,.txt,.py,.ipynb,.doc,.docx"
                />
                <label
                  htmlFor="mission-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1 text-xs text-slate-600"
                >
                  <Upload className="w-6 h-6 text-indigo-500 mb-1" />
                  <span className="font-semibold text-indigo-600 hover:underline">
                    클릭하여 파일 업로드
                  </span>
                  <span className="text-[11px] text-slate-400">
                    PNG, JPG, PDF, CAD, 코드 파일 지원 (최대 10MB)
                  </span>
                </label>
                {fileName && (
                  <div className="mt-2 text-xs font-medium text-emerald-700 bg-emerald-50 py-1 px-3 rounded-lg inline-flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>선택됨: {fileName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {proofType === 'link' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                증빙 링크 URL
              </label>
              <input
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://github.com/... 또는 https://notion.site/..."
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          )}

          {proofType === 'text' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                수행 결과 및 요약 기록
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="미션을 수행하며 정리한 핵심 지식, 공식, 코드 구현 내용 등을 요약하여 작성하세요."
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              학습 소감 및 메모 (선택)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="예: 곡면 Sweep 시 가이드 커브 제약 조건 해결 방법을 배움."
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Option: Add to Portfolio */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
            <input
              type="checkbox"
              id="addToPortfolioCheck"
              checked={addToPortfolio}
              onChange={(e) => setAddToPortfolio(e.target.checked)}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600"
            />
            <label htmlFor="addToPortfolioCheck" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5 text-indigo-600" />
                이 결과물을 포트폴리오 탭에 프로젝트로 자동 등록
              </span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                완료한 산출물을 포트폴리오 관리 탭에 구조화하여 저장하고 향후 이력서/자소서 작성에 활용합니다.
              </p>
            </label>
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>결과물 등록하고 +{mission.xp} XP 받기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
