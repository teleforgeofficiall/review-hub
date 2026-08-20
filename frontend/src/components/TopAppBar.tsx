interface TopAppBarProps {
  title: string;
  onBack?: () => void;
  rightIcon?: string;
  onRightClick?: () => void;
}

export default function TopAppBar({
  title,
  onBack,
  rightIcon,
  onRightClick,
}: TopAppBarProps) {
  return (
    <header className="top-app-bar">
      <div className="w-10 flex-shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors active:scale-95"
            style={{ color: "#191c1e" }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
      </div>

      <h1
        className="text-base font-bold flex-1 text-center truncate"
        style={{ color: "#191c1e" }}
      >
        {title}
      </h1>

      <div className="w-10 flex-shrink-0 flex justify-end">
        {rightIcon && (
          <button
            onClick={onRightClick}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors active:scale-95"
            style={{ color: "#191c1e" }}
          >
            <span className="material-symbols-outlined">{rightIcon}</span>
          </button>
        )}
      </div>
    </header>
  );
}
