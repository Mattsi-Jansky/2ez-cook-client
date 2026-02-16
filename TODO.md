# Todos

- [ ] Bug: Words like 'Minced' get split into 'Mince' and 'd' because 'Mince' is a glossary word.
  - Fix: Only glossary full words (though perhaps we need aliases for glossary words, too)
- [ ] Remove 'autoStart' property of recipes, as 'isParallel' implies it. Update README.
- [ ] Review the UI/UX
- [ ] Multiplier is causing a lot of prop drilling (starting in `App.tsx` with `onSelectRecipe={handleSelectRecipe}`), use a hook?
- [x] Introduce Prettier
- [ ] Do something about 'utils'
- [x] CI/CD
- [ ] Support for 'sources' metadata
- [ ] The ability to go back to previous instructions
- [ ] Review the glossaries, can be improved
- [x] Consider how to save and reset the state of ingredients/equipment checkboxes
