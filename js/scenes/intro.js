import * as buttons from '../modules/buttons.js'
import * as data from '../modules/data.js'

var md = window.markdownit()

function doIntro(e) {
    e.Gui.wipeContent()
    e.Gui.wipeControlButtons()

    e.Data = new data.Datastore()
    e.state = 'intro'

    e.Gui.rContent.innerHTML = md.render(`
Troto, a settlement to the south. Known for its large number of misfits and outcasts, and your home since you were little.

How did you end up here? You barely remember anymore, probably for not being quite noble enough, not acting the right way, or just for taking some food to survive.

Whatever it was, you belonged here. The people of this settlement took you in and helped raise you, even giving you the opportunity for a good education.`) + `
<p>Your name is <input class="name" type="text" placeholder="">, and you're a...</p>`

    e.Data.set('intro.page', 0)

    e.Gui.addButton('1', 'Human', 'Human', 'Pointy sticks and weird faces')
    e.Gui.addButton('2', 'Unicorn', 'Unicorn', 'Magical druids')
    e.Gui.addButton('3', 'Half-Wyvern', 'Half-Wyvern', 'Almost a dragon, but not quite')
    e.Gui.addButton('4', 'Griffon', 'Griffon', 'Flappy Beak')

    buttons.updateButtonHoverInfo()
}

// intro isn't so much a scene in and of itself, but it's what sets up the initial flow to the game
export function setup(e) {
    // new game handler
    // we have two separate handlers here for quicker abort based on engine state
    e.Events.addHandler('btn 1', (event) => {
        if (e.state !== 'start') {
            return false
        }

        doIntro(e)

        return true
    })

    function charCreationHandler(event) {
        if (e.state !== 'intro') {
            return false
        }

        // get page number
        var currentIntroPage = e.Data.get('intro.page', 0)

        // exit if corrent button isn't pressed for this page
        if ((currentIntroPage == 0) && !['btn 1', 'btn 2', 'btn 3', 'btn 4'].includes(event)) {
            return false
        } else if ([1].includes(currentIntroPage) && !['btn 1', 'btn 2'].includes(event)) {
            return false
        }

        // info-grabbing before we wipe everything
        // can return false here to force more info to be entered
        var race = ''
        if (currentIntroPage == 0) {
            var name = e.Gui.rContent.querySelector('.name').value.trim()

            if (name.length == 0) {
                return false
            }

            e.Data.set('player.name', name)
            e.Gui.rPlayerName.innerText = name

            switch (event) {
            case 'btn 1':
                race = 'Human'
                break
            case 'btn 2':
                race = 'Unicorn'
                break
            case 'btn 3':
                race = 'Half-Wyvern'
                break
            case 'btn 4':
                race = 'Griffon'
                break
            }

            e.Data.set('player.race', race.toLowerCase())
        }

        // set new page number
        e.Data.set('intro.page', currentIntroPage + 1)

        // wipe content and buttons, to set new ones
        e.Gui.wipeContent()
        e.Gui.wipeControlButtons()

        // set content for this page
        if (currentIntroPage == 0) {
            e.Gui.rContent.innerHTML = md.render(`## ` + e.Data.get('player.name') + `\n\nRace: **` + race + `**\n\nIs this correct?`)
            e.Gui.addButton('1', 'Continue', 'Continue', 'Get started on your adventure')
            e.Gui.addButton('2', 'Go Back', 'Go Back', 'Create a new character')
        } else if (currentIntroPage == 1) {
            if (event == 'btn 1') {
                e.Data.set('scene.name', 'intro')
                e.Events.dispatch('sceneStart')
            } else {
                doIntro(e)
            }
        } else {
            e.contentPages.addNewPage('Here goes intro page ' + currentIntroPage + ' content, but we have none yet!')
        }

        buttons.updateButtonHoverInfo()

        return true
    }

    e.Events.addHandler('btn 1', charCreationHandler)
    e.Events.addHandler('btn 2', charCreationHandler)
    e.Events.addHandler('btn 3', charCreationHandler)
    e.Events.addHandler('btn 4', charCreationHandler)
}

export function start(e) {
    // clear any leftover content
    e.Gui.blankScreen()

    // set initial content
    var content = document.querySelector('#main .center-pane .content')
    content.innerHTML = ` <h1 class="game-title">Boken Engine</h1>
        <p>Welcome to the Boken Engine example game. Hope this is interesting!</p>`

    e.Gui.addButton('1', 'New Game', 'Start a new game', 'Start playing!')
    e.Gui.addButton('2', 'Load', 'Load an existing game', 'Start playing!')

    buttons.updateButtonHoverInfo()
}