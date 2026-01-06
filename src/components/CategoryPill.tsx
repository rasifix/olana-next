interface CategoryPillProps {
  category: string;
  color: string;
  isSelected?: boolean;
  isDimmed?: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function CategoryPill({
  category,
  color,
  isSelected = false,
  isDimmed = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: CategoryPillProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary cursor-pointer transition-opacity"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        backgroundColor: isSelected ? `${color}20` : undefined,
        opacity: isDimmed ? 0.4 : 1,
      }}
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{ 
          backgroundColor: color,
          opacity: isDimmed ? 0.5 : 1,
        }}
      />
      <span className="text-sm font-medium text-text-secondary">{category}</span>
    </div>
  );
}

export default CategoryPill;
