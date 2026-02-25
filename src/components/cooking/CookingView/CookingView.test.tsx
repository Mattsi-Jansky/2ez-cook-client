import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CookingView } from './CookingView'
import type { Recipe, RecipeStage, RecipeTrack } from '../../../types'
import type {
  StepTimerMap,
  ActiveTimerInfo,
} from '../../../hooks/useStepTimerRegistry'

const mainTrack: RecipeTrack = {
  id: 'main',
  label: 'Main',
  color: '#4C8CE0',
  steps: [
    { instruction: 'Boil water', completionType: 'manual' },
    { instruction: 'Add pasta', completionType: 'manual' },
  ],
}

const threeStepTrack: RecipeTrack = {
  id: 'main3',
  label: 'Main',
  color: '#4C8CE0',
  steps: [
    { instruction: 'Boil water', completionType: 'manual' },
    { instruction: 'Add pasta', completionType: 'manual' },
    { instruction: 'Drain and serve', completionType: 'final' },
  ],
}

const sauceTrack: RecipeTrack = {
  id: 'sauce',
  label: 'Sauce',
  color: '#D94F4F',
  isParallel: true,
  steps: [{ instruction: 'Heat oil', completionType: 'manual' }],
}

const recipe: Recipe = {
  title: 'Test Pasta',
  description: 'A test recipe',
  servings: 2,
  totalTime: '30 min',
  ingredients: [],
  equipment: [],
  stages: [
    {
      id: 'stage1',
      type: 'cooking',
      label: 'Cooking',
      description: 'Cook the pasta',
      tracks: [mainTrack, sauceTrack],
    },
  ],
}

const prepTrack: RecipeTrack = {
  id: 'prep',
  label: 'Prep',
  color: '#7b9e6b',
  steps: [
    { instruction: 'Wash the vegetables', completionType: 'manual' },
    { instruction: 'Season everything', completionType: 'manual' },
  ],
}

const plateTrack: RecipeTrack = {
  id: 'plate',
  label: 'Plate',
  color: '#c4854a',
  steps: [
    { instruction: 'Arrange on the plate', completionType: 'manual' },
    { instruction: 'Garnish and serve', completionType: 'final' },
  ],
}

const twoStageRecipe: Recipe = {
  title: 'Test Pasta',
  description: 'A test recipe',
  servings: 2,
  totalTime: '30 min',
  ingredients: [],
  equipment: [],
  stages: [
    {
      id: 'stage-prep',
      type: 'preparation',
      label: 'Preparation',
      description: 'Prep the ingredients',
      tracks: [prepTrack],
    },
    {
      id: 'stage-cook',
      type: 'cooking',
      label: 'Cooking',
      description: 'Cook the pasta',
      tracks: [mainTrack],
    },
  ],
}

function makeStepTimers({
  entries = {},
  toastPills = [],
}: {
  entries?: StepTimerMap
  toastPills?: ActiveTimerInfo[]
} = {}) {
  return {
    getTimer: vi.fn(() => ({
      timeLeft: 0,
      duration: 0,
      running: false,
      done: false,
      overtime: 0,
      notStarted: true,
      paused: false,
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      forceComplete: vi.fn(),
      addMinute: vi.fn(),
    })),
    startTimer: vi.fn(),
    forceComplete: vi.fn(),
    getEntry: vi.fn((key: string) => entries[key] ?? null),
    isRunning: vi.fn((key: string) => {
      const e = entries[key]
      return !!e && e.running && !e.done
    }),
    getTimersForOtherTracks: vi.fn(() => toastPills),
  }
}

interface DefaultPropsOverrides {
  recipe?: Recipe
  currentStageIdx?: number
  trackSteps?: Record<string, number>
  activeTrack?: string | null
  pendingTrackStart?: string | null
  startedTracks?: Set<string>
  stepTimers?: ReturnType<typeof makeStepTimers>
  allTracks?: RecipeTrack[]
  pendingNextStage?: RecipeStage
  onNextStageContinue?: () => void
}

