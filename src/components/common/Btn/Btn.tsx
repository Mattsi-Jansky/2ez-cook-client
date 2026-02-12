import type { CSSProperties, ReactNode } from "react";
import css from "./Btn.module.css";

type BtnVariant = "primary" | "success" | "track" | "ghost";
type BtnSize = "sm" | "md" | "lg";

interface BtnProps {
  onClick: () => void;
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  style?: CSSProperties;
}

export function Btn({ onClick, children, variant = "primary", size = "md", style: sx }: BtnProps) {
  const className = `${css.btn} ${css[variant]}${size !== "md" ? ` ${css[size]}` : ""}`;

  return (
    <button
      onClick={onClick}
      className={className}
      style={sx}
    >
      {children}
    </button>
  );
}
