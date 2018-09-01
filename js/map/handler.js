var exampleRegion = {
    'name': 'Examplora',
    'defaultPlace': 'ship',
    'places': {
        'ship': {
            'desc': `Your ship sits here, some workers scurrying about.\n\nTo the south is a walkway towards the town proper.`,
            'links': {
                's': 'shipWalkway1',
            },
        },
        'shipWalkway1': {
            'desc': `There's a walkway overlooking both some of the ships being built and the desert far, far below you.`,
            'links': {
                'w': 'ship',
            }
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
    var md = window.markdownit()

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

        // if we're moving between regions, move to the new one
        //TODO(dan): Click buttons to go to external places if that's being done, etc
        if (!enteringRegion) {
            var pressedBtn = event.substr(4)
            var newPlace = place.links[pressedBtn]
            if (newPlace === undefined) {
                // invalid button press
                return
            }
            place = region.places[newPlace]
            if (place === undefined) {
                e.Gui.rContent.innerText = `Could not load place ` + currentRegion + '->' + currentPlace
                return
            }
            e.Data.set('place', newPlace)
            currentPlace = newPlace
        }

        // kill all existing buttons
        e.Gui.wipeControlButtons()

        // load movement buttons
        for (const [key, handler] of Object.entries(place.links)) {
            if (['w', 'a', 's', 'd'].includes(key)) {
                e.Gui.addButton(key, 'Move ' + directionNames[key])
            }
        }

        if (enteringRegion) {
            // e.Gui.rContent.innerText = 
            e.Gui.rContent.innerHTML = md.render(`Entered region **` + region.name + '->' + currentPlace + '**\n\n' + place.desc)
            return
        }
        e.Gui.rContent.innerHTML = md.render(`Travelling region **` + region.name + '->' + currentPlace + '**\n\n' + place.desc)
    }

    e.Events.addAllButtonHandler(mapHandler)
}