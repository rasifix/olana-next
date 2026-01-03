interface RunnersBadgeProps {
  count: number;
}

function RunnersBadge({ count }: RunnersBadgeProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600 border-gray-300 border">
      {count}
    </span>
  );
}

export default RunnersBadge;
