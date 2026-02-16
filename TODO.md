# Todos

- [ ] Bug: Words like 'Minced' get split into 'Mince' and 'd' because 'Mince' is a glossary word.
  - Fix: Only glossary full words (though perhaps we need aliases for glossary words, too)
- Remove 'autoStart' property of recipes, as 'isParallel' implies it. Update README.
- [ ] Review the UI/UX
- Multiplier is causing a lot of prop drilling (starting in `App.tsx` with `onSelectRecipe={handleSelectRecipe}`), use a hook?
- Introduce Prettier
- Do something about 'utils'
- CI/CD
- Support for 'sources' metadata
