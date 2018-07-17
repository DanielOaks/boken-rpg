export function setupHoverInfo() {
    // add hover-info handler
    var hoverButtons = document.querySelectorAll('.canhover')
    var hoverHint = document.querySelector('#hover-hint')
    hoverHint.classList.add('hidden')
    var hoverHintTitle = document.querySelector('#hover-hint .title')
    var hoverHintDescription = document.querySelector('#hover-hint .description')
    for (var i = 0, len = hoverButtons.length; i < len; i++) {
        hoverButtons[i].addEventListener('mouseenter', (event) => {
            // console.log('hovering over button', event.currentTarget, event.currentTarget.dataset.title)
            var title = event.currentTarget.dataset.title
            var description = event.currentTarget.dataset.description
            if ((title === undefined) || (description === undefined)) {
                return
            }
            hoverHintTitle.innerText = title
            hoverHintDescription.innerText = description
            hoverHint.classList.remove('hidden')
        })
        hoverButtons[i].addEventListener('mouseleave', (event) => {
            // console.log('  no longer hovering over button', event.currentTarget)
            hoverHint.classList.add('hidden')
        })
    }
}
