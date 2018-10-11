/**
 * Buttons module.
 * @module core/buttons
 */

/** The ButtonManager controls the user-pressable and activatable buttons. */
export class ButtonManager {
    constructor(eventQueue) {
        this.eventQueue = eventQueue

        this.keyPresses = {}
    }

    /** Initializes all standard buttons. */
    init() {
        this._initButtons('')

        // add event listener for keyboard presses
        document.addEventListener('keypress', (event) => {
            // let it work fine when they're typing into an input field
            if (event.target.tagName == 'INPUT') {
                return
            }

            event.preventDefault()

            var btn = this.keyPresses[event.key]
            if (btn != null) {
                // console.log('got a keyboard press', btn)
                this.eventQueue.dispatch('btn ' + btn)
            }
        })
    }

    /** Initializes any buttons newly-added to the game content page. */
    initContent() {
        this._initButtons('#main .center-pane .content ')
    }

    _initButtons(prefix) {
        // press buttons
        var pressButtons = document.querySelectorAll(prefix + '[data-btn]')
        for (var i = 0, len = pressButtons.length; i < len; i++) {
            pressButtons[i].addEventListener('click', (event) => {
                event.preventDefault()
                // console.log('got a button press', event.currentTarget.dataset.btn)
                this.eventQueue.dispatch('btn ' + event.currentTarget.dataset.btn)
            })
        }

        // keyboard presses
        var keyButtons = document.querySelectorAll(prefix + '[data-btn][data-keypress]')
        for (var i = 0, len = keyButtons.length; i < len; i++) {
            this.keyPresses[keyButtons[i].dataset.keypress] = keyButtons[i].dataset.btn
        }
    }
}

/** Updates the button-hover information display. */
export function updateButtonHoverInfo() {
    var hoverHint = document.querySelector('#hover-hint')
    var hoverHintTitle = document.querySelector('#hover-hint .title')
    var hoverHintDescription = document.querySelector('#hover-hint .description')

    const btnName = hoverHint.dataset.btn
    if (btnName === undefined) {
        return
    }

    var hoverButtons = document.querySelectorAll('.canhover')
    for (var btn of hoverButtons) {
        if (btn.dataset.btn == btnName) {
            if (btn.classList.contains('active')) {
                var title = btn.dataset.title
                var description = btn.dataset.description
                if ((title === undefined) || (description === undefined)) {
                    hoverHint.classList.add('hidden')
                    return
                }
                hoverHintTitle.innerText = title
                hoverHintDescription.innerText = description
                hoverHint.classList.remove('hidden')
            } else {
                hoverHint.classList.add('hidden')
            }
        }
    }
}

/** Sets up the button-hover information displays. */
export function setupButtonHoverInfo() {
    // add hover-info handler
    var hoverButtons = document.querySelectorAll('.canhover')
    var hoverHint = document.querySelector('#hover-hint')
    hoverHint.classList.add('hidden')
    var hoverHintTitle = document.querySelector('#hover-hint .title')
    var hoverHintDescription = document.querySelector('#hover-hint .description')
    for (var i = 0, len = hoverButtons.length; i < len; i++) {
        hoverButtons[i].addEventListener('mouseenter', (event) => {
            // console.log('hovering over button', event.currentTarget, event.currentTarget.dataset.title)
            hoverHint.dataset.btn = event.currentTarget.dataset.btn
            var title = event.currentTarget.dataset.title
            var description = event.currentTarget.dataset.description
            if ((title === undefined) || (description === undefined)) {
                return
            }
            hoverHintTitle.innerText = title
            hoverHintDescription.innerText = description
            hoverHint.classList.remove('hidden')
        })
        hoverButtons[i].addEventListener('mouseleave', (event) => {
            // console.log('  no longer hovering over button', event.currentTarget)
            delete hoverHint.dataset.btn
            hoverHint.classList.add('hidden')
        })
    }
}