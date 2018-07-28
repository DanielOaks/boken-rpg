import * as data from '../modules/data.js'

// intro isn't so much a scene in and of itself, but it's what sets up the initial flow to the game
export function setup(e) {
    // new game handler
    // we have two separate handlers here for quicker abort based on engine state
    e.Events.addHandler('btn 1', (event) => {
        if (e.state !== 'start') {
            return false
        }

        e.Data = data.Store()
        e.state = 'intro'

        e.Gui.wipeContent()
        e.Gui.wipeControlButtons()

        e.Gui.rContent.innerHTML = `
            <p>Troto, a small settlement to the south. A villiage of misfits and outcasts, and your home since you were little.</p>
            <p>How did you end up here? You barely remember anymore, probably for not being quite noble enough, not acting the right way, or just for taking some food to survive. Whatever it was, the people here took you in and helped raise you, even giving you a good education.</p>
            <p>Your name is <input class="name" type="text" placeholder="">, and you're a...</p>`

        e.Data.set('intro-page', 0)

        e.Gui.addButton('1', 'Human', 'Human', 'Pointy sticks and weird faces')
        e.Gui.addButton('2', 'Unicorn', 'Unicorn', 'Magical druids')
        e.Gui.addButton('3', 'Half-Wyvern', 'Half-Wyvern', 'Almost a dragon, but not quite')
        e.Gui.addButton('4', 'Griffon', 'Griffon', 'Flappy Beak')

        return true
    })

    function introHandler(event) {
        if (e.state !== 'intro') {
            return false
        }

        // get page number
        var currentIntroPage = e.Data.get('intro.page', 0)

        // exit if corrent button isn't pressed for this page
        if ((currentIntroPage == 0) && !['btn 1', 'btn 2', 'btn 3', 'btn 4'].includes(event)) {
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
        }

        // set new page number
        e.Data.set('intro.page', currentIntroPage + 1)

        // wipe content and buttons, to set new ones
        e.Gui.wipeContent()
        e.Gui.wipeControlButtons()

        // set content for this page
        if (currentIntroPage == 0) {
            e.Gui.rContent.innerHTML = `
                <p>Nice to meet you, ` + e.Data.get('player.name') + `. Oh wow, you're a ` + race + `!</p>`
        } else {
            e.Gui.rContent.innerText = 'Here goes intro page ' + currentIntroPage + ' content, but we have none yet!'
        }

        return true
    }

    e.Events.addHandler('btn 1', introHandler)
    e.Events.addHandler('btn 2', introHandler)
    e.Events.addHandler('btn 3', introHandler)
    e.Events.addHandler('btn 4', introHandler)
}

export function start(e) {
    // clear any leftover content
    e.Gui.blankScreen()

    // set initial content
    var content = document.querySelector('#main .center-pane .content')
    content.innerHTML = `
<h1 class="game-title">WRPG</h1>

<p>Welcome to WRPG! This RPG is a cool thing which you can play.</p>`

    e.Gui.addButton('1', 'New Game', 'Start a new game', 'Start playing!')
    e.Gui.addButton('2', 'Load', 'Load an existing game', 'Start playing!')
}
