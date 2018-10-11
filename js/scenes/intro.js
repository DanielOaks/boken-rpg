import * as data from '../modules/data.js'

var md = window.markdownit()

function doIntro(e) {
    e.Gui.wipeContent()
    e.Gui.wipeControlButtons()

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
}

// intro isn't so much a scene in and of itself, but it's what sets up the initial flow to the game
export function setup(e) {
    // new game handler
    // we have two separate handlers here for quicker abort based on engine state
    e.Events.addHandler('btn 1', (event) => {
        if (e.state !== 'start') {
            return false
        }

        e.Data = new data.Datastore()
        e.state = 'intro'

        doIntro(e)

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
        } else if ([1, 4].includes(currentIntroPage) && !['btn 1', 'btn 2'].includes(event)) {
            return false
        } else if ([2, 3, 5].includes(currentIntroPage) && !['btn 1'].includes(event)) {
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
                e.Gui.rContent.innerHTML = md.render(`
You're a close friend of one Princess Belea Canson. The ruler-to-be of this fine settlement lives in a castle, but not one that's too large or gaudy. Really, 
"castle" seems like a bit of a stretch... at least compared to those that exist in other parts.

The Canson family – or at least the offshoot of it that lives here – is an outcast of the royal family from the northern settlement, Alta. From what she's told you, her family is the rightful heirs to the throne of Alta and the outlying towns and villiages, ousted and banished. Fitting for them to end up in a town of misfits like Troto.

Yourself and Belea have known each other since you were young, and have spent many years in the same schools and neighbourhood. And with the two of you finally getting to that age, it's time for each of you to find your paths before she can take over the throne.

You find yourself standing just outside the door to Belea's room, having asked you to come see her.`)
                e.Gui.addButton('1', 'Continue')
            } else if (event == 'btn 2') {
                doIntro(e)
            }
        } else if (currentIntroPage == 2) {
            e.Gui.rContent.innerHTML = md.render(`
You give the door a few knocks. A startled noise comes from the other side, with the door opening shortly after. Poking her head out, you see the princess looking to you with a small, troubled smile on her face.

"Ah, ` + e.pName() + `, thank you for coming," she says, opening the door and inviting you inside.

The two of you sit on her bed, feeling the fairly-plush blankets underneath you.

"As, um… well, as you know, I need to prove myself before I'm able to take the throne. That involves me ruling alongside my mother for a time, as well as… showing that I haven't misplaced my trust, in terms of my assistants."

Those two green eyes look to you, the princess seemingly studying your own closely for a few moments.

"Just like we talked about, I chose you as one of my assistants – my closest, really… The same as I'm being tested and having to prove myself, you need to do the same," she says, stepping up from her bed and glancing to the window.`)
            e.Gui.addButton('1', 'Continue')
        } else if (currentIntroPage == 3) {
            e.Gui.rContent.innerHTML = md.render(`
"I already have those helping me around the castle, those who will assist with my schedule and arrange diplomatic visits."

"What I lack – what **we** lack – is someone who's willing to go out there into the world and spread our message. Or at least work to prevent this war that seems almost inevitable. If the world is plunged into chaos, there's no doubt that we will be as well," she says, turning to look towards you.

"You know what the last War of Ages did to us, to people all throughout the world. We can't let that happen again – for the sake of our own people and all those others out there… The other leaders out there don't get it, so focused on their power struggle. Even we are dismissed as 'fools' who've spent much too long around other misfits."

"I know it's a big request, however… it's what we must do. Do our best to prevent another large-scale conflict, myself and my family from here, and you from out there."

"You can trust that I'll do my best from where I am. Can I count on you?" she asks, extending a hand and a smile.`)
            e.Gui.addButton('1', 'Yes', 'Yes', `You're with the princess`)
            e.Gui.addButton('2', 'No', 'No', `The princess is on her own`)
        } else if (currentIntroPage == 4) {
            if (event == 'btn 1') {
                e.Data.set('princess.offerAccepted', true)
                e.Gui.rContent.innerHTML = md.render(`
That smile on her face gets wider as she shakes your hand.

"We're a team, always. Now, let's go through some details…" she says, hopping back on the bed with you.

She covers the three other kingdoms: **Alta**, the largest, to the north; **Catal** to the East; and **Netto** to the West.

"Ours is the smallest of the four, of course. Being made up of primarily scavengers and outcasts will do that to you," she says, chuckling once more.

"Alta, the one we don't get along with at all for… obvious reasons. They hold the most power and sway, so convincing them is going to do a lot."

etc etc. Catal's on the coast, and Netto's fairly close to theirs.

She wishes you good luck and sends you on your way and out of the catle, etc etc long scene to be written more.`)
            } else {
                e.Data.set('princess.offerAccepted', false)
                e.Gui.rContent.innerHTML = md.render(`
That smile on her face crumbles as you refuse, that hand dropping back to her side.

"Oh. Well… alrighty then, guess I'm alone on this," she says, letting out a little chuckle as she turns back to the window.

"In that case, good luck out there. I guess I'll see you again at some point."

"Goodbye, ` + e.pName() + `."

You shortly take your leave, stepping out of her room, and vacating the castle in a hurry before any of them figure out how you've responded to your friend's offer.`)
            }
            e.Gui.addButton('1', 'Continue')
        } else if (currentIntroPage == 5) {
            e.enterNewRegion('troto', 'castleInnerEntrance')
            e.Events.dispatch('mapStart')
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
    content.innerHTML = ` <h1 class="game-title">Boken Engine</h1>
        <p>Welcome to the Boken Engine example game. Hope this is interesting!</p>`

    e.Gui.addButton('1', 'New Game', 'Start a new game', 'Start playing!')
    e.Gui.addButton('2', 'Load', 'Load an existing game', 'Start playing!')
}