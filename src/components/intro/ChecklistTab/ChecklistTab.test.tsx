import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChecklistTab } from './ChecklistTab'
import type { Recipe } from '../../../types'

const recipe: Recipe = {
  title: 'Test Pasta',
  description: 'A test recipe',
  servings: 2,
  totalTime: '30 min',
  ingredients: [
    { id: 'i1', name: 'Onion', quantity: 1, unit: 'large' },
    {
      id: 'i2',
      name: 'Garlic',
      quantity: 3,
      unit: 'cloves',
      note: 'Finely minced',
    },
  ],
  equipment: [{ id: 'e1', name: 'Large pot' }],
  stages: [],
}

describe('ChecklistTab', () => {
  it('renders the intro text', () => {
    render(
      <ChecklistTab
        recipe={recipe}
        checked={{}}
        onToggle={vi.fn()}
        portionMultiplier={1}
      />,
    )
    expect(screen.getByText(/Check off each item/)).toBeInTheDocument()
  })

  it('renders ingredients section with label', () => {
    render(
      <ChecklistTab
        recipe={recipe}
        checked={{}}
        onToggle={vi.fn()}
        portionMultiplier={1}
      />,
    )
    expect(screen.getByText('Ingredients')).toBeInTheDocument()
  })

  it('renders equipment section with label', () => {
    render(
      <ChecklistTab
        recipe={recipe}
        checked={{}}
        onToggle={vi.fn()}
        portionMultiplier={1}
      />,
    )
    expect(screen.getByText('Equipment')).toBeInTheDocument()
  })

  it('renders each ingredient item', () => {
    render(
      <ChecklistTab
        recipe={recipe}
        checked={{}}
        onToggle={vi.fn()}
        portionMultiplier={1}
      />,
    )
    expect(screen.getByText('Onion')).toBeInTheDocument()
    expect(screen.getByText('Garlic')).toBeInTheDocument()
  })

  it('renders each equipment item', () => {
    render(
      <ChecklistTab
        recipe={recipe}
        checked={{}}
        onToggle={vi.fn()}
        portionMultiplier={1}
      />,
    )
    expect(screen.getByText('Large pot')).toBeInTheDocument()
  })

  it('renders item amounts', () => {
    render(
      <ChecklistTab
        recipe={recipe}
        checked={{}}
        onToggle={vi.fn()}
        portionMultiplier={1}
      />,
    )
    expect(screen.getByText('1 large')).toBeInTheDocument()
    expect(screen.getByText('3 cloves')).toBeInTheDocument()
  })

  it('calls onToggle when an item is clicked', () => {
    const onToggle = vi.fn()
    render(
      <ChecklistTab
        recipe={recipe}
        checked={{}}
        onToggle={onToggle}
        portionMultiplier={1}
      />,
    )
    fireEvent.click(screen.getByText('Onion'))
    expect(onToggle).toHaveBeenCalledWith('i1')
  })

  it('does not render ingredients section when empty', () => {
    const noIngredients: Recipe = { ...recipe, ingredients: [] }
    render(
      <ChecklistTab
        recipe={noIngredients}
        checked={{}}
        onToggle={vi.fn()}
        portionMultiplier={1}
      />,
    )
    expect(screen.queryByText('Ingredients')).not.toBeInTheDocument()
  })

  it('does not render equipment section when empty', () => {
    const noEquipment: Recipe = { ...recipe, equipment: [] }
    render(
      <ChecklistTab
        recipe={noEquipment}
        checked={{}}
        onToggle={vi.fn()}
        portionMultiplier={1}
      />,
    )
    expect(screen.queryByText('Equipment')).not.toBeInTheDocument()
  })

  it('passes checked state to items', () => {
    const { container } = render(
      <ChecklistTab
        recipe={recipe}
        checked={{ i1: true }}
        onToggle={vi.fn()}
        portionMultiplier={1}
      />,
    )
    const checkedItems = container.querySelectorAll('[data-checked]')
    expect(checkedItems.length).toBeGreaterThanOrEqual(1)
  })
})
