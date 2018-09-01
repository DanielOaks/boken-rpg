/**
 * Engine module.
 * @module core/engine
 */

import * as data from './data.js'
import * as events from './events.js'
import * as buttons from './buttons.js'
import * as gui from './gui.js'

/** GameEngine stores game state and controls everything. */
export class GameEngine {
    constructor() {
        this.Events = new events.EventQueue()
        this.Buttons = new buttons.ButtonManager(this.Events)
        this.Data = new data.Datastore()
        this.Gui = new gui.GuiManager()
        this.state = 'start'
    }

    /** Initialises the GameEngine, grabs required button and GUI elements. */
    init() {
        this.Buttons.init()
        this.Gui.init()
    }

    /** Sets a new region (and optionally place).
     * @param {string} region - Region to enter.
     * @param {string} [place] - Specific place to enter.
     */
    enterNewRegion(region, place) {
        if (place === null) {
            place = ''
        }
        this.enteringRegion = true
        this.Data.set('region', region)
        this.Data.set('place', place)
        this.state = 'map' //TODO(dan): maybe required, maybe not? make optional eventually
    }

    // here be convenience functions

    /** Returns the player's name. */
    pName() {
        return this.Data.get('player.name', 'NoName')
    }
}