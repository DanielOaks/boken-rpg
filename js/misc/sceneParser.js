export class SceneParser {
    constructor(engine) {
        this.e = engine
        this._md = window.markdownit()
        this._tpcElement = document.createElement('div')
    }

    parse(content) {
        //TODO(dan): wrote a better replacement engine. maybe look to goshu for inspiration?
        content = content.replace('{{ pc.name }}', this.e.Data.get('player.name'))

        const lines = content.split('\n')
        var newContent = ''
        for (const line of lines) {
            newContent += line.trim()
            newContent += '\n'
        }
        newContent = newContent.trim()

        return this._md.render(newContent)
    }

    addNewPage(content) {
        this.e.contentPages.addNewPage(this.parse(content))
    }

    replaceLatestPage(content) {
        this.e.contentPages.replaceLatestPage(this.parse(content))
    }
}