// content page handler setup
export function setup(e) {
    var md = window.markdownit()

    function contentButtonHandler(event) {
        // don't allow peeps to go back and forth during menus and etc
        if (!['map', 'scene'].includes(e.state)) {
            return false
        }
        if (event === 'btn content-prev') {
            e.contentPages.showPreviousPage()
        } else if (event === 'btn content-next') {
            e.contentPages.showNextPage()
        }
    }

    e.Events.addHandler('btn content-prev', contentButtonHandler)
    e.Events.addHandler('btn content-next', contentButtonHandler)
}

export class ContentPageStore {
    constructor(engine) {
        this.e = engine
        this._currentPageIndex = 0 // this starts at 0 for the current page, 1 for the previous page, etc
        this._contentHistory = []
        this._tpcElement = document.createElement('div')
    }

    _showContentHTML(content) {
        this.e.Gui.rContent.innerHTML = content
    }

    updatePageButtons() {
        if (!['map', 'scene'].includes(this.e.state)) {
            this.e.Gui.rContentPrev.classList.remove('active')
            this.e.Gui.rContentNext.classList.remove('active')
            return
        }
        if (this._currentPageIndex < this._contentHistory.length - 1) {
            this.e.Gui.rContentPrev.classList.add('active')
        } else {
            this.e.Gui.rContentPrev.classList.remove('active')
        }
        if (0 < this._currentPageIndex) {
            this.e.Gui.rContentNext.classList.add('active')
        } else {
            this.e.Gui.rContentNext.classList.remove('active')
        }
    }

    showPreviousPage() {
        console.log('prev:', this._contentHistory, this._currentPageIndex, this._contentHistory.length - 1)
        if (this._currentPageIndex < this._contentHistory.length - 1) {
            this._currentPageIndex += 1
            this._showContentHTML(this._contentHistory[this._currentPageIndex])
            this.updatePageButtons()
        }
    }

    showNextPage() {
        console.log('next:', this._currentPageIndex, this._contentHistory.length)
        if (0 < this._currentPageIndex) {
            this._currentPageIndex -= 1
            this._showContentHTML(this._contentHistory[this._currentPageIndex])
            this.updatePageButtons()
        }
    }

    showLatestPage() {
        this._currentPageIndex = 1
        this.showNextPage()
    }

    addNewPageText(content) {
        this._tpcElement.innerText = content
        this.addNewPage(this._tpcElement.innerHTML)
    }

    addNewPage(content) {
        // insert new page
        this._contentHistory.unshift(content)

        // cap the content history at 20 elements
        this._contentHistory = this._contentHistory.slice(0, 20)

        // show the latest page, because why not
        this.showLatestPage()
    }

    replaceLatestPageText(content) {
        this._tpcElement.innerText = content
        this.replaceLatestPage(this._tpcElement.innerHTML)
    }

    replaceLatestPage(content) {
        // remove latest page and insert this one in its place
        this._contentHistory.shift()
        this._contentHistory.unshift(content)

        // show the latest page
        this.showLatestPage()
    }
}