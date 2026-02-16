/* ─────────────────────────────────────────────────────────────────────────────
   Recipe data model
   ───────────────────────────────────────────────────────────────────────────── */

export interface GlossaryEntry {
  title: string;
  visual?: string;
  text: string;
}

export type Glossary = Record<string, GlossaryEntry>;

/** What the user must do to mark a step as done. */
export type CompletionType = "manual" | "timer" | "final";

export interface StepOnComplete {
  /** Auto-start a parallel track when this step finishes. */
  startTrack?: string;
}

export interface StepQuantity {
  value: number;
  unit: string;
}

export interface RecipeStep {
  instruction: string;
  quantities?: StepQuantity[];
  glossary?: Glossary;
  completionType: CompletionType;
  actionLabel?: string;
  completionHint?: string;
  hint?: string;
  /** Timer duration in seconds — only used when completionType === "timer". */
  timerDuration?: number;
  timerLabel?: string;
  /** If true this step becomes a background timer pill and the UI
   *  automatically moves the user back to the main track. */
  isBackground?: boolean;
  onComplete?: StepOnComplete;
}

export interface RecipeTrack {
  id: string;
  label: string;
  color: string;
  steps: RecipeStep[];
  /** Whether this track runs in parallel with another track. */
  isParallel?: boolean;
  /** If true, this track is not started until triggered by another step. */
  autoStart?: boolean;
}

export type StageType = "preparation" | "cooking";

export interface RecipeStage {
  id: string;
  type: StageType;
  label: string;
  description: string;
  tracks: RecipeTrack[];
}

export interface RecipeItem {
  id: string;
  name: string;
  quantity?: number | [number, number];
  unit?: string;
  note?: string;
}

export interface Recipe {
  title: string;
  description: string;
  servings: number;
  totalTime: string;
  ingredients: RecipeItem[];
  equipment: RecipeItem[];
  stages: RecipeStage[];
}

/* ─────────────────────────────────────────────────────────────────────────────
   Authored (input) types — same shape but without generated IDs.
   ───────────────────────────────────────────────────────────────────────────── */

export type RecipeItemInput = Omit<RecipeItem, "id">;
export type RecipeStepInput = Omit<RecipeStep, "completionType" | "onComplete"> & {
  completionType?: CompletionType;
  startTrack?: string;
};
export type RecipeTrackInput = Omit<RecipeTrack, "id" | "steps" | "color"> & {
  color?: string;
  steps: RecipeStepInput[];
};
export type RecipeStageInput = Omit<RecipeStage, "id" | "tracks"> & {
  tracks: RecipeTrackInput[];
};
export type RecipeInput = Omit<Recipe, "stages" | "ingredients" | "equipment"> & {
  stages: RecipeStageInput[];
  ingredients: RecipeItemInput[];
  equipment: RecipeItemInput[];
};
