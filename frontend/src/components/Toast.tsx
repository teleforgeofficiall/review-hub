import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = type === "success" ? "check_circle" : "error";

  return (
    <div className={`toast toast-${type}`}>
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      <span>{message}</span>
    </div>
  );
}
