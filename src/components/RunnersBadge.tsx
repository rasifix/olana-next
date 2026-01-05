interface RunnersBadgeProps {
  count: number;
}

function RunnersBadge({ count }: RunnersBadgeProps) {
  return (
    <span className="badge">
      {count}
    </span>
  );
}

export default RunnersBadge;
