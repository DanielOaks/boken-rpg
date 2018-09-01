// generic scene handler
export function setup(e) {
    function sceneHandler(event) {
        if (e.state !== 'scene') {
            return false
        }
        var currentScene = e.Data.get('scene')
        e.Data.set('scene', currentScene + 'a')

        e.Gui.rContent.innerText = "We're in scene " + currentScene + ", but there's no content for it yet"
    }

    e.Events.addAllButtonHandler(sceneHandler)
}