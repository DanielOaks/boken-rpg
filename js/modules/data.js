export class Store {
    constructor() {
        this._data = {}
    }

    set(key, value) {
        this._data[key] = value
    }

    get(key, defaultValue) {
        var value = this._data[key]
        if (value === undefined) {
            return defaultValue
        }
        return value
    }

    has(key) {
        var value = this._data[key]
        return value === null
    }

    delete(key) {
        this._data.delete(key)
    }
}
