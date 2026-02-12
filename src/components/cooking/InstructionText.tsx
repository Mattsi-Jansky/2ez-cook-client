import type { Glossary } from "../../types";
import { GlossaryTerm } from "./GlossaryTerm";

interface InstructionTextProps {
  text: string;
  glossary?: Glossary;
}

export function InstructionText({ text, glossary }: InstructionTextProps) {
  if (!glossary || Object.keys(glossary).length === 0) return <span>{text}</span>;

  const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);
  const re = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );

  return (
    <span>
      {text.split(re).map((part, i) => {
        const match = terms.find((t) => t.toLowerCase() === part.toLowerCase());
        return match ? (
          <GlossaryTerm key={i} term={part} info={glossary[match]} />
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </span>
  );
}
