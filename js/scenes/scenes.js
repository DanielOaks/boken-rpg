import * as intro from './store/intro.js'
import * as troto from './store/troto.js'

export var scenes = {}

var scenesToLoadIn = [
    intro.scenes,
    troto.scenes,
]

for (const sceneList of scenesToLoadIn) {
    for (const [k, v] of Object.entries(sceneList)) {
        if (scenes[k] !== undefined) {
            console.log('ERROR: duplicate scene name:', k)
        }
        scenes[k] = v
    }
}