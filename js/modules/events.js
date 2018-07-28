/**
 * Events module.
 * @module core/events
 */

/**
 * EventQueue turns a series of async incoming events into a sync stream of handler calls.
 * Only works if all handlers are synchronous (don't return promises of w/e).
 * This allows the rest of the code to assume and run synchronously.
 */
export class EventQueue {
    constructor() {
        this.workingOnHandlers = false // manually-controlled mutex
        this.pendingHandlers = []
        this.handlers = {}

        this.workingOnEvents = false //manually-controlled mutex
        this.pendingEvents = []
    }

    /**
     * Adds a handler that gets called when the named event is dispatched.
     * @param {string} name - Name of the event this handler responds to.
     * @param {function} handler - Handler that takes the event data.
     */
    addHandler(name, handler) {
        this.pendingHandlers.push({
            'name': name,
            'handler': handler
        })

        if (!this.workingOnHandlers) {
            this.workingOnHandlers = true

            while (true) {
                var newHandler = this.pendingHandlers.shift()

                if (newHandler === undefined) {
                    break
                }

                var currentHandlers = this.handlers[name]

                if (currentHandlers === undefined) {
                    currentHandlers = []
                }

                currentHandlers.push(handler)

                this.handlers[name] = currentHandlers
            }

            this.workingOnHandlers = false
        }
    }

    /**
     * Dispatches a given event, calling all the attached handlers for it.
     * @param {string} name - Event to dispatch.
     */
    dispatch(name) {
        console.log('dispatching event "' + name + '" -', this.handlers[name] === undefined ? 0 : this.handlers[name].length, 'handler(s)')
        this.pendingEvents.push(name)

        if (!this.workingOnEvents) {
            this.workingOnEvents = true

            while (true) {
                var newEvent = this.pendingEvents.shift()
                if (newEvent === undefined) {
                    break
                }

                var handlers = this.handlers[newEvent]
                if (handlers === undefined) {
                    continue
                }

                for (var i = 0, len = handlers.length; i < len; i++) {
                    // console.log('calling handler', handlers[i], 'with event', newEvent)
                    var returnVal = handlers[i](newEvent)

                    if (returnVal === true) {
                        break
                    }
                }
            }

            this.workingOnEvents = false
        }
    }
}
