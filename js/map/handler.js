import * as buttons from '../modules/buttons.js'
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

var imgErrorPattern

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
            e.contentPages.addNewPageText(`Could not load region ` + currentRegion)
            return
        }

        // load place
        if (currentPlace === undefined) {
            currentPlace = region.defaultPlace
        }
        var place = region.places[currentPlace]
        if (place === undefined) {
            e.contentPages.addNewPageText(`Could not load place ` + currentRegion + '->' + currentPlace)
            return
        }

        if (enteringRegion) {
            e.advanceTime({
                minutes: 2.3,
            })
        }

        // if we're moving between regions, move to the new one
        //TODO(dan): Click buttons to go to external places if that's being done, etc
        if (!enteringRegion && event.startsWith('btn ')) {
            var pressedBtn = event.substr(4)
            var direction = buttonToDirection[pressedBtn]
            var newPlace = place.links[direction]
            if (newPlace === undefined || newPlace === '') {
                // invalid button press
                return
            }
            place = region.places[newPlace]
            if (place === undefined) {
                e.contentPages.addNewPageText(`Could not load place ` + currentRegion + '->' + currentPlace)
                return
            }
            e.Data.set('place', newPlace)
            currentPlace = newPlace

            // assume travelling takes time
            e.advanceTime({
                minutes: 1.7,
            })
        }

        // kill all existing buttons
        e.Gui.wipeControlButtons()
        e.wipeMapSceneButtons()

        // load movement buttons
        for (const [direction, handler] of Object.entries(place.links)) {
            if (['n', 'e', 's', 'w'].includes(direction) && place.links[direction] !== '') {
                const btn = directionToButton[direction]
                e.Gui.addButton(btn, directionNames[direction])
            }
        }

        // load time waiting button
        e.Gui.addButton('t', 'Wait')

        // load scene buttons
        if (place.scenes !== undefined) {
            for (const scene of place.scenes) {
                const btn = e.Gui.nextFreeControlButton()
                // console.log('adding scene button', scene.scene, 'as button', btn)
                e.Gui.addButton(btn, scene.name, scene.name, scene.description)
                e.mapSceneButtons[btn] = scene.scene
            }
        }

        // update button hover information
        buttons.updateButtonHoverInfo()

        generateMap(e, currentRegion, currentPlace)

        if (place.desc) {
            e.contentPages.addNewPage(md.render(place.desc))
        } else {
            if (enteringRegion) {
                // e.Gui.rContent.innerText = 
                e.contentPages.addNewPage(md.render(`Entered region **` + region.name + '->' + currentPlace + '**\n\nNo Description'))
                return
            }
            e.contentPages.addNewPage(md.render(`Travelling region **` + region.name + '->' + currentPlace + '**\n\nNo Description'))
        }
    }

    e.Events.addAllButtonHandler(mapHandler)
    e.Events.addHandler('mapStart', mapHandler)

    e.currentSampledMap = ''
    e.regionMapElement = document.getElementById('region-map')
    e.currentMapCanvasElement = null

    imgErrorPattern = createPinstripeCanvas('#abaad4', '#942445', 11)

    e.mapSceneButtons = {}
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
    // console.log(graphicalMapText)
    if (samplingMapText !== e.currentSampledMap) {
        // console.log('map changed')
        e.currentSampledMap = samplingMapText
    } else {
        // console.log('map is the same')
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
            if (1 < spaceAttributes.count) {
                var pattern = ctx.createPattern(imgErrorPattern, 'repeat')
                ctx.fillStyle = pattern
            }
            if (x === 0 && y === 0) {
                ctx.fillStyle = '#946564'
                // console.log('place is:', x, y, 'or', x + offsetX, y + offsetY, 'or', mapPlaceWidth * (x + offsetX) + mapWSpace * Math.max(0, x + offsetX - 1), mapPlaceHeight * (y + offsetY) + mapHSpace * Math.max(0, y + offsetY - 1))
            }

            const drawPlaceW = mapPlaceWidth * (x + offsetX) + mapWSpace * (x + offsetX),
                drawPlaceH = mapPlaceHeight * (y + offsetY) + mapHSpace * (y + offsetY)

            roundedRect(ctx, drawPlaceW, drawPlaceH, mapPlaceWidth, mapPlaceHeight, 10)

            ctx.fillStyle = '#eee'
            ctx.font = '13px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            var text = []

            if (1 < spaceAttributes.count) {
                text.push('overlap')
            }
            if (spaceAttributes.error) {
                text.push('error')
            }
            if (spaceAttributes.character) {
                text.push('char')
            }

            if (text !== []) {
                ctx.fillText(text.join(','), drawPlaceW + mapPlaceWidth / 2, drawPlaceH + mapPlaceHeight / 2)
            }
        }
    }

    // center the canvas
    const canvasWidth = canvas.getBoundingClientRect().width,
        canvasHeight = canvas.getBoundingClientRect().height,
        boundWidth = e.regionMapElement.getBoundingClientRect().width,
        boundHeight = e.regionMapElement.getBoundingClientRect().height

    const canvasCalcWidth = widthInPlaces * mapPlaceWidth + widthInSpacers * mapWSpace,
        canvasCalcHeight = heightInPlaces * mapPlaceHeight + heightInSpacers * mapHSpace,
        middleW = mapPlaceWidth * offsetX + mapWSpace * offsetX + mapPlaceWidth / 2,
        middleH = mapPlaceHeight * offsetY + mapHSpace * offsetY + mapPlaceHeight / 2

    const canvasCalcMidWidth = canvasWidth * (middleW / canvasCalcWidth),
        canvasCalcMidHeight = canvasHeight * (middleH / canvasCalcHeight)

    var canvasModifyMiddleW = Math.abs(boundWidth / 2 - canvasCalcMidWidth),
        canvasModifyMiddleH = Math.abs(boundHeight / 2 - canvasCalcMidHeight)

    if (boundWidth / 2 < canvasCalcMidWidth) {
        canvasModifyMiddleW *= -1
    }
    if (boundHeight / 2 < canvasCalcMidHeight) {
        canvasModifyMiddleH *= -1
    }

    // console.log('center of the map is:', canvasCalcMidWidth, canvasCalcMidHeight)
    // console.log('center of the bound is:', boundWidth / 2, boundHeight / 2)
    // console.log('ccc', canvasModifyMiddleW, canvasModifyMiddleH)

    canvas.style.left = canvasModifyMiddleW.toString() + 'px'
    // canvas.style.top = canvasModifyMiddleH.toString() + 'px'
    canvas.style.top = '-' + canvasCalcMidHeight + 'px' // 50% is handled by helper div in the map container
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

    var ctx = canvas.getContext('2d', {
        antialias: true
    });
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx.scale(dpr, dpr);
    return ctx;
}

