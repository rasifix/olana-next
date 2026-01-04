import { ranking, formatTime } from '@rasifix/orienteering-utils';
import { useState, useEffect, useMemo } from 'react';
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
  const { isDarkMode } = useTheme();
  const chartColors = getChartColors(isDarkMode);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [selectedRunner, setSelectedRunner] = useState<number | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(window.innerWidth - 100, 1200);
      const height = Math.min(window.innerHeight - 300, 600);
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

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

    // Drawing parameters
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
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
  }, [runners, dimensions]);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-primary rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-text-primary">Split Analysis</h3>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-secondary text-2xl leading-none"
            >
              ×
            </button>
          </div>
          
          <div className="flex justify-center">
            <div className="relative">
              <svg
                width={dimensions.width}
                height={dimensions.height}
                className="border border-border-default rounded"
              >
              {/* Horizontal grid lines */}
              {[...Array(6)].map((_, i) => {
                const y = padding.top + (i * graphHeight) / 5;
                return (
                  <line
                    key={`hgrid-${i}`}
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
              {runners[0]?.splits?.map((split, i) => {
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
              {runners[0]?.splits?.map((split, i) => {
                const x = getX(split.position);
                if (x === null) return null; // Skip if position is invalid
                return (
                  <text
                    key={`label-${i}`}
                    x={x}
                    y={dimensions.height - padding.bottom + 20}
                    textAnchor="middle"
                    fill={chartColors.infrastructure.text}
                    fontSize="12"
                    fontFamily="sans-serif"
                  >
                    {split.code}
                  </text>
                );
              })}

              {/* Y-axis labels */}
              <text
                x={padding.left - 10}
                y={padding.top + 5}
                textAnchor="end"
                fill={chartColors.infrastructure.text}
                fontSize="12"
                fontFamily="sans-serif"
              >
                {formatTime(minSpread)}
              </text>
              <text
                x={padding.left - 10}
                y={zeroLineY + 5}
                textAnchor="end"
                fill={chartColors.infrastructure.text}
                fontSize="12"
                fontFamily="sans-serif"
              >
                0:00
              </text>
              <text
                x={padding.left - 10}
                y={padding.top + graphHeight + 5}
                textAnchor="end"
                fill={chartColors.infrastructure.text}
                fontSize="12"
                fontFamily="sans-serif"
              >
                {formatTime(maxSpread)}
              </text>

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
                                runnerName: runner.fullName || '',
                              });
                            }}
                            onMouseLeave={() => setHoverInfo(null)}
                          />
                        </g>
                      );
                    })}
                    
                    {/* Start point */}
                    <rect
                      x={padding.left - 3}
                      y={zeroLineY - 3}
                      width="6"
                      height="6"
                      fill={color}
                      opacity={isSelected ? 1 : selectedRunner !== null ? 0.4 : 1}
                    />
                    if (x === null || y === null) return null; // Skip if position is invalid
                      
                    {/* Split points */}
                    {runner.splits.map((split, i) => {
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
                    })}
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
                      fontSize="14"
                      fontFamily="sans-serif"
                      fontWeight={isSelected ? "600" : "400"}
                      opacity={isSelected ? 1 : selectedRunner !== null ? 0.5 : 1}
                    >
                      {runner.fullName}
                    </text>
                  </g>
                );
              })}

              {/* Tooltip */}
              {hoverInfo && (
                <g>
                  {/* Tooltip background */}
                  <rect
                    x={hoverInfo.x + 10}
                    y={hoverInfo.y - 60}
                    width="200"
                    height="84"
                    fill="white"
                    stroke={chartColors.infrastructure.axes}
                    strokeWidth="1"
                    rx="4"
                    opacity="0.95"
                  />
                  {/* Tooltip text */}
                  <text
                    x={hoverInfo.x + 20}
                    y={hoverInfo.y - 40}
                    fill={chartColors.infrastructure.text}
                    fontSize="13"
                    fontFamily="sans-serif"
                    fontWeight="600"
                  >
                    {hoverInfo.runnerName}
                  </text>
                  <text
                    x={hoverInfo.x + 20}
                    y={hoverInfo.y - 24}
                    fill={chartColors.infrastructure.text}
                    fontSize="12"
                    fontFamily="sans-serif"
                  >
                    Control: {hoverInfo.split.code}
                  </text>
                  <text
                    x={hoverInfo.x + 20}
                    y={hoverInfo.y - 10}
                    fill={chartColors.infrastructure.text}
                    fontSize="12"
                    fontFamily="sans-serif"
                  >
                    Split time: {hoverInfo.split.splitTime ? formatTime(hoverInfo.split.splitTime) : 'N/A'}
                  </text>
                  <text
                    x={hoverInfo.x + 20}
                    y={hoverInfo.y + 4}
                    fill={chartColors.infrastructure.text}
                    fontSize="12"
                    fontFamily="sans-serif"
                  >
                    Split rank: {hoverInfo.split.leg.rank || 'N/A'}
                  </text>
                  <text
                    x={hoverInfo.x + 20}
                    y={hoverInfo.y + 18}
                    fill={chartColors.infrastructure.text}
                    fontSize="12"
                    fontFamily="sans-serif"
                  >
                    Ideal: {formatTime(hoverInfo.split.leg.idealBehind || 0)}
                  </text>
                </g>
              )}
            </svg>
            </div>
          </div>

          <div className="mt-4 text-sm text-text-tertiary">
            <p><strong>How to read:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The horizontal dashed line represents the ideal time (0 seconds)</li>
              <li>The ideal time is the average of the fastest 5 runners for each split (to even out anomalies)</li>
              <li>Lines going up indicate the runner is ahead of ideal time (faster)</li>
              <li>Lines going down indicate the runner is behind ideal time (slower)</li>
              <li>The vertical position shows how many seconds ahead or behind</li>
              <li><strong>Click on a runner's line or legend entry to highlight them</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplitGraph;
