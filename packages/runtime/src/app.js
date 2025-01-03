import { destroyDOM } from "./destroy-dom";
import { mountDOM } from "./mount-dom";
import { h } from "./h";

export function createApp(RootComponent, props = {}) {
  let parentEl = null
  let isMounted = false
  let vdom = null

  function reset() {
    parentEl = null
    isMounted = false
    vdom = null
  }

  return {
    mount(_parentEl) {
      // check if already mounted.
      if (isMounted) {
        throw new Error('This application is already mounted')
      }

      parentEl = _parentEl
      // create virtual dom for root component.
      vdom = h(RootComponent, props);
      // mount component in parent element.
      mountDOM(vdom, parentEl)

      isMounted = true
    },

    unmount() {
      // check if mounted
      if (!isMounted) {
        throw new Error('The application is not mounted')
      }
      destroyDOM(vdom)
      reset()
    }
  }
}