interface RunnersBadgeProps {
  count: number;
}

function RunnersBadge({ count }: RunnersBadgeProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-border-default text-text-tertiary border-border-strong border">
      {count}
    </span>
  );
}

export default RunnersBadge;
