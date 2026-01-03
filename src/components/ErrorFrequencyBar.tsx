import { getColorForFrequency } from '../utils/colors';

interface ErrorFrequencyBarProps {
  errorFrequency: number;
}

function ErrorFrequencyBar({ errorFrequency }: ErrorFrequencyBarProps) {
  const bgColor = getColorForFrequency(errorFrequency);

  return (
    <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden flex items-center justify-end pr-3">
      <div
        className="absolute left-0 top-0 h-full transition-all duration-300"
        style={{
          width: `${errorFrequency}%`,
          backgroundColor: bgColor
        }}
      />
      <div className="relative z-10 text-sm font-semibold text-gray-800">
        {errorFrequency}%
      </div>
    </div>
  );
}

export default ErrorFrequencyBar;
