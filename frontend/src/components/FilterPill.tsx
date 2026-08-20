interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      className={`filter-pill ${active ? "filter-pill-active" : "filter-pill-inactive"}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
