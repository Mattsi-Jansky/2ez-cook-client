import { useEffect, useState } from 'react'
import type { Recipe } from '../../types'
import { recipes } from '../../data/recipes'
import { useCookingSession } from '../../hooks'
import { Shell } from '../layout'
import { RecipeLanding } from '../landing'
import { CompletedScreen, CookingView } from '../cooking'
import { clearCheckedStorage } from '../intro/RecipeIntro/useCheckedItems'

const BG_WARM = 'linear-gradient(180deg,#FBF6F0 0%,#F5EDE3 100%)'
const BG_DONE = 'linear-gradient(180deg,#F0F7ED 0%,#FBF6F0 100%)'

export default function App() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [portionsMultiplier, setPortionsMultiplier] = useState(1)

  const handleSelectRecipe = (recipe: Recipe, mult: number) => {
    setSelectedRecipe(recipe)
    setPortionsMultiplier(mult)
  }

  if (!selectedRecipe) {
    return (
      <Shell background={BG_WARM}>
        <RecipeLanding recipes={recipes} onSelectRecipe={handleSelectRecipe} />
      </Shell>
    )
  }

  return (
    <CookingSession
      recipe={selectedRecipe}
      portionsMultiplier={portionsMultiplier}
      onBackToRecipes={() => setSelectedRecipe(null)}
    />
  )
}

function CookingSession({
  recipe,
  portionsMultiplier,
  onBackToRecipes,
}: {
  recipe: Recipe
  portionsMultiplier: number
  onBackToRecipes: () => void
}) {
  const session = useCookingSession(recipe, { skipIntro: true })

  useEffect(() => {
    if (session.phase === 'done') {
      clearCheckedStorage(recipe.title)
    }
  }, [session.phase, recipe.title])

  if (session.phase === 'done') {
    return (
      <Shell background={BG_DONE}>
        <CompletedScreen recipe={recipe} onRestart={onBackToRecipes} />
      </Shell>
    )
  }

  return (
    <Shell background={BG_WARM}>
      <CookingView
        recipe={recipe}
        portionsMultiplier={portionsMultiplier}
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
        pendingNextStage={
          session.phase === 'stageTransition'
            ? recipe.stages[session.stageTransitionTarget]
            : undefined
        }
        onNextStageContinue={
          session.phase === 'stageTransition'
            ? session.handleStageContinue
            : undefined
        }
      />
    </Shell>
  )
}
