export var scenes = {
    'intro': {
        'exitRegion': 'troto',
        'exitPlace': 'castleInnerEntrance',
        'exitDuration': {
            'hours': 8,
        },
        'noTimePasses': true,
        'pages': [
            `You're a close friend of one Princess Belea Canson. The ruler-to-be of this fine settlement lives in a castle, but not one that's too large or gaudy. Really, "castle" seems like a bit of a stretch... at least compared to those that exist in other parts.
            
            The Canson family – or at least the offshoot of it that lives here – is an outcast of the royal family from the northern settlement, Alta. From what she's told you, her family is the rightful heirs to the throne of Alta and the outlying towns and villiages, ousted and banished. Fitting for them to end up in a town of misfits like Troto.
            
            Yourself and Belea have known each other since you were young, and have spent many years in the same schools and neighbourhood. And with the two of you finally getting to that age, it's time for each of you to find your paths before she can take over the throne.
            
            You find yourself standing just outside the door to Belea's room, having asked you to come see her.`,

            `You give the door a few knocks. A startled noise comes from the other side, with the door opening shortly after. Poking her head out, you see the princess looking to you with a small, troubled smile on her face.
            
            "Ah, {{ pc.name }}, thank you for coming," she says, opening the door and inviting you inside.
            
            The two of you sit on her bed, feeling the fairly-plush blankets underneath you.
            
            "As, um… well, as you know, I need to prove myself before I'm able to take the throne. That involves me ruling alongside my mother for a time, as well as… showing that I haven't misplaced my trust, in terms of my assistants."
            
            Those two green eyes look to you, the princess seemingly studying your own closely for a few moments.
            
            "Just like we talked about, I chose you as one of my assistants – my closest, really… The same as I'm being tested and having to prove myself, you need to do the same," she says, stepping up from her bed and glancing to the window.`,

            function (e, scene, pageNumber, sceneButtonPressed) {
                e.parser.addNewPage(`"I already have those helping me around the castle, those who will assist with my schedule and arrange diplomatic visits."

                "What I lack – what **we** lack – is someone who's willing to go out there into the world and spread our message. Or at least work to prevent this war that seems almost inevitable. If the world is plunged into chaos, there's no doubt that we will be as well," she says, turning to look towards you.

                "You know what the last War of Ages did to us, to people all throughout the world. We can't let that happen again – for the sake of our own people and all those others out there… The other leaders out there don't get it, so focused on their power struggle. Even we are dismissed as 'fools' who've spent much too long around other misfits."

                "I know it's a big request, however… it's what we must do. Do our best to prevent another large-scale conflict, myself and my family from here, and you from out there."

                "You can trust that I'll do my best from where I am. Can I count on you?" she asks, extending a hand and a smile.`)

                e.addSceneButton('yes', 'Yes', 'Yes', `You're with the princess`)
                e.addSceneButton('no', 'No', 'No', `The princess is on her own`)
            },

            function (e, scene, pageNumber, sceneButtonPressed) {
                e.Data.set('princess.offerAccepted', sceneButtonPressed == 'yes')

                if (sceneButtonPressed == 'yes') {
                    e.parser.addNewPage(`That smile on her face gets wider as she shakes your hand.

                    "We're a team, always. Now, let's go through some details…" she says, hopping back on the bed with you.

                    She covers the three other kingdoms: **Alta**, the largest, to the north; **Catal** to the East; and **Netto** to the West.

                    "Ours is the smallest of the four, of course. Being made up of primarily scavengers and outcasts will do that to you," she says, chuckling once more.

                    "Alta, the one we don't get along with at all for… obvious reasons. They hold the most power and sway, so convincing them is going to do a lot."

                    etc etc. Catal's on the coast, and Netto's fairly close to theirs.

                    She wishes you good luck and sends you on your way and out of the catle, etc etc long scene to be written more.`)
                } else {
                    e.parser.addNewPage(`That smile on her face crumbles as you refuse, that hand dropping back to her side.

                    "Oh. Well… alrighty then, guess I'm alone on this," she says, letting out a little chuckle as she turns back to the window.
                    
                    "In that case, good luck out there. I guess I'll see you again at some point."
                    
                    "Goodbye, {{ pc.name }}."
                    
                    You shortly take your leave, stepping out of her room, and vacating the castle in a hurry before any of them figure out how you've responded to your friend's offer.`)
                }
            },
        ],
    },
}