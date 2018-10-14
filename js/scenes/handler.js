import * as buttons from '../modules/buttons.js'
import * as s from './scenes.js'

var md = window.markdownit()
var scenes = s.scenes

// generic scene handler
export function setup(e) {
    function sceneMapStartHandler(event) {
        if (e.state !== 'map') {
            return false
        }
        if (!event.startsWith('btn ')) {
            return false
        }

        var pressedBtn = event.substr(4)
        var sceneToLoad = e.mapSceneButtons[pressedBtn]
        if (sceneToLoad === undefined) {
            return false
        }

        startScene(sceneToLoad)

        // return true to stop sceneHandler from stomping and responding to the event as well
        return true
    }

    function sceneStartHandler(event) {
        const sceneToLoad = e.Data.get('scene.name')
        startScene(sceneToLoad)
    }

    function startScene(sceneToLoad) {
        var scene = scenes[sceneToLoad]
        if (scene === undefined) {
            console.log('ERROR: tried to load scene', sceneToLoad, 'but could not')
            return false
        }

        e.state = 'scene'
        e.Data.set('scene.name', sceneToLoad)
        e.Data.set('scene.page', 0)

        e.contentPages.addNewPageText("We're running scene " + sceneToLoad + ", page 0, but there's no content for it yet")

        processPage(e, scene, 0, '')
    }

    function sceneHandler(event) {
        if (e.state !== 'scene') {
            return false
        }

        // see if button is a current scene button, ignore if it isn't
        var sceneButtonPressed = ''
        if (event.startsWith('btn ')) {
            const btn = event.substr(4)
            sceneButtonPressed = e.sceneButtons[btn]
            if (sceneButtonPressed === undefined) {
                return false
            }
        }

        var currentSceneName = e.Data.get('scene.name')
        var currentScenePage = e.Data.get('scene.page')
        currentScenePage += 1
        e.Data.set('scene.page', currentScenePage)

        var scene = scenes[currentSceneName]
        if (scene === undefined) {
            console.log('ERROR: tried to load scene', currentSceneName, 'for follow-up page, but could not')
            return false
        }

        if (scene.pages.length <= currentScenePage) {
            // wipe buttons in preparation for map start
            e.Gui.wipeControlButtons()
            e.wipeMapSceneButtons()

            // if the scene has a specific place to move on exit, do that
            if (scene.exitRegion) {
                e.enterNewRegion(scene.exitRegion, scene.exitPlace)
            }

            // if scene has a specific amount of time to progress, do that
            if (scene.exitDuration) {
                e.advanceTime(scene.exitDuration)
            }

            // scene is finished, return to map
            //TODO(dan): maybe save existing state and restore to it instead of just going to map?
            e.state = 'map'
            e.Events.dispatch('mapStart')
            return true
        }

        e.contentPages.addNewPageText("We're in scene " + currentSceneName + ", page " + currentScenePage + ", but there's no content for it yet")

        processPage(e, scene, currentScenePage, sceneButtonPressed)
    }

    e.Events.addAllButtonHandler(sceneMapStartHandler)
    e.Events.addAllButtonHandler(sceneHandler)
    e.Events.addHandler('sceneStart', sceneStartHandler)

    e.sceneButtons = {}
}

function processPage(e, scene, pageNumber, sceneButtonPressed) {
    // wipe existing buttons
    e.Gui.wipeControlButtons()
    e.wipeSceneButtons()

    // get existing time for comparison later
    const oldTime = Math.floor(e.getCurrentTime().totalMinutes)

    // run page
    var pageContent = {}
    if (pageNumber < scene.pages.length) {
        pageContent = scene.pages[pageNumber]

        // see if pageContent is a string or not?
        if (typeof pageContent === 'string') {
            e.parser.replaceLatestPage(pageContent)
        } else if (typeof pageContent === 'function') {
            pageContent(e, scene, pageNumber, sceneButtonPressed)
        } else {
            console.log('ERROR: type of pageContent', typeof pageContent, 'not supported:', pageContent, scene, pageNumber, sceneButtonPressed)
        }
    } else {
        console.log('ERROR: scene is not valid:', scene, pageNumber)
    }

    console.log('aight, page', pageNumber, 'and control buttons are', e.Gui.controlButtonsExist(), e.Gui.currentButtons)
    if (!e.Gui.controlButtonsExist()) {
        // if no buttons were added, just add a basic Continue button
        e.addSceneButton('', 'Continue')
    }

    // update time if page doesn't explicitly say not to
    if (e.state == 'map') {
        e.advanceTime({
            minutes: 2.4,
        })
    } else {
        const newTime = Math.floor(e.getCurrentTime().totalMinutes)
        if ((!pageContent.dontAdvanceTime) && oldTime == newTime) {
            if (pageContent.duration) {
                e.advanceTime(pageContent.duration)
            } else {
                e.advanceTime({
                    minutes: 6.7, // assume that default, page takes like 6-7 mins?
                })
            }
        }
    }

    // update button hover information
    buttons.updateButtonHoverInfo()
}