interface RunnersBadgeProps {
  count: number;
}

function RunnersBadge({ count }: RunnersBadgeProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rust-700 text-white">
      {count}
    </span>
  );
}

export default RunnersBadge;
