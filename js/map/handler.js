import * as r from './regions.js'

var regions = r.regions

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