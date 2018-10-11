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

// sizes in CSS pixels, because why not
const mapPlaceHeight = 40
const mapPlaceWidth = 40
const mapHSpace = 20
const mapWSpace = 20

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

        generateMap(e, currentRegion, currentPlace)

        if (enteringRegion) {
            // e.Gui.rContent.innerText = 
            e.Gui.rContent.innerHTML = md.render(`Entered region **` + region.name + '->' + currentPlace + '**\n\n' + place.desc)
            return
        }
        e.Gui.rContent.innerHTML = md.render(`Travelling region **` + region.name + '->' + currentPlace + '**\n\n' + place.desc)
    }

    e.Events.addAllButtonHandler(mapHandler)
    e.Events.addHandler('mapStart', mapHandler)

    e.currentSampledMap = ''
    e.regionMapElement = document.getElementById('region-map')
    e.currentMapCanvasElement = null

    //TODO(dan): put the default region+place strings somewhere more appropriate?
    var regionName = e.Data.get('region', 'troto')
    var place = e.Data.get('place', 'castleCourtyard')
    generateMap(e, regionName, place)
}

function generateMap(e, regionName, place) {
    var mapAttributes = []
    var minX = 0,
        maxX = 0,
        minY = 0,
        maxY = 0
    var searchedPlaces = {}

    var region = regions[regionName]
    if (region === undefined) {
        console.log('ERROR: could not find region', regionName, 'for map generation')
        return null
    }

    var defaultPlace = region.places[place]
    if (defaultPlace === null) {
        console.log('ERROR: could not find place', place, 'on region', regionName, 'for map generation')
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

        // set our map attributes
        if (mapAttributes[x] === undefined) {
            mapAttributes[x] = {}
        }
        var spaceAttributes = mapAttributes[x][y]

        if (spaceAttributes === undefined) {
            spaceAttributes = {
                count: 0,
                names: [],
            }
        }
        spaceAttributes.count = spaceAttributes.count + 1
        spaceAttributes.names.push(name)

        delete spaceAttributes.character
        if (place.character) {
            spaceAttributes.character = true
        }

        mapAttributes[x][y] = spaceAttributes

        // set min/max bounding for sizes
        if (x < minX) {
            minX = x
        } else if (maxX < x) {
            maxX = x
        }
        if (y < minY) {
            minY = y
        } else if (maxY < y) {
            maxY = y
        }

        // new searchable locations from here
        var theseSearchables = []

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
                mapAttributes[x][y].error = true
                continue
            }

            // make new x and y
            var newX = x,
                newY = y

            switch (dir) {
            case 'n':
                newY -= 1
                break;
            case 's':
                newY += 1
                break;
            case 'e':
                newX += 1
                break;
            case 'w':
                newX -= 1
                break;

            default:
                console.log('ERROR: somethine went wrong while evaluating map:', name, place, entryDirection, x, y);
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

    while (0 < searchables.length) {
        var newPlace = searchables.shift()

        var newSearchables = processPlace(newPlace.name, newPlace.link, newPlace.entryDir, newPlace.x, newPlace.y)
        while (0 < newSearchables.length) {
            searchables.push(newSearchables.pop())
        }
    }

    // make text representation of map
    var samplingMapText = '' // data representation of the map for comparison purposes
    var graphicalMapText = '' // nice visual representation of the map for the console
    for (var y = minY; y <= maxY; y++) {
        for (var x = minX; x <= maxX; x++) {
            var spaceAttributes = mapAttributes[x][y]

            // modify sampling map text
            if (spaceAttributes === undefined) {
                samplingMapText += '-'
            } else {
                samplingMapText += spaceAttributes.count.toString()
                if (spaceAttributes.error) {
                    samplingMapText += 'e'
                }
                if (spaceAttributes.character) {
                    samplingMapText += 'c'
                }
            }

            // modify graphical map text
            if (x == 0 && y == 0) {
                graphicalMapText += '0'
            } else if (spaceAttributes === undefined || spaceAttributes.count === 0) {
                graphicalMapText += ' '
            } else if (spaceAttributes.count === 1) {
                if (spaceAttributes.error) {
                    graphicalMapText += 'e'
                } else if (spaceAttributes.character) {
                    graphicalMapText += 'c'
                } else {
                    graphicalMapText += 'x'
                }
            } else {
                graphicalMapText += spaceAttributes.count.toString()
            }
        }
        samplingMapText += '\n'
        graphicalMapText += '\n'
    }
    console.log(graphicalMapText)
    if (samplingMapText !== e.currentSampledMap) {
        console.log('map changed, redrawing')
        e.currentSampledMap = samplingMapText

        // var newMapContainer = document.createElement('div')
        // newMapContainer.classList.add('map')

        // for (var y = minY; y <= maxY; y++) {
        //     for (var x = minX; x <= maxX; x++) {
        //         var spaceAttributes = mapAttributes[x][y]
        //         if (spaceAttributes === undefined || spaceAttributes.count === 0) {
        //             continue
        //         }

        //         var newPlaceDiv = document.createElement('div')
        //         newPlaceDiv.classList.add('map-place')
        //         newPlaceDiv.dataset['name'] = spaceAttributes.names[0]

        //         // set attributes
        //         if (spaceAttributes.error) {
        //             newPlaceDiv.classList.add('error')
        //         }
        //         if (spaceAttributes.character) {
        //             newPlaceDiv.classList.add('char')
        //         }

        //         if (x == 0 && y == 0) {
        //             newPlaceDiv.id = 'mapCurrentPcPlace'
        //             newPlaceDiv.classList.add('pc')
        //         }

        //         // set location lol
        //         var borderX = Math.max(0, Math.abs(x) - 1)
        //         if (x < 0) {
        //             borderX *= -1
        //         }
        //         newPlaceDiv.style.left = 'calc(' + x + '*' + mapPlaceWidth + '+' + borderX + '*' + mapHSpace + ')'
        //         console.log('left style:', 'calc(' + x + '*' + mapPlaceWidth + '+' + borderX + '*' + mapHSpace + ')')

        //         // and append
        //         newMapContainer.appendChild(newPlaceDiv)
        //     }
        // }

        // console.log('new element:', newMapContainer)

        // e.regionMapElement.innerHTML = newMapContainer.innerHTML
    } else {
        console.log('map is the same')
    }

    // remove old canvas
    if (e.currentMapCanvasElement !== null) {
        e.currentMapCanvasElement.parentNode.removeChild(e.currentMapCanvasElement)
        e.currentMapCanvasElement = null
    }

    // generate and apply new map canvas
    const widthInPlaces = Math.abs(minX - maxX) + 1
    const heightInPlaces = Math.abs(minY - maxY) + 1
    const widthInSpacers = Math.abs(minX - maxX)
    const heightInSpacers = Math.abs(minY - maxY)

    var canvas = document.createElement('canvas')
    canvas.width = widthInPlaces * mapPlaceWidth + widthInSpacers * mapWSpace
    canvas.height = heightInPlaces * mapPlaceHeight + heightInSpacers * mapHSpace

    e.currentMapCanvasElement = canvas
    e.regionMapElement.appendChild(canvas)

    var ctx = setupCanvas(canvas)

    const offsetX = Math.abs(minX)
    const offsetY = Math.abs(minY)

    //TODO(dan): store connections between places and draw them on the canvas too

    for (var y = minY; y <= maxY; y++) {
        for (var x = minX; x <= maxX; x++) {
            var spaceAttributes = mapAttributes[x][y]
            if (spaceAttributes === undefined || spaceAttributes.count === 0) {
                continue
            }

            ctx.fillStyle = '#656494';
            if (spaceAttributes.error) {
                ctx.fillStyle = '#942445';
            }
            if (x === 0 && y === 0) {
                ctx.fillStyle = '#946564'
                console.log('place is:', x, y, 'or', x + offsetX, y + offsetY, 'or', mapPlaceWidth * (x + offsetX) + mapWSpace * Math.max(0, x + offsetX - 1), mapPlaceHeight * (y + offsetY) + mapHSpace * Math.max(0, y + offsetY - 1))
            }

            roundedRect(ctx, mapPlaceWidth * (x + offsetX) + mapWSpace * (x + offsetX), mapPlaceHeight * (y + offsetY) + mapHSpace * (y + offsetY), mapPlaceWidth, mapPlaceHeight, 10)
        }
    }

    // center the canvas
    canvas.style.left = '-150px'
    canvas.style.top = '-18px'
}

// canvas high-DPI setup function, from https://www.html5rocks.com/en/tutorials/canvas/hidpi/
function setupCanvas(canvas) {
    // Get the device pixel ratio, falling back to 1.
    var dpr = window.devicePixelRatio || 1;
    dpr = dpr * 1 //TODO(dan): maybe scale up a bit so the edges don't look so dodgy
    // Get the size of the canvas in CSS pixels.
    var rect = canvas.getBoundingClientRect();

    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px'

    var ctx = canvas.getContext('2d');
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx.scale(dpr, dpr);
    return ctx;
}

// canvas utility function, from the Mozilla MDN
function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.lineTo(x + width - radius, y + height);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.lineTo(x + width, y + radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.lineTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.fill();
}