function GuiManager() {
    var g = {
        init() {
            this.rPlaceName = document.querySelector('#main .left-pane .main-info .place .description')
            this.rRegionName = document.querySelector('#main .left-pane .main-info .region-name')
            this.rControlButtons = document.querySelectorAll('#main .center-pane > .buttons .kbutton')
            this.content = document.querySelector('#main .center-pane .content')
            this.day = document.querySelector('#main .left-pane .timeholder .day .value')
            this.time = document.querySelector('#main .left-pane .timeholder .time .value')
        },

        blankScreen() {
            this.rPlaceName.innerText = ''
            this.rRegionName.innerHTML = '&nbsp;'
            this.content.innerHTML = '&nbsp;'
            this.day.innerText = '0'
            this.time.innerText = '00:00'
            for (var i = 0, len = this.rControlButtons.length; i < len; i++) {
                this.rControlButtons[i].classList.remove('active')
                this.rControlButtons[i].children[0].innerHTML = '&nbsp;'
            }
        },
    }

    return g
}

function ButtonManager() {
    var b = {
        keyPresses: {},

        init() {
            // press buttons
            var pressButtons = document.querySelectorAll('[data-btn]')
            for (var i = 0, len = pressButtons.length; i < len; i++) {
                pressButtons[i].addEventListener('click', this.pressHandler)
            }

            // keyboard presses
            var keyButtons = document.querySelectorAll('[data-btn][data-keypress]')
            for (var i = 0, len = keyButtons.length; i < len; i++) {
                this.keyPresses[keyButtons[i].dataset.keypress] = keyButtons[i].dataset.btn
            }

            // add event listener for keyboard presses
            document.addEventListener('keypress', (event) => {
                event.preventDefault()

                var btn = this.keyPresses[event.key]
                if (btn != null) {
                    console.log('got a keyboard press', btn)
                }
            })
        },

        pressHandler(event) {
            event.preventDefault()
            console.log('got a button press', event.currentTarget.dataset.btn)
        },
    }

    return b
}

function Engine() {
    var e = {
        state: 'start',

        Buttons: ButtonManager(),
        Gui: GuiManager(),

        init() {
            this.Buttons.init()
            this.Gui.init()
        },
    }
    return e
}

var engine = Engine()

// initialize when page is loaded
Zepto(function ($) {
    engine.init()
    engine.Gui.blankScreen()
})
