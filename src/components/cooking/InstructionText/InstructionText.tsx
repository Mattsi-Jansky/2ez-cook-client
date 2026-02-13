import type { Glossary } from "../../../types";
import { GLOBAL_GLOSSARY } from "../../../data/glossary";
import { GlossaryTerm } from "../GlossaryTerm/GlossaryTerm";

interface InstructionTextProps {
  text: string;
  glossary?: Glossary;
}

export function InstructionText({ text, glossary }: InstructionTextProps) {
  const merged = { ...GLOBAL_GLOSSARY, ...glossary };
  if (Object.keys(merged).length === 0) return <span>{text}</span>;

  const terms = Object.keys(merged).sort((a, b) => b.length - a.length);
  const re = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );

  return (
    <span>
      {text.split(re).map((part, i) => {
        const match = terms.find((t) => t.toLowerCase() === part.toLowerCase());
        return match ? (
          <GlossaryTerm key={i} term={part} info={merged[match]} />
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </span>
  );
}
