import * as engine from './modules/engine.js'
import * as intro from './scenes/intro.js'
import * as snippets from './snippets.js'

var e = new engine.Engine()
console.log('engine is', engine)

// initialize when page is loaded
Zepto(function ($) {
    // setup info box when hovering over buttons
    snippets.setupHoverInfo()

    // start game
    e.init()
    intro.setup(e)
    intro.start(e)
})
