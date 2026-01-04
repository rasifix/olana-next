import { getColorForFrequency } from '../utils/colors';

interface ErrorFrequencyBarProps {
  errorFrequency: number;
}

function ErrorFrequencyBar({ errorFrequency }: ErrorFrequencyBarProps) {
  const bgColor = getColorForFrequency(errorFrequency);

  return (
    <div className="flex items-center gap-1 w-full">
      {/* Filled bar */}
      <div
        className="h-3 rounded-full transition-all duration-300"
        style={{
          width: `${errorFrequency}%`,
          backgroundColor: bgColor
        }}
      />
      {/* Unfilled bar */}
      <div
        className="h-3 bg-gray-200 rounded-full flex-1"
      />
      {/* Percentage text */}
      <div className="text-sm font-semibold text-gray-800 ml-2 min-w-[3rem] text-right">
        {errorFrequency}%
      </div>
    </div>
  );
}

export default ErrorFrequencyBar;
