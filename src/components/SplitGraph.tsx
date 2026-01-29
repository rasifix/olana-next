import { formatTime, ranking } from '@rasifix/orienteering-utils';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { getChartColorByIndex, getChartColors } from '../utils/chartColors';

interface SplitGraphProps {
  runners: ranking.RankingRunner[];
  onClose: () => void;
}

interface HoverInfo {
  runnerIndex: number;
  splitIndex: number;
  x: number;
  y: number;
  split: ranking.RankingSplit;
  runnerName: string;
}

function SplitGraph({ runners, onClose }: SplitGraphProps) {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const chartColors = getChartColors(isDarkMode);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [hoveredLegIndex, setHoveredLegIndex] = useState<number | null>(null);
  const [selectedRunner, setSelectedRunner] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      const mobile = window.innerWidth < 768;
      const portrait = window.innerHeight > window.innerWidth;
      setIsMobile(mobile);
      setIsPortrait(portrait);

      if (mobile) {
        // On mobile: use a wider canvas for horizontal scrolling
        const numSplits = runners[0]?.splits?.length || 10;
        const minWidth = numSplits * 50 + 80; // 50px per split + padding
        const width = Math.max(minWidth, window.innerWidth - 40);
        const height = portrait ? 280 : Math.min(window.innerHeight - 200, 400);
        setDimensions({ width, height });
      } else {
        // On desktop: fit within the actual container width
        const containerWidth = containerElement?.offsetWidth || window.innerWidth;
        const width = Math.min(containerWidth - 32, 1200); // 32px for some breathing room
        const height = Math.min(window.innerHeight - 300, 600);
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [runners, containerElement]);

  // Check if runners have different courses (different control sequences)
  const hasDifferentCourses = useMemo(() => {
    if (runners.length <= 1) return false;

    const firstControls = runners[0]?.splits?.map(s => s.code).join(',') || '';
    return runners.some(runner => {
      const controls = runner.splits?.map(s => s.code).join(',') || '';
      return controls !== firstControls;
    });
  }, [runners]);

  // Determine which runner's controls to display for grid lines and labels
  const referenceRunner = useMemo(() => {
    if (!hasDifferentCourses) {
      return runners[0]; // All same course, use first runner
    }
    if (selectedRunner !== null && runners[selectedRunner]) {
      return runners[selectedRunner]; // Different courses, use selected runner
    }
    return null; // Different courses but no selection
  }, [runners, hasDifferentCourses, selectedRunner]);

  const graphData = useMemo(() => {
    if (runners.length === 0) return null;

    // Calculate maximum spread across all runners
    const spread = [Number.MAX_VALUE, Number.MIN_VALUE];
    runners.forEach(runner => {
      runner.splits?.forEach(split => {
        const seconds = split.overall?.idealBehind ?? 0;
        if (typeof seconds !== 'number' || isNaN(seconds)) {
          console.warn('Invalid idealBehind value:', split);
          return;
        }
        spread[0] = Math.min(spread[0], seconds);
        spread[1] = Math.max(spread[1], seconds);
      });
    });

    // If no valid data found, set defaults
    if (spread[0] === Number.MAX_VALUE) spread[0] = -15;
    if (spread[1] === Number.MIN_VALUE) spread[1] = 15;

    // Round spread to minute boundaries
    const minSpread = Math.floor(spread[0] / 60) * 60; // Most ahead (most negative)
    const maxSpread = Math.ceil(spread[1] / 60) * 60;  // Most behind (most positive)

    // Drawing parameters - reduce padding on mobile
    const padding = isMobile
      ? { top: 25, right: 20, bottom: 50, left: 40 }
      : { top: 40, right: 40, bottom: 60, left: 60 };
    const graphWidth = dimensions.width - padding.left - padding.right;
    const graphHeight = dimensions.height - padding.top - padding.bottom;

    // Position of the ideal time line (0 line) - proportional to actual range
    const zeroLineY = padding.top + (-minSpread / (maxSpread - minSpread)) * graphHeight;

    return {
      minSpread,
      maxSpread,
      padding,
      graphWidth,
      graphHeight,
      zeroLineY,
    };
  }, [runners, dimensions, isMobile]);

  if (runners.length === 0 || !graphData) {
    return null;
  }

  const { minSpread, maxSpread, padding, graphWidth, graphHeight, zeroLineY } = graphData;

  // Helper function to calculate y position
  const getY = (idealBehind: number | null | undefined): number | null => {
    const value = idealBehind ?? 0;
    if (typeof value !== 'number' || isNaN(value)) {
      return null; // Return null for invalid values
    }
    const normalizedPosition = (value - minSpread) / (maxSpread - minSpread);
    return padding.top + normalizedPosition * graphHeight;
  };

  // Helper function to calculate x position
  const getX = (position: number | null | undefined): number | null => {
    const value = position ?? 0;
    if (typeof value !== 'number' || isNaN(value)) {
      return null; // Return null for invalid values
    }
    return padding.left + value * graphWidth;
  };

  // Calculate nice time intervals for grid lines
  const getTimeGridLines = () => {
    const range = maxSpread - minSpread;
    let interval: number;

    // Choose appropriate interval based on range
    if (range <= 60) {
      interval = 10; // 10 second intervals
    } else if (range <= 180) {
      interval = 30; // 30 second intervals
    } else if (range <= 720) {
      interval = 60; // 1 minute intervals
    } else if (range <= 1440) {
      interval = 120; // 2 minute intervals
    } else {
      interval = 300; // 5 minute intervals
    }

    const gridLines: number[] = [];
    // Start from the first interval boundary at or below minSpread
    const start = Math.floor(minSpread / interval) * interval;
    for (let time = start; time <= maxSpread; time += interval) {
      gridLines.push(time);
    }
    return gridLines;
  };

  const timeGridLines = getTimeGridLines();

  return (
    <div ref={setContainerElement}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="section-heading">{t('chart.splitAnalysis')}</h3>
        <button
          onClick={onClose}
          className="text-2xl text-text-muted hover:text-text-primary transition-colors"
        >
          ←
        </button>
      </div>

      {/* Hover info display */}
      <div className="mb-2 h-6 flex items-center text-sm">
        {hoverInfo ? (
          <span className="text-text-primary font-medium">
            {hoverInfo.runnerName} • {t('table.control')}: {hoverInfo.split.code} • {t('table.splitTime')}: {hoverInfo.split.splitTime ? formatTime(hoverInfo.split.splitTime) : 'N/A'} • {t('table.splitRank')}: {hoverInfo.split.leg.rank || 'N/A'} • {t('table.behind')}: {hoverInfo.split.leg.behind ? formatTime(hoverInfo.split.leg.behind) : '0:00'}
          </span>
        ) : (
          <span className="text-text-muted">{t('chart.hoverForDetails')}</span>
        )}
      </div>

      {/* Rotation hint for portrait mobile */}
      {isMobile && isPortrait && (
        <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-yellow-600 dark:text-yellow-400">
            {t('chart.rotateDeviceHint') || 'Rotate your device to landscape for a better view'}
          </span>
        </div>
      )}

      <div className={isMobile ? "overflow-x-auto min-h-[150px]" : "flex justify-center min-h-[150px]"}>
        <div className={isMobile ? "relative" : "relative max-w-full"}>
          <svg
            width={dimensions.width}
            height={dimensions.height}
            className={isMobile ? "border border-border-default rounded" : "border border-border-default rounded max-w-full"}
          >
            {/* Leg background highlighting */}
            {referenceRunner?.splits?.map((split, i) => {
              const x1 = i === 0 ? padding.left : getX(referenceRunner.splits[i - 1].position);
              const x2 = getX(split.position);
              if (x1 === null || x2 === null) return null;

              const isHovered = hoveredLegIndex === i;

              return (
                <rect
                  key={`leg-bg-${i}`}
                  x={x1}
                  y={padding.top}
                  width={x2 - x1}
                  height={graphHeight}
                  fill={isDarkMode ? '#374151' : '#f3f4f6'}
                  opacity={isHovered ? 0.3 : 0}
                  className="cursor-pointer transition-opacity duration-150"
                  onMouseEnter={() => setHoveredLegIndex(i)}
                  onMouseLeave={() => setHoveredLegIndex(null)}
                />
              );
            })}

            {/* Horizontal grid lines at time boundaries */}
            {timeGridLines.map((time) => {
              const y = getY(time);
              if (y === null) return null;
              return (
                <line
                  key={`hgrid-${time}`}
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke={chartColors.infrastructure.gridLines}
                  strokeWidth="1"
                />
              );
            })}

            {/* Vertical grid lines (at each control) */}
            {referenceRunner?.splits?.map((split, i) => {
              const x = getX(split.position);
              if (x === null) return null; // Skip if position is invalid
              return (
                <line
                  key={`vgrid-${i}`}
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + graphHeight}
                  stroke={chartColors.infrastructure.gridLines}
                  strokeWidth="1"
                />
              );
            })}

            {/* Ideal time line (0 line) */}
            <line
              id="ideal-time-line"
              x1={padding.left}
              y1={zeroLineY}
              x2={padding.left + graphWidth}
              y2={zeroLineY}
              stroke={chartColors.infrastructure.zeroLine}
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Axes */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + graphHeight}
              stroke={chartColors.infrastructure.axes}
              strokeWidth="2"
            />
            <line
              x1={padding.left}
              y1={padding.top + graphHeight}
              x2={padding.left + graphWidth}
              y2={padding.top + graphHeight}
              stroke={chartColors.infrastructure.axes}
              strokeWidth="2"
            />

            {/* Control labels */}
            {referenceRunner?.splits?.map((split, i) => {
              const x = getX(split.position);
              if (x === null) return null; // Skip if position is invalid
              return (
                <text
                  key={`label-${i}`}
                  x={x}
                  y={dimensions.height - padding.bottom + 20}
                  textAnchor="middle"
                  fill={chartColors.infrastructure.text}
                  fontSize={isMobile ? "10" : "12"}
                  fontFamily="sans-serif"
                >
                  {split.code}
                </text>
              );
            })}

            {/* Y-axis labels at time boundaries */}
            {timeGridLines.map((time) => {
              const y = getY(time);
              if (y === null) return null;
              return (
                <text
                  key={`ylabel-${time}`}
                  x={padding.left - 10}
                  y={y + 5}
                  textAnchor="end"
                  fill={chartColors.infrastructure.text}
                  fontSize={isMobile ? "10" : "12"}
                  fontFamily="sans-serif"
                >
                  {formatTime(time)}
                </text>
              );
            })}

            {/* Runner lines */}
            {runners
              .map((runner, index) => ({ runner, index }))
              .sort((a, b) => {
                // Draw selected runner last (on top)
                if (a.index === selectedRunner) return 1;
                if (b.index === selectedRunner) return -1;
                return 0;
              })
              .map(({ runner, index: runnerIndex }) => {
                const color = getChartColorByIndex(runnerIndex, isDarkMode);
                const isSelected = runnerIndex === selectedRunner;
                if (!runner.splits || runner.splits.length === 0) return null;

                return (
                  <g
                    key={`runner-${runnerIndex}`}
                    onClick={() => setSelectedRunner(isSelected ? null : runnerIndex)}
                    className="cursor-pointer"
                  >
                    {/* Line segments from start to first split and between splits */}
                    {runner.splits.map((split, i) => {
                      const x2 = getX(split.position);
                      const y2 = getY(split.overall?.idealBehind);
                      // Skip if current split has invalid position
                      if (x2 === null || y2 === null) return null;

                      let x1: number | null, y1: number | null;
                      if (i === 0) {
                        // First segment: from start to first split
                        x1 = padding.left;
                        y1 = zeroLineY;
                      } else {
                        // Subsequent segments: from previous split to current
                        const prevSplit = runner.splits[i - 1];
                        x1 = getX(prevSplit.position);
                        y1 = getY(prevSplit.overall?.idealBehind);
                        // Skip if previous split has invalid position
                        if (x1 === null || y1 === null) return null
                      }

                      return (
                        <g key={`segment-${runnerIndex}-${i}`}>
                          {/* Visible line */}
                          <line
                            id={`line-${runnerIndex}-${i}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={color}
                            strokeWidth={isSelected ? "3.5" : "2.5"}
                            strokeLinecap="round"
                            pointerEvents="none"
                            opacity={isSelected ? 1 : selectedRunner !== null ? 0.4 : 1}
                          />
                          {/* Invisible wider line for hover detection */}
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="transparent"
                            strokeWidth="15"
                            strokeLinecap="round"
                            className="cursor-pointer"
                            onMouseEnter={() => {
                              setHoverInfo({
                                runnerIndex,
                                splitIndex: i,
                                x: x2,
                                y: y2,
                                split,
                                runnerName: runner.team || runner.fullName || '',
                              });
                            }}
                            onMouseLeave={() => setHoverInfo(null)}
                          />
                        </g>
                      );
                    })}

                    {/* Start point */}
                    { /*<rect
                      x={padding.left - 3}
                      y={zeroLineY - 3}
                      width="6"
                      height="6"
                      fill={color}
                      opacity={isSelected ? 1 : selectedRunner !== null ? 0.4 : 1}
                    />
                    */ }
                    if (x === null || y === null) return null; // Skip if position is invalid

                    {/* Split points */}
                    { /* runner.splits.map((split, i) => {
                      const x = getX(split.position);
                      const y = getY(split.overall?.idealBehind);
                      if (x === null || y === null) return null;
                      return (
                        <rect
                          key={`point-${runnerIndex}-${i}`}
                          x={x - 3}
                          y={y - 3}
                          width="6"
                          height="6"
                          fill={color}
                          opacity={isSelected ? 1 : selectedRunner !== null ? 0.4 : 1}
                        />
                      );
                    }) */}
                  </g>
                );
              })}

            {/* Legend */}
            {runners.map((runner, index) => {
              const color = getChartColorByIndex(index, isDarkMode);
              const isSelected = index === selectedRunner;
              const row = Math.floor(index / 5);
              const col = index % 5;
              const legendItemWidth = graphWidth / Math.min(runners.length, 5);
              const x = padding.left + col * legendItemWidth;
              const y = padding.top + graphHeight + 40 + row * 20;

              return (
                <g
                  key={`legend-${index}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRunner(isSelected ? null : index);
                  }}
                  className="cursor-pointer"
                >
                  <rect
                    x={x}
                    y={y - 2}
                    width="20"
                    height="3"
                    fill={color}
                    opacity={isSelected ? 1 : selectedRunner !== null ? 0.4 : 1}
                  />
                  <text
                    x={x + 25}
                    y={y + 3}
                    fill={chartColors.infrastructure.text}
                    fontSize={isMobile ? "11" : "14"}
                    fontFamily="sans-serif"
                    fontWeight={isSelected ? "600" : "400"}
                    opacity={isSelected ? 1 : selectedRunner !== null ? 0.5 : 1}
                  >
                    {runner.team || runner.fullName}
                  </text>
                </g>
              );
            })}

          </svg>
        </div>
      </div>
    </div>
  );
}

export default SplitGraph;
