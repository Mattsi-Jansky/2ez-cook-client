import type { ReactNode } from "react";

interface ShellProps {
  background: string;
  children: ReactNode;
}

export function Shell({ background, children }: ShellProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background,
        fontFamily: "var(--font-body)",
      }}
    >
      {children}
    </div>
  );
}
