import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StartTimeRunner } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getCombinedChartPalette } from '../utils/chartColors';
import CategoryPill from './CategoryPill';

interface StartTimeGraphProps {
  runners: StartTimeRunner[];
}

function parseTime(timeStr: string): number {
  // Parse HH:MM:SS or MM:SS format to seconds
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function StartTimeGraph({ runners }: StartTimeGraphProps) {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const categoryColors = getCombinedChartPalette(isDarkMode);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const { processedData, categories, minStartTime, maxStartTime, minRunTime, maxRunTime } = useMemo(() => {
    // Filter out runners without valid data
    const validRunners = (runners || []).filter(r => r.startTime && r.time);
    
    // Parse times to seconds
    const data = validRunners.map(runner => ({
      ...runner,
      startTimeSeconds: parseTime(runner.startTime),
      runTimeSeconds: parseTime(runner.time),
    }));

    // Get unique categories
    const categorySet = new Set(data.map(r => r.category));
    const categories = Array.from(categorySet);

    // Find min/max for axes
    const startTimes = data.map(r => r.startTimeSeconds);
    const runTimes = data.map(r => r.runTimeSeconds);

    return {
      processedData: data,
      categories,
      minStartTime: Math.min(...startTimes),
      maxStartTime: Math.max(...startTimes),
      minRunTime: 0, // Always start y-axis at 0
      maxRunTime: Math.max(...runTimes),
    };
  }, [runners]);

  // Graph dimensions
  const width = 1000;
  const height = 600;
  const padding = { top: 40, right: 40, bottom: 60, left: 80 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Create color map for categories
  const categoryColorMap = useMemo(() => {
    const colors: Record<string, string> = {};
    categories.forEach((cat, idx) => {
      colors[cat] = categoryColors[idx % categoryColors.length];
    });
    return colors;
  }, [categories, categoryColors]);

  // Scale functions
  const scaleX = (startTimeSeconds: number) => {
    const range = maxStartTime - minStartTime;
    return padding.left + ((startTimeSeconds - minStartTime) / range) * graphWidth;
  };

  const scaleY = (runTimeSeconds: number) => {
    const range = maxRunTime - minRunTime;
    return padding.top + graphHeight - ((runTimeSeconds - minRunTime) / range) * graphHeight;
  };

  // Generate axis ticks
  const xTicks = useMemo(() => {
    // Round times to minute boundaries for cleaner display
    const minMinutes = Math.floor(minStartTime / 60);
    const maxMinutes = Math.ceil(maxStartTime / 60);
    const rangeMinutes = maxMinutes - minMinutes;
    
    // Determine step size: 5, 10, 15, 20, 30, 60 minutes
    let stepMinutes = 5;
    const targetTicks = 8;
    
    if (rangeMinutes / stepMinutes > targetTicks) {
      stepMinutes = 10;
    }
    if (rangeMinutes / stepMinutes > targetTicks) {
      stepMinutes = 15;
    }
    if (rangeMinutes / stepMinutes > targetTicks) {
      stepMinutes = 20;
    }
    if (rangeMinutes / stepMinutes > targetTicks) {
      stepMinutes = 30;
    }
    if (rangeMinutes / stepMinutes > targetTicks) {
      stepMinutes = 60;
    }
    
    // Generate ticks at step boundaries
    const startTick = Math.floor(minMinutes / stepMinutes) * stepMinutes;
    const ticks = [];
    for (let minutes = startTick; minutes <= maxMinutes; minutes += stepMinutes) {
      const seconds = minutes * 60;
      if (seconds >= minStartTime - 60 && seconds <= maxStartTime + 60) {
        ticks.push({
          value: seconds,
          label: formatTime(seconds)
        });
      }
    }
    
    return ticks;
  }, [minStartTime, maxStartTime]);

  const yTicks = useMemo(() => {
    // Round times to minute boundaries for cleaner display
    const minMinutes = Math.floor(minRunTime / 60);
    const maxMinutes = Math.ceil(maxRunTime / 60);
    const rangeMinutes = maxMinutes - minMinutes;
    
    // Determine step size: 5, 10, 15, 20, 30, 60 minutes
    let stepMinutes = 5;
    const targetTicks = 8;
    
    if (rangeMinutes / stepMinutes > targetTicks) {
      stepMinutes = 10;
    }
    if (rangeMinutes / stepMinutes > targetTicks) {
      stepMinutes = 15;
    }
    if (rangeMinutes / stepMinutes > targetTicks) {
      stepMinutes = 20;
    }
    if (rangeMinutes / stepMinutes > targetTicks) {
      stepMinutes = 30;
    }
    if (rangeMinutes / stepMinutes > targetTicks) {
      stepMinutes = 60;
    }
    
    // Generate ticks at step boundaries
    const startTick = Math.floor(minMinutes / stepMinutes) * stepMinutes;
    const ticks = [];
    for (let minutes = startTick; minutes <= maxMinutes; minutes += stepMinutes) {
      const seconds = minutes * 60;
      if (seconds >= minRunTime - 60 && seconds <= maxRunTime + 60) {
        ticks.push({
          value: seconds,
          label: formatTime(seconds)
        });
      }
    }
    
    return ticks;
  }, [minRunTime, maxRunTime]);

  if (processedData.length === 0) {
    return (
      <div className="bg-surface-primary rounded-lg shadow p-6">
        <p className="text-text-tertiary">{t('message.noSplits')}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-primary rounded-lg shadow p-6">
      <h2 className="page-title">{t('chart.startTimeAnalysis')}</h2>
      
      <div className="mb-4 flex flex-wrap gap-3">
        {categories.map(category => {
          const effectiveCategory = activeCategory || hoveredCategory;
          const isHighlighted = effectiveCategory === category;
          const shouldDim = effectiveCategory && effectiveCategory !== category;
          return (
            <CategoryPill
              key={category}
              category={category}
              color={categoryColorMap[category]}
              isSelected={isHighlighted}
              isDimmed={!!shouldDim}
              onClick={() => setActiveCategory(activeCategory === category ? null : category)}
              onMouseEnter={() => !activeCategory && setHoveredCategory(category)}
              onMouseLeave={() => !activeCategory && setHoveredCategory(null)}
            />
          );
        })}
      </div>

      <svg 
        width={width} 
        height={height} 
        className="border border-border-default rounded"
        onClick={(e) => {
          // Clear active category when clicking on SVG background
          if (e.target === e.currentTarget) {
            setActiveCategory(null);
          }
        }}
      >
        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#374151"
          strokeWidth="2"
        />
        
        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#374151"
          strokeWidth="2"
        />

        {/* X-axis ticks and labels */}
        {xTicks.map(({ value, label }) => {
          const x = scaleX(value);
          return (
            <g key={value}>
              <line
                x1={x}
                y1={height - padding.bottom}
                x2={x}
                y2={height - padding.bottom + 6}
                stroke="#374151"
                strokeWidth="1"
              />
              <text
                x={x}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Y-axis ticks and labels */}
        {yTicks.map(({ value, label }) => {
          const y = scaleY(value);
          return (
            <g key={value}>
              <line
                x1={padding.left - 6}
                y1={y}
                x2={padding.left}
                y2={y}
                stroke="#374151"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#111827"
        >
          {t('navigation.startTimes')}
        </text>
        <text
          x={-height / 2}
          y={20}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#111827"
          transform={`rotate(-90, 20, ${height / 2})`}
        >
          {t('table.time')}
        </text>

        {/* Data points */}
        {processedData.map((runner, idx) => {
          const x = scaleX(runner.startTimeSeconds);
          const y = scaleY(runner.runTimeSeconds);
          const effectiveCategory = activeCategory || hoveredCategory;
          const isHighlighted = effectiveCategory === runner.category;
          const isDimmed = effectiveCategory && effectiveCategory !== runner.category;

          return (
            <g key={`${runner.id}-${idx}`}>
              <circle
                cx={x}
                cy={y}
                r={isHighlighted ? 6 : 4}
                fill={categoryColorMap[runner.category]}
                opacity={isDimmed ? 0.2 : isHighlighted ? 1 : 0.7}
                stroke={isHighlighted ? '#000' : 'none'}
                strokeWidth={isHighlighted ? 1.5 : 0}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCategory(activeCategory === runner.category ? null : runner.category);
                }}
                onMouseEnter={() => !activeCategory && setHoveredCategory(runner.category)}
                onMouseLeave={() => !activeCategory && setHoveredCategory(null)}
                style={{ cursor: 'pointer' }}
              >
                <title>
                  {runner.fullName}
                  {'\n'}Category: {runner.category}
                  {'\n'}Start: {runner.startTime}
                  {'\n'}Time: {runner.time}
                  {runner.club ? `\n${runner.club}` : ''}
                </title>
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default StartTimeGraph;
