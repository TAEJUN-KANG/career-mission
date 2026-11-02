import React, { useState } from 'react';
import { RadarDataPoint } from '../types';

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, size = 380 }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const center = size / 2;
  const radius = (size / 2) - 48; // Leave margin for labels
  const total = data.length;
  const angleStep = (Math.PI * 2) / total;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Build polygon path for target
  const targetPoints = data
    .map((d, i) => {
      const { x, y } = getCoordinates(d.targetScore, i);
      return `${x},${y}`;
    })
    .join(' ');

  // Build polygon path for current
  const currentPoints = data
    .map((d, i) => {
      const { x, y } = getCoordinates(d.currentScore, i);
      return `${x},${y}`;
    })
    .join(' ');

  const hoveredItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          {/* Defs for gradients & filters */}
          <defs>
            <linearGradient id="currentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.25" />
            </linearGradient>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
            </radialGradient>
            <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Background circular glow */}
          <circle cx={center} cy={center} r={radius} fill="url(#centerGlow)" />

          {/* Grid lines (polygons) */}
          {levels.map((level, lvlIdx) => {
            const pts = data
              .map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const r = level * radius;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return `${x},${y}`;
              })
              .join(' ');

            return (
              <g key={`level-${lvlIdx}`}>
                <polygon
                  points={pts}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth={lvlIdx === levels.length - 1 ? 1.5 : 1}
                  strokeDasharray={lvlIdx === levels.length - 1 ? '' : '3,3'}
                />
                {/* Score percentage label on top axis */}
                <text
                  x={center + 4}
                  y={center - level * radius + 11}
                  fontSize="9"
                  fill="#94A3B8"
                  className="select-none font-mono"
                >
                  {Math.round(level * 100)}
                </text>
              </g>
            );
          })}

          {/* Axis lines from center to outer */}
          {data.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            );
          })}

          {/* Target Requirement Polygon (Dotted Amber/Indigo Outline) */}
          <polygon
            points={targetPoints}
            fill="#F59E0B"
            fillOpacity="0.08"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeDasharray="4,3"
          />

          {/* Current User Ability Polygon */}
          <polygon
            points={currentPoints}
            fill="url(#currentGrad)"
            stroke="#4F46E5"
            strokeWidth="2.5"
            filter="url(#subtleShadow)"
          />

          {/* Target points dots */}
          {data.map((d, i) => {
            const { x, y } = getCoordinates(d.targetScore, i);
            return (
              <circle
                key={`target-dot-${i}`}
                cx={x}
                cy={y}
                r="3.5"
                fill="#FFF"
                stroke="#F59E0B"
                strokeWidth="2"
              />
            );
          })}

          {/* Current points dots with hover triggers */}
          {data.map((d, i) => {
            const { x, y } = getCoordinates(d.currentScore, i);
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={`current-dot-${i}`}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 7 : 4.5}
                  fill="#4F46E5"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  className="transition-all duration-200"
                />
                {/* Hit target invisible circle */}
                <circle cx={x} cy={y} r="14" fill="transparent" />
              </g>
            );
          })}

          {/* Domain Labels */}
          {data.map((d, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 24;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);
            const isHovered = hoveredIndex === i;

            // Anchor determination based on position
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (Math.cos(angle) > 0.3) textAnchor = 'start';
            else if (Math.cos(angle) < -0.3) textAnchor = 'end';

            return (
              <g
                key={`label-${i}`}
                className="cursor-pointer select-none"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight={isHovered ? '700' : '600'}
                  fill={isHovered ? '#4338CA' : '#1E293B'}
                  className="transition-colors duration-150"
                >
                  {d.domain}
                </text>
                {/* Score badge under label */}
                <text
                  x={x}
                  y={y + 13}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  fontSize="10"
                  fill="#64748B"
                  className="font-mono"
                >
                  {d.currentScore} / {d.targetScore}점
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredItem && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3.5 py-2 rounded-lg shadow-xl text-xs z-20 pointer-events-none whitespace-nowrap border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <div className="font-semibold text-indigo-300 flex items-center justify-between gap-3">
              <span>{hoveredItem.domain}</span>
              <span className="font-mono">
                현재: <strong className="text-white">{hoveredItem.currentScore}점</strong> | 목표:{' '}
                <strong className="text-amber-400">{hoveredItem.targetScore}점</strong>
              </span>
            </div>
            <div className="text-slate-300 mt-1 max-w-[280px] truncate text-[11px]">
              {hoveredItem.statusDescription}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3.5 h-3.5 rounded bg-indigo-600 shadow-sm" />
          <span className="font-medium text-slate-700">내 현재 역량 (평균 {Math.round(data.reduce((a, b) => a + b.currentScore, 0) / data.length)}점)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3.5 h-1 border-t-2 border-dashed border-amber-500" />
          <span className="font-medium text-slate-700">목표 직무 요구치 (평균 {Math.round(data.reduce((a, b) => a + b.targetScore, 0) / data.length)}점)</span>
        </div>
      </div>
    </div>
  );
};
