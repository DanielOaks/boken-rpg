import * as troto from './store/troto.js'

export var scenes = {}

for (const [k, v] of Object.entries(troto.scenes)) {
    if (scenes[k] !== undefined) {
        console.log('ERROR: duplicate scene name:', k)
    }
    scenes[k] = v
}