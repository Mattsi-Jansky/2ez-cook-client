import { useState } from "react";
import type { Recipe } from "../../types";
import { recipes } from "../../data/recipes";
import { useCookingSession } from "../../hooks";
import { Shell } from "../layout";
import { RecipeLanding } from "../landing";
import { StageTransition, CompletedScreen, CookingView } from "../cooking";
import css from "./App.module.css";

const BG_WARM = "linear-gradient(180deg,#FBF6F0 0%,#F5EDE3 100%)";
const BG_DONE = "linear-gradient(180deg,#F0F7ED 0%,#FBF6F0 100%)";

export default function App() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  if (!selectedRecipe) {
    return (
      <Shell background={BG_WARM}>
        <RecipeLanding
          recipes={recipes}
          onSelectRecipe={setSelectedRecipe}
        />
      </Shell>
    );
  }

  return (
    <CookingSession
      recipe={selectedRecipe}
      onBackToRecipes={() => setSelectedRecipe(null)}
    />
  );
}

function CookingSession({
  recipe,
  onBackToRecipes,
}: {
  recipe: Recipe;
  onBackToRecipes: () => void;
}) {
  const session = useCookingSession(recipe, { skipIntro: true });

  if (session.phase === "stageTransition") {
    return (
      <Shell background={BG_WARM}>
        <div className={css.stageTransitionWrapper}>
          <StageTransition
            toStage={recipe.stages[session.stageTransitionTarget]}
            onContinue={session.handleStageContinue}
          />
        </div>
      </Shell>
    );
  }

  if (session.phase === "done") {
    return (
      <Shell background={BG_DONE}>
        <CompletedScreen recipe={recipe} onRestart={onBackToRecipes} />
      </Shell>
    );
  }

  return (
    <Shell background={BG_WARM}>
      <CookingView
        recipe={recipe}
        currentStageIdx={session.currentStageIdx}
        trackSteps={session.trackSteps}
        activeTrack={session.activeTrack}
        pendingTrackStart={session.pendingTrackStart}
        allTracks={session.allTracks}
        startedTracks={session.startedTracks}
        stepTimers={session.stepTimers}
        onAdvanceStep={session.advanceStep}
        onSwitchTrack={session.switchToTrack}
        onSetActiveTrack={session.switchToTrack}
        onExit={onBackToRecipes}
      />
    </Shell>
  );
}
