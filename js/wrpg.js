import * as buttons from './modules/buttons.js'
import * as engine from './modules/engine.js'
import * as intro from './scenes/intro.js'
import * as sceneHandler from './scenes/handler.js'
import * as mapHandler from './map/handler.js'

var e = new engine.GameEngine()
console.log('engine is', e)

// initialize when page is loaded
Zepto(function ($) {
    // setup info box when hovering over buttons
    buttons.setupButtonHoverInfo()

    // start game
    e.init()
    mapHandler.setup(e)
    sceneHandler.setup(e)
    intro.setup(e)
    intro.start(e)
})