// from https://stackoverflow.com/questions/32201479/continuous-hatch-line-needed-in-canvas-with-repeated-pattern
function createPinstripeCanvas(bgColor, stripeColor, size) {
    const patternCanvas = document.createElement('canvas');
    const pctx = patternCanvas.getContext('2d', {
        antialias: true
    });
    const CANVAS_SIDE_LENGTH = size;
    const WIDTH = CANVAS_SIDE_LENGTH;
    const HEIGHT = CANVAS_SIDE_LENGTH;
    const DIVISIONS = 4;

    patternCanvas.width = WIDTH;
    patternCanvas.height = HEIGHT;

    pctx.fillStyle = bgColor
    pctx.fillRect(0, 0, WIDTH, HEIGHT)

    pctx.fillStyle = stripeColor;

    // Top line
    pctx.beginPath();
    pctx.moveTo(0, HEIGHT * (1 / DIVISIONS));
    pctx.lineTo(WIDTH * (1 / DIVISIONS), 0);
    pctx.lineTo(0, 0);
    pctx.lineTo(0, HEIGHT * (1 / DIVISIONS));
    pctx.fill();

    // Middle line
    pctx.beginPath();
    pctx.moveTo(WIDTH, HEIGHT * (1 / DIVISIONS));
    pctx.lineTo(WIDTH * (1 / DIVISIONS), HEIGHT);
    pctx.lineTo(0, HEIGHT);
    pctx.lineTo(0, HEIGHT * ((DIVISIONS - 1) / DIVISIONS));
    pctx.lineTo(WIDTH * ((DIVISIONS - 1) / DIVISIONS), 0);
    pctx.lineTo(WIDTH, 0);
    pctx.lineTo(WIDTH, HEIGHT * (1 / DIVISIONS));
    pctx.fill();

    // Bottom line
    pctx.beginPath();
    pctx.moveTo(WIDTH, HEIGHT * ((DIVISIONS - 1) / DIVISIONS));
    pctx.lineTo(WIDTH * ((DIVISIONS - 1) / DIVISIONS), HEIGHT);
    pctx.lineTo(WIDTH, HEIGHT);
    pctx.lineTo(WIDTH, HEIGHT * ((DIVISIONS - 1) / DIVISIONS));
    pctx.fill();

    return patternCanvas;
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