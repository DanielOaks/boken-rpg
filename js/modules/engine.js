import * as data from './data.js'
import * as events from './events.js'
import * as buttons from './buttons.js'
import * as gui from './gui.js'

export function Engine() {
    var eq = events.Queue()

    var e = {
        state: 'start',

        Buttons: buttons.Manager(eq),
        Data: data.Store(),
        Events: eq,
        Gui: gui.Manager(),

        init() {
            this.Buttons.init()
            this.Gui.init()
        },
    }
    return e
}
