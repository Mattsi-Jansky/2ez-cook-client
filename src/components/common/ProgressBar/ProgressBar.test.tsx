import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

function getSegmentStates(container: HTMLElement): string[] {
  const segments = container.querySelectorAll("[class*='segment']")
  return Array.from(segments).map(
    (s) => s.getAttribute('data-state') || 'unknown',
  )
}

describe('ProgressBar', () => {
  it('renders correct number of segments', () => {
    const { container } = render(
      <ProgressBar current={0} total={4} color="#4C8CE0" />,
    )
    const segments = container.querySelectorAll("[class*='segment']")
    expect(segments).toHaveLength(4)
  })

  it('marks completed segments as done', () => {
    const { container } = render(
      <ProgressBar current={2} total={4} color="#4C8CE0" />,
    )
    const states = getSegmentStates(container)
    expect(states).toEqual(['done', 'done', 'current', 'future'])
  })

  it('shows pulse on current segment', () => {
    const { container } = render(
      <ProgressBar current={1} total={3} color="#4C8CE0" />,
    )
    const segments = container.querySelectorAll("[class*='segment']")
    const currentSegment = segments[1]
    expect(currentSegment.querySelector("[class*='pulse']")).toBeInTheDocument()
  })

  it('marks viewed segment when viewIndex is set', () => {
    const { container } = render(
      <ProgressBar current={2} total={4} color="#4C8CE0" viewIndex={1} />,
    )
    const states = getSegmentStates(container)
    expect(states).toEqual(['done', 'viewed', 'current', 'future'])
  })

  it('suppresses pulse when viewIndex is set', () => {
    const { container } = render(
      <ProgressBar current={1} total={3} color="#4C8CE0" viewIndex={0} />,
    )
    expect(
      container.querySelector("[class*='pulse']"),
    ).not.toBeInTheDocument()
  })

  it('shows pulse when viewIndex is not set', () => {
    const { container } = render(
      <ProgressBar current={1} total={3} color="#4C8CE0" />,
    )
    expect(container.querySelector("[class*='pulse']")).toBeInTheDocument()
  })

  it('viewIndex on current segment shows viewed instead of current', () => {
    const { container } = render(
      <ProgressBar current={2} total={4} color="#4C8CE0" viewIndex={2} />,
    )
    const states = getSegmentStates(container)
    expect(states[2]).toBe('viewed')
  })
})
