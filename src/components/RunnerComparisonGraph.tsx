import { useMemo } from 'react';
import { ranking, parseTime, formatTime } from '@rasifix/orienteering-utils';

interface RunnerComparisonGraphProps {
  currentRunner: ranking.RankingRunner;
  comparisonRunner: ranking.RankingRunner;
  onClose: () => void;
}

interface LegComparison {
  legName: string;
  timeDifference: number; // positive if current runner is faster, negative if slower
  cumulativeTimeDifference: number;
}

function RunnerComparisonGraph({ currentRunner, comparisonRunner, onClose }: RunnerComparisonGraphProps) {
  const comparisonData = useMemo(() => {
    const currentSplits = currentRunner.splits || [];
    const comparisonSplits = comparisonRunner.splits || [];

    if (currentSplits.length === 0 || comparisonSplits.length === 0) {
      return [];
    }

    const data: LegComparison[] = [];
    let cumulativeTimeDiff = 0;

    for (let i = 0; i < Math.min(currentSplits.length, comparisonSplits.length); i++) {
      const currentSplit = currentSplits[i];
      const comparisonSplit = comparisonSplits[i];

      // Get leg times
      const currentLegTime = currentSplit.splitTime || 0;
      const comparisonLegTime = comparisonSplit.splitTime || 0;

      // Time difference (positive = current runner faster, negative = current runner slower)
      const timeDiff = comparisonLegTime - currentLegTime;
      cumulativeTimeDiff += timeDiff;

      const legName = `${currentSplit.code}`;

      data.push({
        legName,
        timeDifference: timeDiff,
        cumulativeTimeDifference: cumulativeTimeDiff
      });
    }

    return data;
  }, [currentRunner, comparisonRunner]);

  if (comparisonData.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-6xl w-full">
          <p className="text-gray-500">No comparison data available</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const maxAbsValue = Math.max(
    ...comparisonData.map(d => Math.abs(d.timeDifference)),
    ...comparisonData.map(d => Math.abs(d.cumulativeTimeDifference))
  );

  // Calculate y-axis ticks at minute boundaries
  const yAxisTicks = useMemo(() => {    
    // Determine interval based on range
    let interval: number;
    if (maxAbsValue <= 120) {
      interval = 30; // 30 seconds
    } else if (maxAbsValue <= 300) {
      interval = 60; // 1 minute
    } else if (maxAbsValue <= 600) {
      interval = 120; // 2 minutes
    } else if (maxAbsValue <= 1800) {
      interval = 300; // 5 minutes
    } else {
      interval = 600; // 10 minutes
    }

    const ticks: number[] = [0];
    
    // Add positive ticks
    let tick = interval;
    while (tick <= maxAbsValue) {
      ticks.push(tick);
      tick += interval;
    }
    
    // Add negative ticks
    tick = -interval;
    while (tick >= -maxAbsValue) {
      ticks.push(tick);
      tick -= interval;
    }
    
    return ticks.sort((a, b) => a - b);
  }, [maxAbsValue]);

  const graphHeight = 400;
  const graphWidth = Math.max(800, comparisonData.length * 60);
  const barWidth = Math.min(40, graphWidth / comparisonData.length * 0.7);
  const padding = { top: 40, right: 40, bottom: 80, left: 60 };
  const chartHeight = graphHeight - padding.top - padding.bottom;
  const chartWidth = graphWidth - padding.left - padding.right;
  const zeroY = padding.top + chartHeight / 2;

  const getBarY = (value: number) => {
    const scale = chartHeight / 2 / (maxAbsValue || 1);
    return zeroY - (value * scale);
  };

  const getBarHeight = (value: number) => {
    const scale = chartHeight / 2 / (maxAbsValue || 1);
    return Math.abs(value * scale);
  };

  const getCumulativeLinePoints = () => {
    return comparisonData.map((d, i) => {
      const x = padding.left + (i + 0.5) * (chartWidth / comparisonData.length);
      const y = getBarY(d.cumulativeTimeDifference);
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Runner Comparison</h3>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold text-green-600">{currentRunner.fullName}</span> vs{' '}
              <span className="font-semibold text-blue-600">{comparisonRunner.fullName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-4 flex gap-6 text-sm">
          <div>
            <span className="font-semibold">Total time difference: </span>
            <span className={comparisonData[comparisonData.length - 1].cumulativeTimeDifference > 0 ? 'text-green-600' : 'text-red-600'}>
              {comparisonData[comparisonData.length - 1].cumulativeTimeDifference > 0 ? '+' : ''}
              {formatTime(Math.abs(comparisonData[comparisonData.length - 1].cumulativeTimeDifference))}
            </span>
            {comparisonData[comparisonData.length - 1].cumulativeTimeDifference > 0 
              ? ` (${currentRunner.fullName} is faster)`
              : ` (${currentRunner.fullName} is slower)`
            }
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg width={graphWidth} height={graphHeight} className="mx-auto">
            {/* Grid lines */}
            {yAxisTicks.map((value, i) => (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={getBarY(value)}
                  x2={graphWidth - padding.right}
                  y2={getBarY(value)}
                  stroke={value === 0 ? '#9CA3AF' : '#E5E7EB'}
                  strokeWidth={value === 0 ? '2' : '1'}
                  strokeDasharray={value === 0 ? undefined : '4,4'}
                />
                <text
                  x={padding.left - 10}
                  y={getBarY(value) + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6B7280"
                >
                  {value > 0 ? '+' : ''}{formatTime(Math.abs(value))}
                </text>
              </g>
            ))}

            {/* Bars for each leg */}
            {comparisonData.map((d, i) => {
              const x = padding.left + (i + 0.5) * (chartWidth / comparisonData.length) - barWidth / 2;
              const barY = d.timeDifference >= 0 ? getBarY(d.timeDifference) : zeroY;
              const height = getBarHeight(d.timeDifference);
              const color = d.timeDifference >= 0 ? '#10B981' : '#EF4444';

              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={barY}
                    width={barWidth}
                    height={height}
                    fill={color}
                    opacity="0.7"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={barY + (d.timeDifference >= 0 ? -5 : height + 15)}
                    textAnchor="middle"
                    fontSize="11"
                    fill={color}
                    fontWeight="600"
                  >
                    {d.timeDifference > 0 ? '+' : ''}{formatTime(Math.abs(d.timeDifference))}
                  </text>
                </g>
              );
            })}

            {/* Cumulative line */}
            <polyline
              points={getCumulativeLinePoints()}
              fill="none"
              stroke="#2563EB"
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* Points on cumulative line */}
            {comparisonData.map((d, i) => {
              const x = padding.left + (i + 0.5) * (chartWidth / comparisonData.length);
              const y = getBarY(d.cumulativeTimeDifference);

              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#2563EB"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}

            {/* Leg labels */}
            {comparisonData.map((d, i) => {
              const x = padding.left + (i + 0.5) * (chartWidth / comparisonData.length);
              
              return (
                <text
                  key={i}
                  x={x}
                  y={graphHeight - padding.bottom + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#374151"
                >
                  {d.legName}
                </text>
              );
            })}
          </svg>
        </div>

        <div className="mt-6 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 opacity-70"></div>
            <span>{currentRunner.fullName} faster on this leg</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 opacity-70"></div>
            <span>{currentRunner.fullName} slower on this leg</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-blue-600"></div>
            <span>Cumulative time difference</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default RunnerComparisonGraph;
