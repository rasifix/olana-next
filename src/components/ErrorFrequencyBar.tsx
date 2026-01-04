import { getColorForFrequency } from '../utils/chartColors';
import { useTheme } from '../contexts/ThemeContext';

interface ErrorFrequencyBarProps {
  errorFrequency: number;
}

function ErrorFrequencyBar({ errorFrequency }: ErrorFrequencyBarProps) {
  const { isDarkMode } = useTheme();
  const bgColor = getColorForFrequency(errorFrequency, isDarkMode);

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
        className="h-3 bg-border-default rounded-full flex-1"
      />
      {/* Percentage text */}
      <div className="text-sm font-semibold text-text-primary ml-2 min-w-[3rem] text-right">
        {errorFrequency}%
      </div>
    </div>
  );
}

export default ErrorFrequencyBar;
