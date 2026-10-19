// Design of DC Scaffold, used while design is true in dc-scaffold.config.js (through design.js)
import Hero from './Hero.astro'
import NextSteps from './NextSteps.astro'
// @two-languages
// Its texts, added to the ones of plugins/translations
import './texts/index.js'
// @end-two-languages

export const design = true

// Welcome page: its sections, shown on the home page in place of yours
export const welcome = [Hero, NextSteps]
