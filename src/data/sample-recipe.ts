import type { Recipe } from "../types";

export const SAMPLE_RECIPE: Recipe = {
  title: "Creamy Garlic Pasta with Roasted Broccoli",
  description:
    "A comforting bowl of pasta with a simple creamy sauce and crispy roasted broccoli.",
  servings: 2,
  totalTime: "35 min",
  ingredients: [
    {
      id: "i1",
      name: "Pasta",
      amount: "200g",
      note: "About half a standard packet. Any shape works — penne, fusilli, spaghetti.",
    },
    {
      id: "i2",
      name: "Garlic",
      amount: "3 cloves",
      note: "Or 3 teaspoons of pre-minced garlic from a jar.",
    },
    {
      id: "i3",
      name: "Broccoli",
      amount: "1 medium head",
      note: "About 2 cups when cut into pieces.",
    },
    {
      id: "i4",
      name: "Butter",
      amount: "2 tablespoons",
      note: "About the size of two thumb-tips.",
    },
    {
      id: "i5",
      name: "Cream cheese",
      amount: "½ cup (125g)",
      note: "From a block or tub. Or substitute ½ cup heavy cream.",
    },
    {
      id: "i6",
      name: "Olive oil",
      amount: "1–2 tablespoons",
      note: "For the broccoli. Any cooking oil works.",
    },
    { id: "i7", name: "Salt", amount: "To taste" },
    {
      id: "i8",
      name: "Pepper",
      amount: "To taste",
      note: "For the broccoli. Optional.",
    },
  ],
  equipment: [
    {
      id: "e1",
      name: "Large pot",
      note: "Big enough to hold 3–4 litres of water. Your biggest pot.",
    },
    {
      id: "e2",
      name: "Baking tray",
      note: "Also called a sheet pan. Any flat oven-safe tray.",
    },
    {
      id: "e3",
      name: "Colander",
      note: "A bowl with holes for draining. A lid held ajar on the pot works too.",
    },
    { id: "e4", name: "Knife and cutting board" },
    {
      id: "e5",
      name: "Mug or cup",
      note: "For scooping out pasta water before draining.",
    },
  ],
  stages: [
    {
      id: "prep",
      type: "preparation",
      label: "Preparation",
      description:
        "Getting everything chopped, measured, and ready before any heat goes on.",
      tracks: [
        {
          id: "prep-main",
          label: "Ingredients",
          color: "#B07D62",
          steps: [
            {
              id: "p1",
              instruction:
                "Peel 3 cloves of garlic and mince them into small pieces. Set aside on a small plate or bowl.",
              completionType: "manual",
              actionLabel: "Garlic is minced",
            },
            {
              id: "p2",
              instruction:
                "Cut the broccoli into bite-sized florets. You'll need about 2 cups — roughly one medium head.",
              completionType: "manual",
              actionLabel: "Broccoli is cut",
            },
            {
              id: "p3",
              instruction:
                "Measure out: 2 tablespoons of butter, ½ cup of cream cheese (or heavy cream), and your pasta (about 200g).",
              completionType: "manual",
              actionLabel: "Everything is measured out",
              hint: "Having everything pre-measured means you won't need to hunt for things while the stove is on.",
            },
          ],
        },
      ],
    },
    {
      id: "cook",
      type: "cooking",
      label: "Cooking",
      description:
        "Some of these steps run at the same time — the app will manage the timing for you.",
      tracks: [
        {
          id: "main",
          label: "Pasta & Sauce",
          color: "#B07D62",
          steps: [
            {
              id: "m1",
              instruction:
                "Fill a large pot about ¾ full with water and place it on the stove over high heat. Add a generous pinch of salt.",
              glossary: {
                "generous pinch of salt": {
                  title: "How much salt?",
                  visual: "🧂",
                  text: "About 1 tablespoon, or grab some between your thumb and fingers and toss it in.",
                },
              },
              completionType: "manual",
              actionLabel: "Water is at a rolling boil",
              completionHint:
                "Big, vigorous bubbles breaking the surface — not just tiny bubbles on the bottom.",
              onComplete: { startTrack: "broccoli" },
            },
            {
              id: "m2",
              instruction:
                "Pour the pasta into the boiling water and give it a stir.",
              completionType: "timer",
              timerDuration: 600,
              timerLabel: "Pasta cooking",
              actionLabel: "Pasta is in the water",
              hint: "Stir once or twice during cooking so the pasta doesn't stick together.",
            },
            {
              id: "m3",
              instruction:
                "Before draining: scoop out a mugful of the cooking water and set it aside. Then drain the pasta in a colander.",
              completionType: "manual",
              actionLabel: "Pasta is drained",
            },
            {
              id: "m4",
              instruction:
                "In the same pot (no need to wash it), add the butter and minced garlic over medium heat. Stir gently.",
              completionType: "timer",
              timerDuration: 75,
              timerLabel: "Garlic sizzling",
              actionLabel: "Butter and garlic are in the pot",
              hint: "You're waiting for the garlic to become fragrant and lightly golden. If it starts going dark brown, take the pot off the heat.",
            },
            {
              id: "m5",
              instruction:
                "Turn the heat to low. Add the cream cheese (or cream) and a splash of the saved pasta water. Stir until smooth.",
              completionType: "manual",
              actionLabel: "Sauce looks smooth",
              completionHint:
                "A few small lumps are fine — they'll melt as you stir.",
            },
            {
              id: "m6",
              instruction:
                "Add the drained pasta back into the pot with the sauce. Toss to coat every piece. Serve in bowls topped with the roasted broccoli.",
              completionType: "final",
              actionLabel: "All done",
            },
          ],
        },
        {
          id: "broccoli",
          label: "Roasted Broccoli",
          color: "#6B8F5E",
          isParallel: true,
          autoStart: false,
          steps: [
            {
              id: "b1",
              instruction:
                "Preheat your oven to 200°C (400°F). Spread the broccoli on a baking tray, drizzle with olive oil, and season with salt and pepper.",
              completionType: "manual",
              actionLabel: "Broccoli is in the oven",
              completionHint:
                "Spread pieces out — don't pile them. Spacing helps them crisp.",
            },
            {
              id: "b2",
              instruction:
                "The broccoli roasts in the background while you continue with the pasta. You'll be alerted when it's done.",
              completionType: "timer",
              timerDuration: 1200,
              timerLabel: "Broccoli roasting",
              actionLabel: "Broccoli is roasting",
              isBackground: true,
              hint: "Once started, the timer appears pinned at the bottom of the screen.",
            },
            {
              id: "b3",
              instruction:
                "Remove the broccoli from the oven. It should be lightly charred on the edges and tender when pierced with a fork.",
              completionType: "manual",
              actionLabel: "Broccoli is out of the oven",
              completionHint:
                "A few dark spots are good — that's flavour, not burning.",
            },
          ],
        },
      ],
    },
  ],
};
