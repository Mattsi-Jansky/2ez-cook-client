import { describe, it, expect } from 'vitest'
import { hydrateRecipe } from './hydrateRecipe'
import type { RecipeInput } from '../types'

function makeInput(overrides: Partial<RecipeInput> = {}): RecipeInput {
  return {
    title: 'Test',
    description: 'A test recipe',
    servings: 2,
    totalTime: '10 min',
    ingredients: [
      { name: 'Salt', quantity: 1, unit: 'tsp' },
      { name: 'Pepper' },
    ],
    equipment: [{ name: 'Pan' }],
    stages: [
      {
        type: 'cooking',
        label: 'Cooking',
        description: 'Cook it',
        tracks: [
          {
            label: 'Main',
            steps: [{ instruction: 'Do it' }],
          },
        ],
      },
    ],
    ...overrides,
  }
}

describe('hydrateRecipe', () => {
  it('generates ingredient IDs', () => {
    const recipe = hydrateRecipe(makeInput())
    expect(recipe.ingredients[0].id).toBe('ingredient-0')
    expect(recipe.ingredients[1].id).toBe('ingredient-1')
  })

  it('generates equipment IDs', () => {
    const recipe = hydrateRecipe(makeInput())
    expect(recipe.equipment[0].id).toBe('equipment-0')
  })

  it('generates stage IDs', () => {
    const recipe = hydrateRecipe(
      makeInput({
        stages: [
          {
            type: 'preparation',
            label: 'Prep',
            description: '',
            tracks: [{ label: 'T', steps: [] }],
          },
          {
            type: 'cooking',
            label: 'Cook',
            description: '',
            tracks: [{ label: 'T', steps: [] }],
          },
        ],
      }),
    )
    expect(recipe.stages[0].id).toBe('stage-0')
    expect(recipe.stages[1].id).toBe('stage-1')
  })

  it('uses track label as track ID', () => {
    const recipe = hydrateRecipe(makeInput())
    expect(recipe.stages[0].tracks[0].id).toBe('Main')
  })

  it('defaults completionType to manual when no timerDuration', () => {
    const recipe = hydrateRecipe(makeInput())
    expect(recipe.stages[0].tracks[0].steps[0].completionType).toBe('manual')
  })

  it('infers completionType timer from timerDuration', () => {
    const recipe = hydrateRecipe(
      makeInput({
        stages: [
          {
            type: 'cooking',
            label: 'Cook',
            description: '',
            tracks: [
              {
                label: 'Main',
                steps: [{ instruction: 'Wait', timerDuration: 60 }],
              },
            ],
          },
        ],
      }),
    )
    expect(recipe.stages[0].tracks[0].steps[0].completionType).toBe('timer')
  })

  it('preserves explicit completionType over inference', () => {
    const recipe = hydrateRecipe(
      makeInput({
        stages: [
          {
            type: 'cooking',
            label: 'Cook',
            description: '',
            tracks: [
              {
                label: 'Main',
                steps: [{ instruction: 'Done', completionType: 'final' }],
              },
            ],
          },
        ],
      }),
    )
    expect(recipe.stages[0].tracks[0].steps[0].completionType).toBe('final')
  })

  it('converts flat startTrack to onComplete', () => {
    const recipe = hydrateRecipe(
      makeInput({
        stages: [
          {
            type: 'cooking',
            label: 'Cook',
            description: '',
            tracks: [
              {
                label: 'Pasta',
                steps: [{ instruction: 'Boil', startTrack: 'Sauce' }],
              },
              {
                label: 'Sauce',
                isParallel: true,
                steps: [{ instruction: 'Heat' }],
              },
            ],
          },
        ],
      }),
    )
    expect(recipe.stages[0].tracks[0].steps[0].onComplete?.startTrack).toBe(
      'Sauce',
    )
  })

  it('throws when startTrack references a non-existent label', () => {
    expect(() =>
      hydrateRecipe(
        makeInput({
          stages: [
            {
              type: 'cooking',
              label: 'Cook',
              description: '',
              tracks: [
                {
                  label: 'Main',
                  steps: [{ instruction: 'Go', startTrack: 'Nonexistent' }],
                },
              ],
            },
          ],
        }),
      ),
    ).toThrow(
      'startTrack "Nonexistent" does not match any track label in stage "Cook"',
    )
  })

  it('assigns colors from palette by track index', () => {
    const recipe = hydrateRecipe(
      makeInput({
        stages: [
          {
            type: 'cooking',
            label: 'Cook',
            description: '',
            tracks: [
              { label: 'A', steps: [] },
              { label: 'B', isParallel: true, steps: [] },
              { label: 'C', isParallel: true, steps: [] },
            ],
          },
        ],
      }),
    )
    expect(recipe.stages[0].tracks[0].color).toBe('#B07D62')
    expect(recipe.stages[0].tracks[1].color).toBe('#6B8F5E')
    expect(recipe.stages[0].tracks[2].color).toBe('#4C8CE0')
  })

  it('preserves explicit color over palette', () => {
    const recipe = hydrateRecipe(
      makeInput({
        stages: [
          {
            type: 'cooking',
            label: 'Cook',
            description: '',
            tracks: [{ label: 'Main', color: '#FF0000', steps: [] }],
          },
        ],
      }),
    )
    expect(recipe.stages[0].tracks[0].color).toBe('#FF0000')
  })

  it('preserves all other recipe fields', () => {
    const recipe = hydrateRecipe(makeInput())
    expect(recipe.title).toBe('Test')
    expect(recipe.servings).toBe(2)
    expect(recipe.ingredients[0].name).toBe('Salt')
    expect(recipe.ingredients[0].quantity).toBe(1)
    expect(recipe.ingredients[0].unit).toBe('tsp')
    expect(recipe.stages[0].tracks[0].steps[0].instruction).toBe('Do it')
  })
})
