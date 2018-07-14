function GuiManager() {
    var g = {
        init() {
            this.rBars = document.querySelectorAll('#main .right-pane .main-info .bar')
            this.rBarValues = document.querySelectorAll('#main .right-pane .main-info .bar .value')
            this.rCharacterName = document.querySelector('#main .right-pane .main-info .character-name')
            this.rContent = document.querySelector('#main .center-pane .content')
            this.rControlButtons = document.querySelectorAll('#main .center-pane > .buttons .kbutton')
            this.rDay = document.querySelector('#main .left-pane .timeholder .day .value')
            this.rPlaceName = document.querySelector('#main .left-pane .main-info .place .description')
            this.rRegionName = document.querySelector('#main .left-pane .main-info .region-name')
            this.rTime = document.querySelector('#main .left-pane .timeholder .time .value')
        },

        blankScreen() {
            this.rCharacterName.innerHTML = '&nbsp;'
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
            for (var i = 0, len = this.rControlButtons.length; i < len; i++) {
                this.rControlButtons[i].classList.remove('active')
                this.rControlButtons[i].children[0].innerHTML = '&nbsp;'
            }
        },
    }

    return g
}

function ButtonManager(eventQueue) {
    var b = {
        eventQueue: eventQueue,

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
                    // console.log('got a keyboard press', btn)
                    this.eventQueue.dispatch('btn ' + btn)
                }
            })
        },

        pressHandler(event) {
            event.preventDefault()
            // console.log('got a button press', event.currentTarget.dataset.btn)
            this.eventQueue.dispatch('btn ' + event.currentTarget.dataset.btn)
        },
    }

    return b
}

// EventQueue turns a series of async incoming events into a sync stream of handler calls.
// only works if all handlers are sync (don't return promises or w/e)
function EventQueue() {
    var e = {
        workingOnHandlers: false, // manually-controlled mutex
        pendingHandlers: [],
        handlers: {},

        workingOnEvents: false, //manually-controlled mutex
        pendingEvents: [],

        addHandler(name, handler) {
            this.pendingHandlers.push({
                'name': name,
                'handler': handler
            })

            if (!this.workingOnHandlers) {
                this.workingOnHandlers = true

                while (true) {
                    var newHandler = this.pendingHandlers.shift()

                    if (newHandler === undefined) {
                        break
                    }

                    var currentHandlers = this.handlers[name]

                    if (currentHandlers == null) {
                        currentHandlers = []
                    }

                    currentHandlers.push(handler)

                    this.handlers[name] = currentHandlers
                }

                this.workingOnHandlers = false
            }
        },

        dispatch(name) {
            // console.log('dispatching event', name)
            this.pendingEvents.push(name)

            if (!this.workingOnEvents) {
                this.workingOnEvents = true

                while (true) {
                    var newEvent = this.pendingEvents.shift()
                    if (newEvent === undefined) {
                        break
                    }

                    var handlers = this.handlers[newEvent]
                    if (handlers == null) {
                        continue
                    }

                    for (var i = 0, len = handlers.length; i < len; i++) {
                        // console.log('calling handler', handlers[i], 'with event', newEvent)
                        handlers[i](newEvent)
                    }
                }

                this.workingOnEvents = false
            }
        },
    }

    return e
}

function Engine() {
    var eq = EventQueue()

    var e = {
        state: 'start',

        Buttons: ButtonManager(eq),
        Events: eq,
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
