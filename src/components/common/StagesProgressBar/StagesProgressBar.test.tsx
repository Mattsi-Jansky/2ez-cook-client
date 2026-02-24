import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { StagesProgressBar } from './StagesProgressBar'
import type { RecipeStage } from '../../../types'

const stages: RecipeStage[] = [
  {
    id: 'prep',
    type: 'preparation',
    label: 'Preparation',
    description: 'Get ready',
    tracks: [],
  },
  {
    id: 'cook',
    type: 'cooking',
    label: 'Cooking',
    description: 'Cook it',
    tracks: [],
  },
  {
    id: 'plate',
    type: 'cooking',
    label: 'Plating',
    description: 'Plate it',
    tracks: [],
  },
]

function getNodeStates(container: HTMLElement): string[] {
  const nodes = container.querySelectorAll("[class*='node']")
  return Array.from(nodes).map((n) => n.getAttribute('data-state') || 'unknown')
}

describe('StagesProgressBar', () => {
  it('renders the correct number of stage nodes', () => {
    const { container } = render(
      <StagesProgressBar stages={stages} currentStageIdx={0} />,
    )
    const nodes = container.querySelectorAll("[class*='node']")
    expect(nodes).toHaveLength(3)
  })

  it('marks past stages as done', () => {
    const { container } = render(
      <StagesProgressBar stages={stages} currentStageIdx={2} />,
    )
    const states = getNodeStates(container)
    expect(states[0]).toBe('done')
    expect(states[1]).toBe('done')
  })

  it('marks current stage', () => {
    const { container } = render(
      <StagesProgressBar stages={stages} currentStageIdx={1} />,
    )
    const states = getNodeStates(container)
    expect(states[1]).toBe('current')
  })

  it('marks future stages', () => {
    const { container } = render(
      <StagesProgressBar stages={stages} currentStageIdx={0} />,
    )
    const states = getNodeStates(container)
    expect(states[1]).toBe('future')
    expect(states[2]).toBe('future')
  })

  it('renders stage labels', () => {
    const { getByText } = render(
      <StagesProgressBar stages={stages} currentStageIdx={0} />,
    )
    expect(getByText('Preparation')).toBeInTheDocument()
    expect(getByText('Cooking')).toBeInTheDocument()
    expect(getByText('Plating')).toBeInTheDocument()
  })

  it('shows check on done node', () => {
    const { container } = render(
      <StagesProgressBar stages={stages} currentStageIdx={1} />,
    )
    const check = container.querySelector("[class*='check']")
    expect(check).toBeInTheDocument()
  })

  it('shows pulse on current node', () => {
    const { container } = render(
      <StagesProgressBar stages={stages} currentStageIdx={0} />,
    )
    const pulse = container.querySelector("[class*='pulse']")
    expect(pulse).toBeInTheDocument()
  })

  it('marks a past stage as viewed when viewStageIdx differs from currentStageIdx', () => {
    const { container } = render(
      <StagesProgressBar
        stages={stages}
        currentStageIdx={2}
        viewStageIdx={0}
      />,
    )
    const states = getNodeStates(container)
    expect(states[0]).toBe('viewed')
    expect(states[1]).toBe('done')
    expect(states[2]).toBe('current')
  })

  it('shows check on viewed node', () => {
    const { container } = render(
      <StagesProgressBar
        stages={stages}
        currentStageIdx={2}
        viewStageIdx={0}
      />,
    )
    const checks = container.querySelectorAll("[class*='check']")
    expect(checks.length).toBeGreaterThan(0)
  })

  it('calls onClickStage when a past stage is clicked', () => {
    const onClickStage = vi.fn()
    const { container } = render(
      <StagesProgressBar
        stages={stages}
        currentStageIdx={2}
        onClickStage={onClickStage}
      />,
    )
    const items = container.querySelectorAll("[class*='stageItem']")
    fireEvent.click(items[0])
    expect(onClickStage).toHaveBeenCalledWith(0)
  })

  it('calls onClickStage on the current stage when reviewing a past stage', () => {
    const onClickStage = vi.fn()
    const { container } = render(
      <StagesProgressBar
        stages={stages}
        currentStageIdx={2}
        viewStageIdx={0}
        onClickStage={onClickStage}
      />,
    )
    const items = container.querySelectorAll("[class*='stageItem']")
    fireEvent.click(items[2])
    expect(onClickStage).toHaveBeenCalledWith(2)
  })

  it('does not call onClickStage on future stages', () => {
    const onClickStage = vi.fn()
    const { container } = render(
      <StagesProgressBar
        stages={stages}
        currentStageIdx={0}
        onClickStage={onClickStage}
      />,
    )
    const items = container.querySelectorAll("[class*='stageItem']")
    fireEvent.click(items[2])
    expect(onClickStage).not.toHaveBeenCalled()
  })
})
