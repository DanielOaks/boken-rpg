// Queue turns a series of async incoming events into a sync stream of handler calls.
// only works if all handlers are sync (don't return promises or w/e).
// this is what allows the rest of the code to basically assume and run synchronously
export function Queue() {
    var e = {
        workingOnHandlers: false, // manually-controlled mutex
        pendingHandlers: [],
        handlers: {},

        workingOnEvents: false, //manually-controlled mutex
        pendingEvents: [],

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
        },

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
        },
    }

    return e
}
