import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InstructionText } from './InstructionText'
import { GLOBAL_GLOSSARY } from '../../../data/glossary'

describe('InstructionText', () => {
  it('highlights global glossary terms without explicit glossary prop', () => {
    render(<InstructionText text="Drain the pasta in a colander." />)

    const term = screen.getByRole('button', { name: /colander/i })
    expect(term).toBeInTheDocument()
  })

  it('does not highlight terms that are not in the text', () => {
    render(<InstructionText text="Stir the sauce gently." />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('step-level glossary overrides global entry for the same term', () => {
    const stepGlossary = {
      colander: {
        title: 'Custom colander tip',
        text: 'Use the red one.',
      },
    }

    render(
      <InstructionText
        text="Drain the pasta in a colander."
        glossary={stepGlossary}
      />,
    )

    const term = screen.getByRole('button', { name: /colander/i })
    fireEvent.click(term)

    expect(screen.getByText('Custom colander tip')).toBeInTheDocument()
    expect(screen.getByText('Use the red one.')).toBeInTheDocument()
    expect(
      screen.queryByText(GLOBAL_GLOSSARY.colander.title),
    ).not.toBeInTheDocument()
  })

  it('renders plain text when no glossary terms match', () => {
    render(<InstructionText text="Do something unusual." />)

    expect(screen.getByText('Do something unusual.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('does not split words that contain a glossary term as a prefix', () => {
    render(<InstructionText text="Add the minced garlic." />)

    expect(screen.getByText(/minced/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /mince/i })).not.toBeInTheDocument()
  })

  it('highlights step-level terms not in global glossary', () => {
    const stepGlossary = {
      'julienne cut': {
        title: 'What is julienne?',
        text: 'Thin matchstick strips.',
      },
    }

    render(
      <InstructionText
        text="Use a julienne cut on the carrots."
        glossary={stepGlossary}
      />,
    )

    const term = screen.getByRole('button', { name: /julienne cut/i })
    expect(term).toBeInTheDocument()
  })
})
