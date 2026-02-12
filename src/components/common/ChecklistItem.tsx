import { useState } from "react";
import type { RecipeItem } from "../../types";

interface ChecklistItemProps {
  item: RecipeItem;
  checked: boolean;
  onToggle: () => void;
}

export function ChecklistItem({ item, checked, onToggle }: ChecklistItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: checked ? "#F8FBF6" : "white",
        border: `1.5px solid ${checked ? "#C5D9B8" : "var(--color-border-light)"}`,
        borderRadius: 14,
        padding: "14px 16px",
        transition: "all 0.25s ease",
        cursor: "pointer",
      }}
      onClick={onToggle}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            flexShrink: 0,
            border: checked ? "none" : "2px solid #D4CBC0",
            background: checked ? "var(--color-success)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            fontSize: 14,
            color: "white",
          }}
        >
          {checked && "✓"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: checked ? "#7A917A" : "var(--color-heading-dark)",
                transition: "color 0.2s",
              }}
            >
              {item.name}
            </span>
            {item.amount && (
              <span style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 500 }}>
                {item.amount}
              </span>
            )}
          </div>
        </div>
        {item.note && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 6px",
              fontSize: 16,
              color: "#C4B5A4",
              transition: "transform 0.2s",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▾
          </button>
        )}
      </div>
      {expanded && item.note && (
        <div
          style={{
            marginTop: 10,
            marginLeft: 38,
            fontSize: 13,
            color: "#8B7B6B",
            lineHeight: 1.5,
            animation: "fadeIn 0.2s ease",
          }}
        >
          {item.note}
        </div>
      )}
    </div>
  );
}
