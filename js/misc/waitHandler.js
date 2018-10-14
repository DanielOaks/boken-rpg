const waitingTimes = {
    '1': {
        'name': '5 minutes',
        'description': '5 minutes',
        'duration': {
            'minutes': 5,
        },
    },
    '2': {
        'name': '10 minutes',
        'description': '10 minutes',
        'duration': {
            'minutes': 10,
        },
    },
    '3': {
        'name': '30 minutes',
        'description': '30 minutes',
        'duration': {
            'minutes': 30,
        },
    },
    'q': {
        'name': '1 hour',
        'description': '1 hour',
        'duration': {
            'hours': 1,
        },
    },
    'w': {
        'name': '2 hour',
        'description': '2 hour',
        'duration': {
            'hours': 2,
        },
    },
    'e': {
        'name': '3 hour',
        'description': '3 hour',
        'duration': {
            'hours': 3,
        },
    },
    't': {
        'name': 'Wait',
        'description': 'Wait 8 hours',
        'duration': {
            'hours': 8,
        },
    },
}

// generic map handler
export function setup(e) {
    var md = window.markdownit()

    function waitEntryHandler(event) {
        if (e.state !== 'map') {
            return false
        }
        if (event !== 'btn t') {
            return false
        }

        e.state = 'waitMenu'

        e.Gui.rContent.innerText = `How long would you like to wait for?`

        // kill all existing buttons
        e.Gui.wipeControlButtons()
        e.wipeMapSceneButtons()

        for (const [name, info] of Object.entries(waitingTimes)) {
            e.Gui.addButton(name, info.name, info.name, info.description)
        }
        e.Gui.addButton('g', 'Back')
        return true
    }

    function waitHandler(event) {
        if (e.state !== 'waitMenu') {
            return false
        }
        if (!event.startsWith('btn ')) {
            return false
        }
        const btn = event.substr(4)
        if (btn == 'g') {
            // return to map
            //TODO(dan): we should maybe do something like a pushState, popState? to support when different menus are brought up
            e.state = 'map'
            e.Events.dispatch('mapStart')
        } else if (waitingTimes[btn] !== undefined) {
            const wait = waitingTimes[btn].duration
            e.advanceTime(wait)
            // return to map
            //TODO(dan): we should maybe do something like a pushState, popState? to support when different menus are brought up
            e.state = 'map'
            e.Events.dispatch('mapStart')
        } else {
            return false
        }

        return true
    }

    e.Events.addAllButtonHandler(waitEntryHandler)
    e.Events.addAllButtonHandler(waitHandler)
}