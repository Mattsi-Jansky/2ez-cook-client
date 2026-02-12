import type { CSSProperties, ReactNode, MouseEvent } from "react";

interface BtnProps {
  onClick: () => void;
  children: ReactNode;
  color?: string;
  ghost?: boolean;
  big?: boolean;
  small?: boolean;
  style?: CSSProperties;
}

export function Btn({ onClick, children, color, ghost, big, small, style: sx }: BtnProps) {
  const handleEnter = (e: MouseEvent<HTMLButtonElement>) => {
    (e.target as HTMLElement).style.transform = "scale(1.03)";
  };
  const handleLeave = (e: MouseEvent<HTMLButtonElement>) => {
    (e.target as HTMLElement).style.transform = "scale(1)";
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        marginTop: 20,
        borderRadius: big ? 20 : 16,
        padding: big ? "18px 48px" : small ? "10px 28px" : "14px 36px",
        fontSize: big ? 18 : small ? 14 : 16,
        fontWeight: ghost ? 500 : 700,
        cursor: "pointer",
        fontFamily: "var(--font-body)",
        transition: "all 0.2s",
        ...(ghost
          ? {
              background: "transparent",
              color: "var(--color-muted)",
              border: "2px solid var(--color-border)",
            }
          : {
              background: color || "var(--color-primary)",
              color: "white",
              border: "none",
              boxShadow: `0 4px 16px ${(color || "var(--color-primary)")}44`,
            }),
        ...sx,
      }}
    >
      {children}
    </button>
  );
}
