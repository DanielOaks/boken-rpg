var exampleRegion = {
    'name': 'Examplora',
    'defaultPlace': 'ship',
    'places': {
        'ship': {
            'desc': "Your ship sits here, some workers scurrying about",
            'links': {
                's': 'shipWalkway1',
            },
        },
        'shipWalkway1': {
            'desc': "There's a walkway overlooking both some of the ships being built and the desert far, far below you.",
        },
    },
}

var regions = {
    'example': exampleRegion,
}

var directionNames = {
    'w': 'North',
    's': 'South',
    'a': 'West',
    'd': 'East',
}

// generic map handler
export function setup(e) {
    function mapHandler(event) {
        if (e.state !== 'map') {
            return false
        }
        var enteringRegion = e.enteringRegion
        if (enteringRegion) {
            e.enteringRegion = false
        }
        var currentRegion = e.Data.get('region')
        var currentPlace = e.Data.get('place')

        // kill all existing buttons
        e.Gui.wipeControlButtons()

        // load region
        var region = regions[currentRegion]
        if (region === undefined) {
            e.Gui.rContent.innerText = `Could not load region ` + currentRegion
            return
        }

        // load place
        if (currentPlace === undefined) {
            currentPlace = region.defaultPlace
        }
        var place = region.places[currentPlace]
        if (place === undefined) {
            e.Gui.rContent.innerText = `Could not load place ` + currentRegion + '->' + currentPlace
            return
        }

        // load movement buttons
        for (const [key, handler] of Object.entries(place.links)) {
            if (['w', 'a', 's', 'd'].includes(key)) {
                e.Gui.addButton(key, 'Move ' + directionNames[key])
            }
        }

        if (enteringRegion) {
            e.Gui.rContent.innerText = `Entered region ` + region.name + '->' + currentPlace
            return
        }
        e.Gui.rContent.innerText = `Travelling region ` + region.name + '->' + currentPlace
    }

    e.Events.addAllButtonHandler(mapHandler)
}