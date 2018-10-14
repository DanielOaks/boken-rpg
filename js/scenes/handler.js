import * as buttons from '../modules/buttons.js'
import * as s from './scenes.js'

var md = window.markdownit()
var scenes = s.scenes

// generic scene handler
export function setup(e) {
    function sceneStartHandler(event) {
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

        var scene = scenes[sceneToLoad]
        if (scene === undefined) {
            console.log('ERROR: tried to load scene', sceneToLoad, 'but could not')
            return false
        }

        // region and place info are stored on map mpve, so we'll be able to restore to them
        // later upon scene exit \o/

        e.state = 'scene'
        e.Data.set('scene.name', sceneToLoad)
        e.Data.set('scene.page', 0)

        e.contentPages.addNewPageText("We're running scene " + sceneToLoad + ", page 0, but there's no content for it yet")

        processPage(e, scene, 0)

        // return true to stop sceneHandler from stomping and responding to the event as well
        return true
    }

    function sceneHandler(event) {
        if (e.state !== 'scene') {
            return false
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

            // scene is finished, return to map
            //TODO(dan): maybe save existing state and restore to it instead of just going to map?
            e.state = 'map'
            e.Events.dispatch('mapStart')
            return true
        }

        e.contentPages.addNewPageText("We're in scene " + currentSceneName + ", page " + currentScenePage + ", but there's no content for it yet")

        processPage(e, scene, currentScenePage)
    }

    e.Events.addAllButtonHandler(sceneStartHandler)
    e.Events.addAllButtonHandler(sceneHandler)

    e.mapSceneButtons = {}
}

function processPage(e, scene, pageNumber) {
    // wipe existing buttons
    e.Gui.wipeControlButtons()
    e.wipeMapSceneButtons()

    // get existing time for comparison later
    const oldTime = Math.floor(e.getCurrentTime().totalMinutes)

    // run page
    var pageContent = {}
    if (pageNumber < scene.pages.length) {
        pageContent = scene.pages[pageNumber]
        e.contentPages.replaceLatestPage(md.render(pageContent))
    } else {
        console.log('ERROR: scene is not valid:', scene, pageNumber)
    }

    if (!e.Gui.controlButtonsExist()) {
        // if no buttons loaded, just add a Continue button
        e.Gui.addButton('1', 'Continue')
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

    // show new time
    e.showTime()

    // update button hover information
    buttons.updateButtonHoverInfo()
}