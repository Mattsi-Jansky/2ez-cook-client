import type { CSSProperties, ReactNode } from "react";
import css from "./Btn.module.css";

type BtnVariant = "primary" | "success" | "track";
type BtnSize = "sm" | "md" | "lg";

interface BtnProps {
  onClick: () => void;
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  ghost?: boolean;
  style?: CSSProperties;
}

export function Btn({ onClick, children, variant, size = "md", ghost, style: sx }: BtnProps) {
  const className = `${css.btn}${variant && !ghost ? ` ${css[variant]}` : ""}${ghost ? ` ${css.ghost}` : ""}${size !== "md" ? ` ${css[size]}` : ""}`;

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
