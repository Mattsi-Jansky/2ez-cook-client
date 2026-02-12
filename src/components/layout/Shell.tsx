import type { ReactNode } from "react";
import css from "./Shell.module.css";

interface ShellProps {
  background: string;
  children: ReactNode;
}

export function Shell({ background, children }: ShellProps) {
  return (
    <div className={css.shell} style={{ background }}>
      {children}
    </div>
  );
}
