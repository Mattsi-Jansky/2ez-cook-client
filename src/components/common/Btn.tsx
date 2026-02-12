import type { CSSProperties, ReactNode } from "react";
import css from "./Btn.module.css";

type BtnVariant = "primary" | "success" | "track";

interface BtnProps {
  onClick: () => void;
  children: ReactNode;
  variant?: BtnVariant;
  ghost?: boolean;
  big?: boolean;
  small?: boolean;
  style?: CSSProperties;
}

export function Btn({ onClick, children, variant, ghost, big, small, style: sx }: BtnProps) {
  const className = `${css.btn}${variant && !ghost ? ` ${css[variant]}` : ""}${ghost ? ` ${css.ghost}` : ""}${big ? ` ${css.big}` : ""}${small ? ` ${css.small}` : ""}`;

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
