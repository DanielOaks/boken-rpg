function GuiManager() {
    var g = {
        init() {
            this.rPlaceName = document.querySelector('#main .left-pane .main-info .place .description')
            this.rRegionName = document.querySelector('#main .left-pane .main-info .region-name')
            this.rControlButtons = document.querySelectorAll('#main .center-pane > .buttons .kbutton')
            this.content = document.querySelector('#main .center-pane .content')
            this.day = document.querySelector('#main .left-pane .timeholder .day .value')
            this.time = document.querySelector('#main .left-pane .timeholder .time .value')
        },

        blankScreen() {
            this.rPlaceName.innerText = ''
            this.rRegionName.innerHTML = '&nbsp;'
            this.content.innerHTML = '&nbsp;'
            this.day.innerText = '0'
            this.time.innerText = '00:00'
            for (var i = 0, len = this.rControlButtons.length; i < len; i++) {
                this.rControlButtons[i].classList.remove('active')
                this.rControlButtons[i].children[0].innerHTML = '&nbsp;'
            }
        },
    }

    return g
}

function Engine() {
    var e = {
        Gui: GuiManager(),

        init() {
            this.Gui.init()
        }
    }
    return e
}

var engine = Engine()

// initialize when page is loaded
Zepto(function ($) {
    engine.init()
    engine.Gui.blankScreen()
})
