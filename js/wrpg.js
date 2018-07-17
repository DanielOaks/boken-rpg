import * as engine from './modules/engine.js'
import * as intro from './scenes/intro.js'

var e = engine.Engine()
console.log('engine is', engine)

// initialize when page is loaded
Zepto(function ($) {
    intro.setup(e)
    intro.start(e)
})
