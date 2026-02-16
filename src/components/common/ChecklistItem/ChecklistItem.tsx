import { useState } from "react";
import type { RecipeItem } from "../../../types";
import css from "./ChecklistItem.module.css";

interface ChecklistItemProps {
  item: RecipeItem;
  displayAmount?: string;
  checked: boolean;
  onToggle: () => void;
}

export function ChecklistItem({ item, displayAmount, checked, onToggle }: ChecklistItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={css.item}
      data-checked={checked || undefined}
      onClick={onToggle}
    >
      <div className={css.row}>
        <div className={css.checkbox}>{checked && "✓"}</div>
        <div className={css.content}>
          <div className={css.nameRow}>
            <span className={css.name}>{item.name}</span>
            {displayAmount && <span className={css.amount}>{displayAmount}</span>}
          </div>
        </div>
        {item.note && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className={css.expandBtn}
            data-expanded={expanded || undefined}
          >
            ▾
          </button>
        )}
      </div>
      {expanded && item.note && (
        <div className={css.note}>{item.note}</div>
      )}
    </div>
  );
}
