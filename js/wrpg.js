function GuiManager() {
    var g = {
        currentButtons: {},
        contentHistory: [],

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
        },

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
            this.wipeButtons()
        },

        wipeContent() {
            this.contentHistory = []
            this.rContent.innerHTML = '&nbsp'
        },
        wipeButtons() {
            for (var i = 0, len = this.rControlButtons.length; i < len; i++) {
                this.rControlButtons[i].classList.remove('active')
                this.rControlButtons[i].children[0].innerHTML = '&nbsp;'
                delete this.rControlButtons[i].dataset.title
                delete this.rControlButtons[i].dataset.description
            }
            this.currentButtons = {}
        },

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
        },
    }

    return g
}

function ButtonManager(eventQueue) {
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

// EventQueue turns a series of async incoming events into a sync stream of handler calls.
// only works if all handlers are sync (don't return promises or w/e).
// this is what allows the rest of the code to basically assume and run synchronously
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

                    if (currentHandlers === undefined) {
                        currentHandlers = []
                    }

                    currentHandlers.push(handler)

                    this.handlers[name] = currentHandlers
                }

                this.workingOnHandlers = false
            }
        },

        dispatch(name) {
            console.log('dispatching event "' + name + '" -', this.handlers[name] === undefined ? 0 : this.handlers[name].length, 'handler(s)')
            this.pendingEvents.push(name)

            if (!this.workingOnEvents) {
                this.workingOnEvents = true

                while (true) {
                    var newEvent = this.pendingEvents.shift()
                    if (newEvent === undefined) {
                        break
                    }

                    var handlers = this.handlers[newEvent]
                    if (handlers === undefined) {
                        continue
                    }

                    for (var i = 0, len = handlers.length; i < len; i++) {
                        // console.log('calling handler', handlers[i], 'with event', newEvent)
                        var returnVal = handlers[i](newEvent)

                        if (returnVal === true) {
                            break
                        }
                    }
                }

                this.workingOnEvents = false
            }
        },
    }

    return e
}

function Datastore() {
    var d = {
        _data: {},

        set(key, value) {
            this._data[key] = value
        },

        get(key, defaultValue) {
            var value = this._data[key]
            if (value === undefined) {
                return defaultValue
            }
            return value
        },

        has(key) {
            var value = this._data[key]
            return value === null
        },

        delete(key) {
            this._data.delete(key)
        },
    }

    return d
}

function Engine() {
    var eq = EventQueue()

    var e = {
        state: 'start',

        Buttons: ButtonManager(eq),
        Data: Datastore(),
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

    // add hover handler
    hoverButtons = document.querySelectorAll('.canhover')
    var hoverHint = document.querySelector('#hover-hint')
    hoverHint.classList.add('hidden')
    var hoverHintTitle = document.querySelector('#hover-hint .title')
    var hoverHintDescription = document.querySelector('#hover-hint .description')
    for (var i = 0, len = hoverButtons.length; i < len; i++) {
        hoverButtons[i].addEventListener('mouseenter', (event) => {
            // console.log('hovering over button', event.currentTarget, event.currentTarget.dataset.title)
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
            hoverHint.classList.add('hidden')
        })
    }

    // set initial content
    var content = document.querySelector('#main .center-pane .content')
    content.innerHTML = `
<h1 class="game-title">WRPG</h1>

<p>Welcome to WRPG! This RPG is a cool thing which you can play.</p>`

    engine.Gui.addButton('1', 'New Game', 'Start a new game', 'Start playing!')
    engine.Gui.addButton('2', 'Load', 'Load an existing game', 'Start playing!')

    // new game handler
    engine.Events.addHandler('btn 1', (event) => {
        if (engine.state !== 'start') {
            return false
        }

        engine.Data = Datastore()
        engine.state = 'intro'

        engine.Gui.wipeContent()
        engine.Gui.wipeButtons()

        engine.Gui.rContent.innerHTML = `
            <p>Troto, a small settlement to the south. A villiage of misfits and outcasts, and your home since you were little.</p>
            <p>How did you end up here? You barely remember anymore, probably for not being quite noble enough, not acting the right way, or just for taking some food to survive. Whatever it was, the people here took you in and helped raise you, even giving you a good education.</p>
            <p>Your name is <input class="name" type="text" placeholder="">, and you're a...</p>`

        engine.Data.set('intro-page', 0)

        engine.Gui.addButton('1', 'Human', 'Human', 'Pointy sticks and weird faces')
        engine.Gui.addButton('2', 'Unicorn', 'Unicorn', 'Magical druids')
        engine.Gui.addButton('3', 'Half-Wyvern', 'Half-Wyvern', 'Almost a dragon, but not quite')
        engine.Gui.addButton('4', 'Griffon', 'Griffon', 'Flappy Beak')

        return true
    })

    function introHandler(event) {
        if (engine.state !== 'intro') {
            return false
        }

        // get page number
        var currentIntroPage = engine.Data.get('intro.page', 0)

        // exit if corrent button isn't pressed for this page
        if ((currentIntroPage == 0) && !['btn 1', 'btn 2', 'btn 3', 'btn 4'].includes(event)) {
            return false
        }

        // info-grabbing before we wipe everything
        // can return false here to force more info to be entered
        var race = ''
        if (currentIntroPage == 0) {
            var name = engine.Gui.rContent.querySelector('.name').value.trim()

            if (name.length == 0) {
                return false
            }

            engine.Data.set('player.name', name)
            engine.Gui.rPlayerName.innerText = name

            switch (event) {
            case 'btn 1':
                race = 'Human'
                break
            case 'btn 2':
                race = 'Unicorn'
                break
            case 'btn 3':
                race = 'Half-Wyvern'
                break
            case 'btn 4':
                race = 'Griffon'
                break
            }
        }

        // set new page number
        engine.Data.set('intro.page', currentIntroPage + 1)

        // wipe content and buttons, to set new ones
        engine.Gui.wipeContent()
        engine.Gui.wipeButtons()

        // set content for this page
        if (currentIntroPage == 0) {
            engine.Gui.rContent.innerHTML = `
                <p>Nice to meet you, ` + engine.Data.get('player.name') + `. Oh wow, you're a ` + race + `!</p>`
        } else {
            engine.Gui.rContent.innerText = 'Here goes intro page ' + currentIntroPage + ' content, but we have none yet!'
        }

        return true
    }

    engine.Events.addHandler('btn 1', introHandler)
    engine.Events.addHandler('btn 2', introHandler)
    engine.Events.addHandler('btn 3', introHandler)
    engine.Events.addHandler('btn 4', introHandler)
})
