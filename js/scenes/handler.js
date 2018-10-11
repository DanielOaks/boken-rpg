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
        var sceneToLoad = e.sceneButtons[pressedBtn]
        if (sceneToLoad === undefined) {
            return false
        }

        e.Gui.rContent.innerText = "We should load scene " + sceneToLoad + ", but we're not able to yet"
    }

    function sceneHandler(event) {
        if (e.state !== 'scene') {
            return false
        }
        var currentScene = e.Data.get('scene')
        e.Data.set('scene', currentScene + 'a')

        e.Gui.rContent.innerText = "We're in scene " + currentScene + ", but there's no content for it yet"
    }

    e.Events.addAllButtonHandler(sceneStartHandler)
    e.Events.addAllButtonHandler(sceneHandler)

    e.sceneButtons = {}
}