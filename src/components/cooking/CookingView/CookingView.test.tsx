import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CookingView } from './CookingView'
import type { Recipe, RecipeTrack } from '../../../types'
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
      running: false,
      done: false,
      notStarted: true,
      paused: false,
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      forceComplete: vi.fn(),
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
  trackSteps?: Record<string, number>
  activeTrack?: string | null
  pendingTrackStart?: string | null
  startedTracks?: Set<string>
  stepTimers?: ReturnType<typeof makeStepTimers>
  allTracks?: RecipeTrack[]
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
          'sauce:0': { timeLeft: 30, running: true, done: false, duration: 60 },
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

  it('sets data-has-bg-timers when toast pills are present', () => {
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
    expect(container.firstElementChild).toHaveAttribute('data-has-bg-timers')
  })

  it('does not set data-has-bg-timers when no toast pills', () => {
    const { container } = renderView()
    expect(container.firstElementChild).not.toHaveAttribute(
      'data-has-bg-timers',
    )
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

    it('clicking Next shows future step as read-only', () => {
      renderNavView({ trackSteps: { main3: 0, sauce: 0 } })
      fireEvent.click(screen.getByText('Next →'))
      expect(screen.getByText('Add pasta')).toBeInTheDocument()
      expect(screen.getByText('Reviewing step')).toBeInTheDocument()
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

    it('shows review indicator when reviewing a previous step', () => {
      renderNavView()
      fireEvent.click(screen.getByText('← Prev'))
      expect(screen.getByText('Reviewing step')).toBeInTheDocument()
    })

    it('does not show review indicator on the current step', () => {
      renderNavView()
      expect(screen.queryByText('Reviewing step')).not.toBeInTheDocument()
    })

    it('disables Prev when at step 0', () => {
      renderNavView({ trackSteps: { main3: 0, sauce: 0 } })
      expect(screen.getByText('← Prev')).toBeDisabled()
    })
  })
})
