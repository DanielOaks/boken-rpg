/**
 * Data module.
 * @module core/data
 */

/** Datastore holds key-value data, allowing it to be serialised. */
export class Datastore {
    constructor() {
        this._data = {}
    }

    /**
     * Sets `key` to the given value.
     * @param {string} key - Key to set.
     * @param {any} value - Value to store.
     */
    set(key, value) {
        this._data[key] = value
    }

    /**
     * Gets a stored key, or returns the default value.
     * @param {string} key - Key to get.
     * @param {any} defaultValue - Value to return if `key` doesn't exist.
     */
    get(key, defaultValue) {
        var value = this._data[key]
        if (value === undefined) {
            return defaultValue
        }
        return value
    }

    /**
     * Returns true if the given key exists.
     * @param {string} key - Key to check.
     */
    has(key) {
        var value = this._data[key]
        return value === null
    }

    /**
     * Deletes the given key if it exists.
     * @param {string} key - Key to delete.
     */
    delete(key) {
        this._data.delete(key)
    }
}
