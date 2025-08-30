import { destroyDOM } from "./destroy-dom";
import { mountDOM } from "./mount-dom";
import { h } from "./h";
import { NoopRouter } from "./router";

export function createApp(RootComponent, props = {}, options = {}) {
  let parentEl = null
  let isMounted = false
  let vdom = null

  const context = {
    router: options.router || new NoopRouter(),
  }

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
      mountDOM(vdom, parentEl, null, { appContext: context });

      context.router.init();

      isMounted = true
    },

    unmount() {
      // check if mounted
      if (!isMounted) {
        throw new Error('The application is not mounted')
      }
      destroyDOM(vdom);
      context.router.destroy();
      reset()
    }
  }
}