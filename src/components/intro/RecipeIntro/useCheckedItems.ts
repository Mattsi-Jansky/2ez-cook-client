import { useCallback, useState } from 'react'

function getStorageKey(recipeTitle: string) {
  return `checklist:${recipeTitle}`
}

function load(recipeTitle: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(getStorageKey(recipeTitle))
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore missing/corrupt storage */
  }
  return {}
}

function save(recipeTitle: string, checked: Record<string, boolean>) {
  try {
    localStorage.setItem(getStorageKey(recipeTitle), JSON.stringify(checked))
  } catch {
    /* ignore unavailable storage */
  }
}

export function useCheckedItems(recipeTitle: string) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    load(recipeTitle),
  )

  const toggle = useCallback(
    (id: string) =>
      setChecked((prev) => {
        const next = { ...prev, [id]: !prev[id] }
        save(recipeTitle, next)
        return next
      }),
    [recipeTitle],
  )

  return { checked, toggle }
}
