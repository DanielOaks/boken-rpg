/**
 * GUI module.
 * @module core/gui
 */

/** The GuiManager controls the displayed content. */
export class GuiManager {
    constructor() {
        this.currentButtons = {}
        this.contentHistory = []
    }

    /** Initializes the GUI selectors. */
    init() {
        this.rBars = document.querySelectorAll('#main .right-pane .main-info .bar')
        this.rBarValues = document.querySelectorAll('#main .right-pane .main-info .bar .value')
        this.rPlayerName = document.querySelector('#main .right-pane .main-info .character-name')
        this.rContent = document.querySelector('#main .center-pane .content')
        this.rControlButtons = document.querySelectorAll('#main .center-pane > .buttons .kbutton')
        this.rDay = document.querySelector('#main .left-pane .timeholder .day .value')
        this.rPlaceName = document.querySelector('#main .left-pane .main-info .place .description')
        this.rRegionName = document.querySelector('#main .left-pane .main-info .region-name')
        this.rTime = document.querySelector('#main .left-pane .timeholder .time .value')
    }

    /** Blanks the whole screen and interface. */
    blankScreen() {
        this.rPlayerName.innerHTML = '&nbsp;'
        this.rContent.innerHTML = '&nbsp;'
        this.rDay.innerText = '0'
        this.rPlaceName.innerText = ''
        this.rRegionName.innerHTML = '&nbsp;'
        this.rTime.innerText = '00:00'
        for (var i = 0, len = this.rBars.length; i < len; i++) {
            this.rBars[i].style = 'background-position-x: calc(100% - 100% * (0 / 100));'
        }
        for (var i = 0, len = this.rBarValues.length; i < len; i++) {
            this.rBarValues[i].innerText = '0'
        }
        this.wipeControlButtons()
    }

    /** Wipes all displayed (and stored) game content. */
    wipeContent() {
        this.contentHistory = []
        this.rContent.innerHTML = '&nbsp'
    }

    /** Wipes all the control buttons (1-5,q-t,a-g). */
    wipeControlButtons() {
        for (var i = 0, len = this.rControlButtons.length; i < len; i++) {
            this.rControlButtons[i].classList.remove('active')
            this.rControlButtons[i].children[0].innerHTML = '&nbsp;'
            delete this.rControlButtons[i].dataset.title
            delete this.rControlButtons[i].dataset.description
        }
        this.currentButtons = {}
    }

    addButton(btn, shortName, title, description) {
        this.currentButtons[btn] = {
            'shortName': shortName,
            'title': title,
            'description': description,
        }

        var button = document.querySelector('#main .center-pane > .buttons .kbutton[data-btn="' + btn + '"]')
        button.classList.add('active')
        button.querySelector('.word').innerText = shortName
        button.dataset.title = title
        button.dataset.description = description
    }
}
