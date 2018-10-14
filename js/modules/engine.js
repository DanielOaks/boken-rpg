/**
 * Engine module.
 * @module core/engine
 */

import * as data from './data.js'
import * as events from './events.js'
import * as buttons from './buttons.js'
import * as gui from './gui.js'
import * as contentPages from '../misc/contentPages.js'
import * as sceneParser from '../misc/sceneParser.js';
import * as r from '../map/regions.js'

/** GameEngine stores game state and controls everything. */
export class GameEngine {
    constructor() {
        this.Events = new events.EventQueue()
        this.Buttons = new buttons.ButtonManager(this.Events)
        this.Data = new data.Datastore()
        this.Gui = new gui.GuiManager()
        this.contentPages = new contentPages.ContentPageStore(this)
        this.parser = new sceneParser.SceneParser(this)
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
        if (place === null || place === undefined) {
            place = ''
        }
        this.enteringRegion = true
        this.Data.set('region', region)
        this.Data.set('place', place)
        this.setRegionNames(region)
        this.state = 'map' //TODO(dan): maybe required, maybe not? make optional eventually
    }

    /** Sets the region (and optionally place) name.
     * @param {string} region - Region that we're in.
     * @param {string} [place] - Place name.
     */
    setRegionNames(regionName, place) {
        if (regionName == undefined) {
            this.Gui.rRegionName.innerHTML = '&nbsp;'
        } else {
            var region = r.regions[regionName]
            if (region !== undefined) {
                this.Gui.rRegionName.innerText = region.name
            }
        }
        if (place !== undefined) {
            this.Gui.rPlaceName.innerText = place
        }
    }

    // here be convenience functions
    wipeMapSceneButtons() {
        this.mapSceneButtons = {}
    }

    wipeSceneButtons() {
        this.sceneButtons = {}
    }

    addSceneButton(buttonId, shortName, title, description) {
        const btn = this.Gui.nextFreeControlButton()
        // console.log('adding scene button', buttonId, shortName, 'as button', btn)
        this.Gui.addButton(btn, shortName, title, description)
        this.sceneButtons[btn] = buttonId
    }

    advanceTime(details) {
        // we compose the incoming details to minutes, and then from minutes back to days/etc
        var minutes = 0

        // convert incoming to minutes
        if (details.minutes !== undefined) {
            minutes += details.minutes
        }
        if (details.hours !== undefined) {
            minutes += details.hours * 60
        }
        if (details.days !== undefined) {
            minutes += details.days * 24 * 60
        }

        // get current leftover minutes from data
        var spareMinutes = this.Data.get('time.minutes', 0)
        minutes += spareMinutes

        // advance days
        var days = this.Data.get('time.days', 0)
        while (24 * 60 <= minutes) {
            minutes -= 24 * 60
            days += 1
        }

        // store new time
        this.Data.set('time.days', days)
        this.Data.set('time.minutes', minutes)

        // show new time
        this._showTime()
    }

    getCurrentTime() {
        const days = this.Data.get('time.days', 0)
        var hours = 0
        var minutes = this.Data.get('time.minutes', 0)

        while (60 <= minutes) {
            minutes -= 60
            hours += 1
        }

        return {
            days: days,
            hours: hours,
            minutes: minutes,
            totalMinutes: minutes + hours * 60,
            timecode: ('00' + hours.toString()).slice(-2) + ':' + ('00' + Math.floor(minutes).toString()).slice(-2),
        }
    }

    _showTime() {
        var currentTime = this.getCurrentTime()
        this.Gui.rDay.innerText = currentTime.days.toString()
        this.Gui.rTime.innerText = currentTime.timecode
    }

    // here be script convenience functions

    /** Returns the player's name. */
    pName() {
        return this.Data.get('player.name', 'NoName')
    }
}