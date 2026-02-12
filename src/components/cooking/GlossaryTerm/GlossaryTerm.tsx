import { useState, useEffect, useRef } from "react";
import type { GlossaryEntry } from "../../../types";
import css from "./GlossaryTerm.module.css";

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
    <span ref={ref} className={css.wrapper}>
      <span
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(!open)}
        className={css.trigger}
        data-open={open || undefined}
      >
        {term}
        <span className={css.badge}>?</span>
      </span>
      {open && (
        <span className={css.tooltip}>
          <span className={css.arrow} />
          {info.visual && <span className={css.visual}>{info.visual}</span>}
          <span className={css.infoTitle}>{info.title}</span>
          <span className={css.infoText}>{info.text}</span>
        </span>
      )}
    </span>
  );
}
