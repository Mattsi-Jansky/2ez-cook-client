import type { Glossary, StepQuantity } from '../../../types'
import { GLOBAL_GLOSSARY } from '../../../data/glossary'
import { applyStepQuantities } from '../../../utils/scaleQuantity'
import { GlossaryTerm } from '../GlossaryTerm/GlossaryTerm'

interface InstructionTextProps {
  text: string
  glossary?: Glossary
  quantities?: StepQuantity[]
  portionsMultiplier?: number
}

export function InstructionText({
  text,
  glossary,
  quantities,
  portionsMultiplier = 1,
}: InstructionTextProps) {
  const processed = applyStepQuantities(text, quantities, portionsMultiplier)
  const mergedGlossary = { ...GLOBAL_GLOSSARY, ...glossary }
  if (Object.keys(mergedGlossary).length === 0) return <span>{processed}</span>

  const terms = Object.keys(mergedGlossary).sort((a, b) => b.length - a.length)
  const re = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
    'gi',
  )

  return (
    <span>
      {processed.split(re).map((part, i) => {
        const match = terms.find((t) => t.toLowerCase() === part.toLowerCase())
        return match ? (
          <GlossaryTerm key={i} term={part} info={mergedGlossary[match]} />
        ) : (
          <span key={i}>{part}</span>
        )
      })}
    </span>
  )
}
