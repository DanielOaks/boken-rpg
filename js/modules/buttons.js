export function Manager(eventQueue) {
    var b = {
        eventQueue: eventQueue,

        keyPresses: {},

        init() {
            this._init_buttons('')

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
        },

        init_content() {
            this._init_buttons('#main .center-pane .content ')
        },

        _init_buttons(prefix) {
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
        },
    }

    return b
}
