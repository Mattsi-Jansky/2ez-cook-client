import type { RecipeItem, StepQuantity } from '../types'

const NICE_FRACTIONS: [number, string][] = [
  [1 / 8, '⅛'],
  [1 / 4, '¼'],
  [1 / 3, '⅓'],
  [3 / 8, '⅜'],
  [1 / 2, '½'],
  [5 / 8, '⅝'],
  [2 / 3, '⅔'],
  [3 / 4, '¾'],
  [7 / 8, '⅞'],
]

export function formatNumber(n: number): string {
  if (Number.isInteger(n) || Math.abs(n - Math.round(n)) < 0.001) {
    return String(Math.round(n))
  }

  const whole = Math.floor(n)
  const frac = n - whole

  for (const [val, ch] of NICE_FRACTIONS) {
    if (Math.abs(frac - val) < 0.01) {
      return whole > 0 ? `${whole}${ch}` : ch
    }
  }

  const rounded = Math.round(n * 10) / 10
  if (Number.isInteger(rounded)) return String(rounded)
  return rounded.toFixed(1)
}

export function formatQuantity(
  qty: number | [number, number],
  unit: string,
  multiplier: number,
): string {
  if (Array.isArray(qty)) {
    const lo = formatNumber(qty[0] * multiplier)
    const hi = formatNumber(qty[1] * multiplier)
    return `${lo}–${hi} ${unit}`
  }
  return `${formatNumber(qty * multiplier)} ${unit}`
}

export function formatIngredientAmount(
  item: RecipeItem,
  multiplier: number,
): string | undefined {
  if (item.quantity == null || item.unit == null) return undefined
  return formatQuantity(item.quantity, item.unit, multiplier)
}

export function applyStepQuantities(
  text: string,
  quantities: StepQuantity[] | undefined,
  multiplier: number,
): string {
  if (!quantities || quantities.length === 0) return text
  return text.replace(/\{(\d+)\}/g, (match, indexStr: string) => {
    const idx = parseInt(indexStr, 10) - 1
    const q = quantities[idx]
    if (!q) return match
    return `${formatNumber(q.value * multiplier)} ${q.unit}`
  })
}
