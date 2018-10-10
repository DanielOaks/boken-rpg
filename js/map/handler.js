import * as r from './regions.js'

var regions = r.regions

var oppositeDirs = {
    'n': 's',
    's': 'n',
    'e': 'w',
    'w': 'e',
}

var directionToButton = {
    'n': 'w',
    'w': 'a',
    's': 's',
    'e': 'd',
}
var buttonToDirection = {}
for (const [k, v] of Object.entries(directionToButton)) {
    buttonToDirection[v] = [k]
}

var directionNames = {
    'n': 'North',
    'w': 'West',
    's': 'South',
    'e': 'East',
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
            var direction = buttonToDirection[pressedBtn]
            var newPlace = place.links[direction]
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
        for (const [direction, handler] of Object.entries(place.links)) {
            if (['n', 'e', 's', 'w'].includes(direction) && place.links[direction] !== '') {
                var btn = directionToButton[direction]
                e.Gui.addButton(btn, directionNames[direction])
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
    e.Events.addHandler('mapStart', mapHandler)

    console.log('region map generation', regions.troto)
    generateMap(regions.troto)
}

function generateMap(region) {
    var exampleMap = []
    console.log('aaa', exampleMap)
    var minX = 0,
        maxX = 0,
        minY = 0,
        maxY = 0
    var searchedPlaces = {}

    var defaultPlace = region.places[region.defaultPlace]
    if (defaultPlace === null) {
        return null
    }

    // adds searchables (respecting the entry direction if given), updates min/max
    // also skips the place if it's already in searchedPlaces
    // side-effects all over the function vars, but this is expected
    function processPlace(name, place, entryDirection, x, y) {
        // make sure we don't process the same place twice
        if (searchedPlaces[name] === true) {
            return {}
        }
        searchedPlaces[name] = true

        // add to our example map for now
        if (exampleMap[x] === undefined) {
            exampleMap[x] = {}
        }
        exampleMap[x][y] = true

        var theseSearchables = []

        console.log('processing place', place, entryDirection, x, y)

        if (x < minX) {
            minX = x
        } else if (maxX < x) {
            maxX = x
        }
        if (x < minY) {
            minY = y
        } else if (maxY < x) {
            maxY = y
        }

        for (const [dir, linkName] of Object.entries(place.links)) {
            if (dir === entryDirection) {
                continue
            }
            if (linkName === undefined || linkName === '') {
                continue
            }
            var link = region.places[linkName]
            if (link === undefined) {
                //TODO(dan): add some error indication here
                continue
            }

            // make new x and y
            var newX = x,
                newY = y

            switch (dir) {
            case 'n':
                newY += 1
                break;
            case 's':
                newY -= 1
                break;
            case 'e':
                newX += 1
                break;
            case 'w':
                newX -= 1
                break;

            default:
                console.log('somethine went wrong while evaluating map:', name, place, entryDirection, x, y);
                return
            }

            var newDir = oppositeDirs[dir]

            theseSearchables.push({
                'name': linkName,
                'link': link,
                'entryDir': newDir,
                'x': newX,
                'y': newY,
            })
        }

        return theseSearchables
    }
    var searchables = processPlace(region.defaultPlace, defaultPlace, null, 0, 0)
    console.log('searchables discovered:', searchables)

    while (0 < searchables.length) {
        var newPlace = searchables.pop()
        var newSearchables = processPlace(newPlace.name, newPlace.link, newPlace.entryDir, newPlace.x, newPlace.y)

        console.log('searchables discovered:', newSearchables)
        while (0 < newSearchables.length) {
            searchables.push(newSearchables.pop())
        }
    }

    console.log('mapped out:', minX, maxX, minY, maxY)
    console.log(exampleMap)

    // make text representation of map
    var mapText = ''
    for (var y = minY; y <= maxY; y++) {
        for (var x = minX; x <= maxX; x++) {
            if (x == 0 && y == 0) {
                mapText += '0'
            } else if (exampleMap[x][y] === true) {
                mapText += 'x'
            } else {
                mapText += ' '
            }
        }
        mapText += '\n'
    }
    console.log(mapText)
}