function renderView(overrides: DefaultPropsOverrides = {}) {
  const props = {
    recipe,
    currentStageIdx: 0,
    trackSteps: { main: 0, sauce: 0 },
    activeTrack: 'main',
    pendingTrackStart: null,
    allTracks: [mainTrack, sauceTrack],
    startedTracks: new Set(['main']),
    stepTimers: makeStepTimers(),
    onAdvanceStep: vi.fn(),
    onSwitchTrack: vi.fn(),
    onSetActiveTrack: vi.fn(),
    onExit: vi.fn(),
    portionsMultiplier: 1,
    ...overrides,
  }
  return { ...render(<CookingView {...props} />), props }
}

describe('CookingView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the recipe title', () => {
    renderView()
    expect(screen.getByText('Test Pasta')).toBeInTheDocument()
  })

  it('renders the stage label', () => {
    renderView()
    expect(screen.getByText('Cooking')).toBeInTheDocument()
  })

  it('renders the exit button', () => {
    renderView()
    expect(screen.getByText(/Exit/)).toBeInTheDocument()
  })

  it('calls onExit when exit button is clicked', () => {
    const { props } = renderView()
    fireEvent.click(screen.getByText(/Exit/))
    expect(props.onExit).toHaveBeenCalledOnce()
  })

  it('renders the current step instruction', () => {
    renderView()
    expect(screen.getByText('Boil water')).toBeInTheDocument()
  })

  it('renders second step when trackSteps advances', () => {
    renderView({ trackSteps: { main: 1, sauce: 0 } })
    expect(screen.getByText('Add pasta')).toBeInTheDocument()
  })

  it('always shows track switcher for multi-track stages', () => {
    renderView({ trackSteps: { main: 0, sauce: 0 } })
    expect(screen.getByText('Main')).toBeInTheDocument()
    expect(screen.getByText(/Sauce/)).toBeInTheDocument()
  })

  it('calls onSetActiveTrack when a track button is clicked', () => {
    const { props } = renderView()
    fireEvent.click(screen.getByText(/Sauce/))
    expect(props.onSetActiveTrack).toHaveBeenCalledWith('sauce')
  })

  it('marks completed tracks with a checkmark', () => {
    renderView({
      trackSteps: { main: 0, sauce: 1 },
      startedTracks: new Set(['main', 'sauce']),
    })
    expect(screen.getByText(/Sauce ✓/)).toBeInTheDocument()
  })

  it('marks not-started parallel tracks with a pending icon', () => {
    renderView({ trackSteps: { main: 0, sauce: 0 } })
    expect(screen.getByText(/Sauce ○/)).toBeInTheDocument()
  })

  it('shows not started message when viewing a pending track', () => {
    renderView({ activeTrack: 'sauce', trackSteps: { main: 0, sauce: 0 } })
    expect(screen.getByText('Sauce — not started yet')).toBeInTheDocument()
    expect(screen.getByText('This track will begin later.')).toBeInTheDocument()
  })

  it('shows track complete when all steps are done', () => {
    renderView({ trackSteps: { main: 2, sauce: 0 } })
    expect(screen.getByText('Main — complete')).toBeInTheDocument()
    expect(screen.getByText('✅')).toBeInTheDocument()
  })

  it('shows waiting message when step timers are running', () => {
    renderView({
      trackSteps: { main: 2, sauce: 0 },
      stepTimers: makeStepTimers({
        entries: {
          'sauce:0': {
            timeLeft: 30,
            running: true,
            done: false,
            duration: 60,
            resumedAt: 0,
            frozenTimeLeft: 30,
            lastWholeSecond: 30,
          },
        },
      }),
    })
    expect(
      screen.getByText('Waiting for timers to finish.'),
    ).toBeInTheDocument()
  })

  it('shows moving on message when no running step timers', () => {
    renderView({ trackSteps: { main: 2, sauce: 0 } })
    expect(screen.getByText('Moving on...')).toBeInTheDocument()
  })

  it('shows TrackInterruptCard when pendingTrackStart differs from activeTrack', () => {
    renderView({ pendingTrackStart: 'sauce' })
    expect(screen.getByText('Time to start: Sauce')).toBeInTheDocument()
  })

  it('does not show TrackInterruptCard when pendingTrackStart matches activeTrack', () => {
    renderView({ pendingTrackStart: 'main' })
    expect(screen.queryByText('Time to start: Main')).not.toBeInTheDocument()
  })

  it('does not show TrackInterruptCard when no pending track', () => {
    renderView({ pendingTrackStart: null })
    expect(screen.queryByText(/Time to start/)).not.toBeInTheDocument()
  })

  it('calls onSwitchTrack when switch button is clicked', () => {
    const { props } = renderView({ pendingTrackStart: 'sauce' })
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Sauce →' }))
    expect(props.onSwitchTrack).toHaveBeenCalledWith('sauce')
  })

  it('renders toast pills for step timers on non-active tracks', () => {
    renderView({
      stepTimers: makeStepTimers({
        toastPills: [
          {
            trackId: 'sauce',
            timerKey: 'sauce:0',
            timeLeft: 30,
            duration: 60,
            done: false,
          },
        ],
      }),
    })
    expect(screen.getByText(/remaining/)).toBeInTheDocument()
  })

  it('does not render timer tray when no toast pills', () => {
    const { container } = renderView()
    expect(
      container.querySelector("[class*='bgTimerTray']"),
    ).not.toBeInTheDocument()
  })

  it('calls onSetActiveTrack when View is clicked on a done toast pill', () => {
    const { props } = renderView({
      stepTimers: makeStepTimers({
        toastPills: [
          {
            trackId: 'sauce',
            timerKey: 'sauce:0',
            timeLeft: 0,
            duration: 60,
            done: true,
          },
        ],
      }),
    })
    fireEvent.click(screen.getByRole('button', { name: 'View' }))
    expect(props.onSetActiveTrack).toHaveBeenCalledWith('sauce')
  })

  it('sets data-tray-open when toast pills are present', () => {
    const { container } = renderView({
      stepTimers: makeStepTimers({
        toastPills: [
          {
            trackId: 'sauce',
            timerKey: 'sauce:0',
            timeLeft: 30,
            duration: 60,
            done: false,
          },
        ],
      }),
    })
    expect(container.firstElementChild).toHaveAttribute('data-tray-open')
  })

  it('does not set data-tray-open when no toast pills', () => {
    const { container } = renderView()
    expect(container.firstElementChild).not.toHaveAttribute('data-tray-open')
  })

  describe('step review navigation', () => {
    const threeStepRecipe: Recipe = {
      ...recipe,
      stages: [
        {
          id: 'stage1',
          type: 'cooking',
          label: 'Cooking',
          description: 'Cook the pasta',
          tracks: [threeStepTrack, sauceTrack],
        },
      ],
    }

    function renderNavView(overrides: DefaultPropsOverrides = {}) {
      return renderView({
        recipe: threeStepRecipe,
        activeTrack: 'main3',
        trackSteps: { main3: 2, sauce: 0 },
        startedTracks: new Set(['main3']),
        allTracks: [threeStepTrack, sauceTrack],
        ...overrides,
      })
    }

    it('shows nav buttons for multi-step active track', () => {
      renderNavView()
      expect(screen.getByText('← Prev')).toBeInTheDocument()
      expect(screen.getByText('Next →')).toBeInTheDocument()
    })

    it('does not show nav buttons when track is done', () => {
      renderNavView({ trackSteps: { main3: 3, sauce: 0 } })
      expect(screen.queryByText('← Prev')).not.toBeInTheDocument()
    })

    it('disables Next → when viewing the last step', () => {
      renderNavView({ trackSteps: { main3: 2, sauce: 0 } })
      expect(screen.getByText('Next →')).toBeDisabled()
    })

    it('enables Next → to browse future steps', () => {
      renderNavView({ trackSteps: { main3: 0, sauce: 0 } })
      expect(screen.getByText('Next →')).not.toBeDisabled()
    })

    it('clicking Next shows future step as preview', () => {
      renderNavView({ trackSteps: { main3: 0, sauce: 0 } })
      fireEvent.click(screen.getByText('Next →'))
      expect(screen.getByText('Add pasta')).toBeInTheDocument()
      expect(screen.getByText('Previewing step')).toBeInTheDocument()
    })

    it('clicking Prev shows previous step content', () => {
      renderNavView()
      expect(screen.getByText('Drain and serve')).toBeInTheDocument()
      fireEvent.click(screen.getByText('← Prev'))
      expect(screen.getByText('Add pasta')).toBeInTheDocument()
    })

    it('clicking Prev then Next returns to current step', () => {
      renderNavView()
      fireEvent.click(screen.getByText('← Prev'))
      expect(screen.getByText('Add pasta')).toBeInTheDocument()
      fireEvent.click(screen.getByText('Next →'))
      expect(screen.getByText('Drain and serve')).toBeInTheDocument()
    })

    it('shows review indicator when viewing a previous step', () => {
      renderNavView()
      fireEvent.click(screen.getByText('← Prev'))
      expect(screen.getByText('Reviewing step')).toBeInTheDocument()
    })

    it('does not show view-mode indicator on the current step', () => {
      renderNavView()
      expect(screen.queryByText('Reviewing step')).not.toBeInTheDocument()
      expect(screen.queryByText('Previewing step')).not.toBeInTheDocument()
    })

    it('shows return button when viewing a previous step', () => {
      renderNavView()
      fireEvent.click(screen.getByText('← Prev'))
      expect(
        screen.getByRole('button', { name: '↩ Back to current step' }),
      ).toBeInTheDocument()
    })

    it('shows return button when viewing a future step', () => {
      renderNavView({ trackSteps: { main3: 0, sauce: 0 } })
      fireEvent.click(screen.getByText('Next →'))
      expect(
        screen.getByRole('button', { name: '↩ Back to current step' }),
      ).toBeInTheDocument()
    })

    it('clicking return button returns to the current step', () => {
      renderNavView()
      fireEvent.click(screen.getByText('← Prev'))
      expect(screen.getByText('Add pasta')).toBeInTheDocument()
      fireEvent.click(
        screen.getByRole('button', { name: '↩ Back to current step' }),
      )
      expect(screen.getByText('Drain and serve')).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: '↩ Back to current step' }),
      ).not.toBeInTheDocument()
    })

    it('does not show return button on the current step', () => {
      renderNavView()
      expect(
        screen.queryByRole('button', { name: '↩ Back to current step' }),
      ).not.toBeInTheDocument()
    })

    it('disables Prev when at step 0', () => {
      renderNavView({ trackSteps: { main3: 0, sauce: 0 } })
      expect(screen.getByText('← Prev')).toBeDisabled()
    })

    describe('current step timer toast pill', () => {
      function renderWithCurrentStepTimer(
        overrides: DefaultPropsOverrides = {},
      ) {
        return renderNavView({
          trackSteps: { main3: 1, sauce: 0 },
          stepTimers: makeStepTimers({
            entries: {
              'main3:1': {
                timeLeft: 45,
                running: true,
                done: false,
                duration: 120,
                resumedAt: 0,
                frozenTimeLeft: 45,
                lastWholeSecond: 45,
              },
            },
          }),
          ...overrides,
        })
      }

      it('shows current step timer pill when navigating away from a step with a running timer', () => {
        renderWithCurrentStepTimer()
        fireEvent.click(screen.getByText('← Prev'))
        expect(screen.getByText(/remaining/)).toBeInTheDocument()
      })

      it('does not show current step timer pill when viewing the current step', () => {
        const { container } = renderWithCurrentStepTimer()
        expect(
          container.querySelector("[class*='bgTimerTray']"),
        ).not.toBeInTheDocument()
      })

      it('hides current step timer pill when navigating back to the current step', () => {
        const { container } = renderWithCurrentStepTimer()
        fireEvent.click(screen.getByText('← Prev'))
        expect(screen.getByText(/remaining/)).toBeInTheDocument()
        fireEvent.click(screen.getByText('Next →'))
        expect(
          container.querySelector("[class*='bgTimerTray']"),
        ).not.toBeInTheDocument()
      })

      it('shows current step timer pill for a done (not yet advanced) timer', () => {
        renderNavView({
          trackSteps: { main3: 1, sauce: 0 },
          stepTimers: makeStepTimers({
            entries: {
              'main3:1': {
                timeLeft: 0,
                running: false,
                done: true,
                duration: 120,
                resumedAt: 0,
                frozenTimeLeft: 0,
                lastWholeSecond: 0,
              },
            },
          }),
        })
        fireEvent.click(screen.getByText('← Prev'))
        expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument()
      })

      it('does not show current step timer pill when timer is idle', () => {
        renderNavView({
          trackSteps: { main3: 1, sauce: 0 },
          stepTimers: makeStepTimers({
            entries: {
              'main3:1': {
                timeLeft: 120,
                running: false,
                done: false,
                duration: 120,
                resumedAt: 0,
                frozenTimeLeft: 120,
                lastWholeSecond: 120,
              },
            },
          }),
        })
        fireEvent.click(screen.getByText('← Prev'))
        expect(screen.queryByText(/remaining/)).not.toBeInTheDocument()
      })

      it('clicking View on done current step pill navigates back to current step instead of switching track', () => {
        const { props } = renderNavView({
          trackSteps: { main3: 1, sauce: 0 },
          stepTimers: makeStepTimers({
            entries: {
              'main3:1': {
                timeLeft: 0,
                running: false,
                done: true,
                duration: 120,
                resumedAt: 0,
                frozenTimeLeft: 0,
                lastWholeSecond: 0,
              },
            },
          }),
        })
        fireEvent.click(screen.getByText('← Prev'))
        fireEvent.click(screen.getByRole('button', { name: 'View' }))
        expect(props.onSetActiveTrack).not.toHaveBeenCalled()
        expect(screen.getByText('Add pasta')).toBeInTheDocument()
      })

      it('shows both current step pill and other track pills simultaneously', () => {
        renderNavView({
          trackSteps: { main3: 1, sauce: 0 },
          stepTimers: makeStepTimers({
            entries: {
              'main3:1': {
                timeLeft: 45,
                running: true,
                done: false,
                duration: 120,
                resumedAt: 0,
                frozenTimeLeft: 45,
                lastWholeSecond: 45,
              },
            },
            toastPills: [
              {
                trackId: 'sauce',
                timerKey: 'sauce:0',
                timeLeft: 30,
                duration: 60,
                done: false,
              },
            ],
          }),
        })
        fireEvent.click(screen.getByText('← Prev'))
        const remainingLabels = screen.getAllByText(/remaining/)
        expect(remainingLabels).toHaveLength(2)
      })
    })
  })

  describe('stage review', () => {
    function renderStageReviewView(overrides: DefaultPropsOverrides = {}) {
      return renderView({
        recipe: twoStageRecipe,
        currentStageIdx: 1,
        trackSteps: { prep: 2, main: 0 },
        activeTrack: 'main',
        allTracks: [prepTrack, mainTrack],
        startedTracks: new Set(['main']),
        ...overrides,
      })
    }

    it('shows the stages progress bar for multi-stage recipes', () => {
      const { container } = renderStageReviewView()
      expect(
        container.querySelector("[class*='container']"),
      ).toBeInTheDocument()
    })

    it('shows past stage step content when a past stage node is clicked', () => {
      const { container } = renderStageReviewView()
      const stageItems = container.querySelectorAll("[class*='stageItem']")
      fireEvent.click(stageItems[0])
      expect(screen.getByText('Season everything')).toBeInTheDocument()
    })

    it('shows return to current stage button when reviewing a past stage', () => {
      const { container } = renderStageReviewView()
      const stageItems = container.querySelectorAll("[class*='stageItem']")
      fireEvent.click(stageItems[0])
      expect(
        screen.getByRole('button', { name: '↩ Back to current step' }),
      ).toBeInTheDocument()
    })

    it('returns to current stage content when return button is clicked', () => {
      const { container } = renderStageReviewView()
      const stageItems = container.querySelectorAll("[class*='stageItem']")
      fireEvent.click(stageItems[0])
      expect(screen.getByText('Season everything')).toBeInTheDocument()
      fireEvent.click(
        screen.getByRole('button', { name: '↩ Back to current step' }),
      )
      expect(screen.getByText('Boil water')).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: '↩ Back to current step' }),
      ).not.toBeInTheDocument()
    })

    it('shows the reviewed stage label in the header', () => {
      const { container } = renderStageReviewView()
      const stageItems = container.querySelectorAll("[class*='stageItem']")
      fireEvent.click(stageItems[0])
      const stageLabelEl = container.querySelector("[class*='stageLabel']")
      expect(stageLabelEl?.textContent).toBe('Preparation')
    })

    it('step nav is visible when reviewing a past stage with multiple steps', () => {
      const { container } = renderStageReviewView()
      const stageItems = container.querySelectorAll("[class*='stageItem']")
      fireEvent.click(stageItems[0])
      expect(screen.getByText('← Prev')).toBeInTheDocument()
      expect(screen.getByText('Next →')).toBeInTheDocument()
    })

    it('Prev navigates through reviewed stage steps', () => {
      const { container } = renderStageReviewView()
      const stageItems = container.querySelectorAll("[class*='stageItem']")
      fireEvent.click(stageItems[0])
      expect(screen.getByText('Season everything')).toBeInTheDocument()
      fireEvent.click(screen.getByText('← Prev'))
      expect(screen.getByText('Wash the vegetables')).toBeInTheDocument()
    })

    it('does not show return button when not reviewing a past stage', () => {
      renderStageReviewView()
      expect(
        screen.queryByRole('button', { name: '↩ Back to current step' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('future stage preview', () => {
    const threeStageRecipe: Recipe = {
      title: 'Test Pasta',
      description: 'A test recipe',
      servings: 2,
      totalTime: '30 min',
      ingredients: [],
      equipment: [],
      stages: [
        {
          id: 'stage-prep',
          type: 'preparation',
          label: 'Preparation',
          description: 'Prep the ingredients',
          tracks: [prepTrack],
        },
        {
          id: 'stage-cook',
          type: 'cooking',
          label: 'Cooking',
          description: 'Cook the pasta',
          tracks: [mainTrack],
        },
        {
          id: 'stage-plate',
          type: 'cooking',
          label: 'Plating',
          description: 'Plate the dish',
          tracks: [plateTrack],
        },
      ],
    }

    function renderFutureStageView(overrides: DefaultPropsOverrides = {}) {
      return renderView({
        recipe: threeStageRecipe,
        currentStageIdx: 1,
        trackSteps: { prep: 2, main: 0, plate: 0 },
        activeTrack: 'main',
        allTracks: [prepTrack, mainTrack, plateTrack],
        startedTracks: new Set(['main']),
        ...overrides,
      })
    }

    it('shows future stage step content when a future stage node is clicked', () => {
      const { container } = renderFutureStageView()
      const stageItems = container.querySelectorAll("[class*='stageItem']")
      fireEvent.click(stageItems[2])
      expect(screen.getByText('Arrange on the plate')).toBeInTheDocument()
    })

    it('shows Previewing step indicator for future stage content', () => {
      const { container } = renderFutureStageView()
      const stageItems = container.querySelectorAll("[class*='stageItem']")
      fireEvent.click(stageItems[2])
      expect(screen.getByText('Previewing step')).toBeInTheDocument()
    })

    it('shows return button when previewing a future stage', () => {
      const { container } = renderFutureStageView()
      const stageItems = container.querySelectorAll("[class*='stageItem']")
      fireEvent.click(stageItems[2])
      expect(
        screen.getByRole('button', { name: '↩ Back to current step' }),
      ).toBeInTheDocument()
    })

    it('Next navigates forward through future stage steps', () => {
      const { container } = renderFutureStageView()
      const stageItems = container.querySelectorAll("[class*='stageItem']")
      fireEvent.click(stageItems[2])
      expect(screen.getByText('Arrange on the plate')).toBeInTheDocument()
      fireEvent.click(screen.getByText('Next →'))
      expect(screen.getByText('Garnish and serve')).toBeInTheDocument()
    })

    it('returns to current stage when return button is clicked', () => {
      const { container } = renderFutureStageView()
      const stageItems = container.querySelectorAll("[class*='stageItem']")
      fireEvent.click(stageItems[2])
      fireEvent.click(
        screen.getByRole('button', { name: '↩ Back to current step' }),
      )
      expect(screen.getByText('Boil water')).toBeInTheDocument()
    })
  })

  describe('stage transition', () => {
    function renderTransitionView(overrides: DefaultPropsOverrides = {}) {
      return renderView({
        recipe: twoStageRecipe,
        currentStageIdx: 0,
        trackSteps: { prep: 2, main: 0 },
        activeTrack: 'prep',
        allTracks: [prepTrack, mainTrack],
        startedTracks: new Set(['prep']),
        pendingNextStage: twoStageRecipe.stages[1],
        onNextStageContinue: vi.fn(),
        ...overrides,
      })
    }

    it('shows next stage label in main content', () => {
      renderTransitionView()
      expect(
        screen.getByRole('heading', { name: 'Cooking' }),
      ).toBeInTheDocument()
    })

    it('shows next stage description in main content', () => {
      renderTransitionView()
      expect(screen.getByText('Cook the pasta')).toBeInTheDocument()
    })

    it('still shows recipe title in header', () => {
      renderTransitionView()
      expect(screen.getByText('Test Pasta')).toBeInTheDocument()
    })

    it('still shows current stage label in header', () => {
      const { container } = renderTransitionView()
      const stageLabelEl = container.querySelector("[class*='stageLabel']")
      expect(stageLabelEl?.textContent).toBe('Preparation')
    })

    it('still shows the stages progress bar', () => {
      const { container } = renderTransitionView()
      const stageItems = container.querySelectorAll("[class*='stageItem']")
      expect(stageItems).toHaveLength(2)
    })

    it('does not show track switcher during transition', () => {
      renderView({
        pendingNextStage: recipe.stages[0],
        onNextStageContinue: vi.fn(),
      })
      expect(screen.queryByText(/Sauce/)).not.toBeInTheDocument()
    })

    it('does not show step nav during transition', () => {
      renderTransitionView()
      expect(screen.queryByText('← Prev')).not.toBeInTheDocument()
      expect(screen.queryByText('Next →')).not.toBeInTheDocument()
    })

    it('calls onNextStageContinue when Continue is clicked', () => {
      const onNextStageContinue = vi.fn()
      renderTransitionView({ onNextStageContinue })
      fireEvent.click(screen.getByRole('button', { name: 'Continue →' }))
      expect(onNextStageContinue).toHaveBeenCalledOnce()
    })
  })

  describe('cross-stage step navigation', () => {
    function renderCrossStageView(overrides: DefaultPropsOverrides = {}) {
      return renderView({
        recipe: twoStageRecipe,
        currentStageIdx: 1,
        trackSteps: { prep: 2, main: 0 },
        activeTrack: 'main',
        allTracks: [prepTrack, mainTrack],
        startedTracks: new Set(['main']),
        ...overrides,
      })
    }

    it('Prev at step 0 of a stage navigates to the last step of the previous stage', () => {
      renderCrossStageView()
      fireEvent.click(screen.getByText('← Prev'))
      expect(screen.getByText('Season everything')).toBeInTheDocument()
    })

    it('Prev is not disabled when at step 0 with a previous stage', () => {
      renderCrossStageView()
      expect(screen.getByText('← Prev')).not.toBeDisabled()
    })

    it('Prev is disabled when at step 0 of the first stage', () => {
      renderCrossStageView({
        currentStageIdx: 0,
        trackSteps: { prep: 0, main: 0 },
        activeTrack: 'prep',
        startedTracks: new Set(['prep']),
      })
      expect(screen.getByText('← Prev')).toBeDisabled()
    })

    it('Next at the last step of a stage navigates to the first step of the next stage', () => {
      renderCrossStageView({
        currentStageIdx: 0,
        trackSteps: { prep: 1, main: 0 },
        activeTrack: 'prep',
        startedTracks: new Set(['prep']),
      })
      fireEvent.click(screen.getByText('Next →'))
      expect(screen.getByText('Boil water')).toBeInTheDocument()
    })

    it('Next is not disabled when at last step with a following stage', () => {
      renderCrossStageView({
        currentStageIdx: 0,
        trackSteps: { prep: 1, main: 0 },
        activeTrack: 'prep',
        startedTracks: new Set(['prep']),
      })
      expect(screen.getByText('Next →')).not.toBeDisabled()
    })

    it('Next is disabled when at last step of the final stage', () => {
      renderCrossStageView({ trackSteps: { prep: 2, main: 1 } })
      expect(screen.getByText('Next →')).toBeDisabled()
    })

    it('Prev from a reviewed past stage at step 0 goes to the stage before it', () => {
      const threeStageRecipe: Recipe = {
        ...twoStageRecipe,
        stages: [
          {
            id: 's0',
            type: 'preparation',
            label: 'Prep',
            description: '',
            tracks: [prepTrack],
          },
          {
            id: 's1',
            type: 'cooking',
            label: 'Cooking',
            description: '',
            tracks: [mainTrack],
          },
          {
            id: 's2',
            type: 'cooking',
            label: 'Plating',
            description: '',
            tracks: [plateTrack],
          },
        ],
      }
      const { container } = renderView({
        recipe: threeStageRecipe,
        currentStageIdx: 2,
        trackSteps: { prep: 2, main: 2, plate: 0 },
        activeTrack: 'plate',
        allTracks: [prepTrack, mainTrack, plateTrack],
        startedTracks: new Set(['plate']),
      })
      // Enter review of stage 1 (Cooking)
      const stageItems = container.querySelectorAll("[class*='stageItem']")
      fireEvent.click(stageItems[1])
      // Now at last step of stage 1. Navigate to step 0 within that stage first.
      fireEvent.click(screen.getByText('← Prev'))
      // Now at step 0 of stage 1. Prev should go to stage 0 (Prep).
      fireEvent.click(screen.getByText('← Prev'))
      expect(screen.getByText('Season everything')).toBeInTheDocument()
    })

    it('Prev shows the last step of an in-progress adjacent stage, not the current active step', () => {
      // prepTrack has 2 steps; trackSteps=0 means step 0 is active, step 1 is the last step of the stage
      renderView({
        recipe: twoStageRecipe,
        currentStageIdx: 1,
        trackSteps: { prep: 0, main: 0 },
        activeTrack: 'main',
        allTracks: [prepTrack, mainTrack],
        startedTracks: new Set(['main']),
      })
      fireEvent.click(screen.getByText('← Prev'))
      // Should land on last step ("Season everything"), not active step 0 ("Wash the vegetables")
      expect(screen.getByText('Season everything')).toBeInTheDocument()
    })

    it('Next from a reviewed stage at last step navigates to the first step of the adjacent stage', () => {
      // Enter review of stage 0 (Prep) — shows last step 'Season everything'
      const { container } = renderCrossStageView()
      const stageItems = container.querySelectorAll("[class*='stageItem']")
      fireEvent.click(stageItems[0])
      expect(screen.getByText('Season everything')).toBeInTheDocument()
      // Next from last step of reviewed stage 0 → shows first step of stage 1
      fireEvent.click(screen.getByText('Next →'))
      expect(screen.getByText('Boil water')).toBeInTheDocument()
    })
  })
})
