import { SAMPLE_RECIPE } from "../../data/sample-recipe";
import { useCookingSession } from "../../hooks";
import { Shell } from "../layout";
import { RecipeIntro } from "../intro";
import { StageTransition, CompletedScreen, CookingView } from "../cooking";
import css from "./App.module.css";

export default function App() {
  const recipe = SAMPLE_RECIPE;
  const session = useCookingSession(recipe);

  const BG_WARM = "linear-gradient(180deg,#FBF6F0 0%,#F5EDE3 100%)";
  const BG_DONE = "linear-gradient(180deg,#F0F7ED 0%,#FBF6F0 100%)";

  if (session.phase === "intro") {
    return (
      <Shell background={BG_WARM}>
        <RecipeIntro recipe={recipe} onStart={session.handleStart} />
      </Shell>
    );
  }

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
        <CompletedScreen recipe={recipe} onRestart={session.restart} />
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
        onExit={session.restart}
      />
    </Shell>
  );
}
