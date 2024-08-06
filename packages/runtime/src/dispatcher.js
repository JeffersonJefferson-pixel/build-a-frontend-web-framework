export class Dispatcher {
  #subs = new Map()
  #afterHandlers = []

  subscribe(commandName, handler) {
    // creates array of subscriptions if it doesn't exist for a given command name
    if (!this.#subs.has(commandName)) {
      this.#subs.set(commandName, [])
    }

    const handlers = this.#subs.get(commandName)
    // check whether the handler is registered
    if (handlers.includes(handler)) {
      return () => {}
    }

    // registers the handler
    handlers.push(handler)

    // returns a function to unregister the handler
    return () => {
      const idx = handlers.indexOf(handler)
      handlers.splice(idx, 1)
    }
  }

  afterEveryCommand(handler) {
    // register handler
    this.#afterHandlers.push(handler)

    // returns a function to unregister the handler
    return () => {
      const idx = this.#afterHandlers.indexOf(handler)
      this.#afterHandlers.splice(idx, 1)
    }
  }

  dispatch(commandName, payload) {
    // check whether handlers are registered and call them
    if (this.#subs.has(commandName)) {
      this.#subs.get(commandName).forEach((handler) => handler(payload))
    } else {
      console.warn(`No handlers for command: ${commandName}`);
    }

    // run the after-command handlers
    this.#afterHandlers.forEach((handler) => handler())
  }
}