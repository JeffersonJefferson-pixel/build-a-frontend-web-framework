import { describe, expect, it, vi } from "vitest";
import { Dispatcher } from "../dispatcher";

const commandName = 'test-event'
const payload = { test: 'payload' }

describe("A command dispatcher", () => {
  it("can register and unregister handlers to specific commands", () => {
    const dispatcher = new Dispatcher()
    const handler = vi.fn()

    const unsubscribe = dispatcher.subscribe(commandName, handler)
    dispatcher.dispatch(commandName, payload)

    expect(handler).toBeCalledWith(payload)

    unsubscribe()
    dispatcher.dispatch(commandName, payload)

    expect(handler).toHaveBeenCalledOnce()
  });
});
