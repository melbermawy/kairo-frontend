// Simple inline sparkline SVG component
// No external charting library - just a pure SVG path

import { useId } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  showGradient?: boolean;
}

export function Sparkline({
  data,
  width = 60,
  height = 20,
  color = "currentColor",
  className = "",
  showGradient = true,
}: SparklineProps) {
  const id = useId();

  if (!data || data.length < 2) {
    return null;
  }

  // Normalize data to fit in the height
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Calculate points with padding
  const padding = 2;
  const effectiveWidth = width - padding * 2;
  const effectiveHeight = height - padding * 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * effectiveWidth;
    const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
    return { x, y };
  });

  // Build path string
  const pathD = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  // Build area path for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  // Determine if trend is up or down
  const isUptrend = data[data.length - 1] > data[0];
  const gradientId = `sparkline-gradient-${id}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      {showGradient && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor={isUptrend ? "var(--kairo-color-chart-positive)" : "var(--kairo-color-chart-negative)"}
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor={isUptrend ? "var(--kairo-color-chart-positive)" : "var(--kairo-color-chart-negative)"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
      )}

      {showGradient && (
        <path d={areaD} fill={`url(#${gradientId})`} />
      )}

      <path
        d={pathD}
        fill="none"
        stroke={color === "currentColor" ? (isUptrend ? "var(--kairo-color-chart-positive)" : "var(--kairo-color-chart-negative)") : color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2"
        fill={color === "currentColor" ? (isUptrend ? "var(--kairo-color-chart-positive)" : "var(--kairo-color-chart-negative)") : color}
      />
    </svg>
  );
}

// Lifecycle-based sparkline that shows typical trend curves
interface LifecycleSparklineProps {
  lifecycle: "seed" | "rising" | "peaking" | "declining" | "evergreen" | "active";
  className?: string;
}

const lifecycleData: Record<string, number[]> = {
  seed: [10, 12, 11, 15, 18, 22, 28],
  rising: [20, 28, 38, 52, 68, 82, 95],
  peaking: [60, 78, 92, 100, 98, 94, 88],
  declining: [95, 88, 75, 62, 48, 38, 30],
  evergreen: [50, 52, 48, 51, 49, 50, 51],
  active: [45, 55, 48, 62, 58, 65, 60],
};

export function LifecycleSparkline({
  lifecycle,
  className = "",
}: LifecycleSparklineProps) {
  const data = lifecycleData[lifecycle] || lifecycleData.active;

  return (
    <Sparkline
      data={data}
      width={48}
      height={16}
      className={className}
      showGradient={false}
    />
  );
}

Sparkline.displayName = "Sparkline";
LifecycleSparkline.displayName = "LifecycleSparkline";
