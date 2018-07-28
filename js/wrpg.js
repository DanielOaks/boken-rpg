import * as buttons from './modules/buttons.js'
import * as engine from './modules/engine.js'
import * as intro from './scenes/intro.js'

var e = new engine.GameEngine()
console.log('engine is', e)

// initialize when page is loaded
Zepto(function ($) {
    // setup info box when hovering over buttons
    buttons.setupButtonHoverInfo()

    // start game
    e.init()
    intro.setup(e)
    intro.start(e)
})
