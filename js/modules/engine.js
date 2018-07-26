import * as data from './data.js'
import * as events from './events.js'
import * as buttons from './buttons.js'
import * as gui from './gui.js'

export class Engine {
    constructor() {
        this.Events = new events.Queue()
        this.Buttons = new buttons.Manager(this.Events)
        this.Data = new data.Store()
        this.Gui = new gui.Manager()
    }

    init() {
        this.Buttons.init()
        this.Gui.init()
    }
}
