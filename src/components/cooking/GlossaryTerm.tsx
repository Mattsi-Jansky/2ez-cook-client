import { useState, useEffect, useRef } from "react";
import type { GlossaryEntry } from "../../types";

interface GlossaryTermProps {
  term: string;
  info: GlossaryEntry;
}

export function GlossaryTerm({ term, info }: GlossaryTermProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <span ref={ref} style={{ position: "relative", display: "inline" }}>
      <span
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(!open)}
        style={{
          borderBottom: "2px dotted var(--color-primary)",
          cursor: "pointer",
          color: "var(--color-heading)",
          fontWeight: 600,
          background: open ? "rgba(176,125,98,0.1)" : "transparent",
          borderRadius: 4,
          padding: "1px 3px",
          margin: "0 -3px",
          transition: "all 0.2s",
        }}
      >
        {term}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "var(--color-primary)",
            color: "white",
            fontSize: 11,
            fontWeight: 700,
            marginLeft: 4,
            verticalAlign: "middle",
            position: "relative",
            top: -1,
          }}
        >
          ?
        </span>
      </span>
      {open && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 12px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            border: "2px solid var(--color-border)",
            borderRadius: 16,
            padding: "16px 20px",
            boxShadow: "0 8px 32px rgba(90,66,52,0.15)",
            zIndex: 1000,
            width: 280,
            animation: "tooltipIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Arrow */}
          <span
            style={{
              position: "absolute",
              bottom: -8,
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: 14,
              height: 14,
              background: "white",
              border: "2px solid var(--color-border)",
              borderTop: "none",
              borderLeft: "none",
            }}
          />
          {info.visual && <span style={{ fontSize: 28, display: "block", marginBottom: 6 }}>{info.visual}</span>}
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-heading)", display: "block", marginBottom: 6 }}>
            {info.title}
          </span>
          <span style={{ fontSize: 13.5, color: "var(--color-text)", lineHeight: 1.55, display: "block" }}>
            {info.text}
          </span>
        </span>
      )}
    </span>
  );
}
