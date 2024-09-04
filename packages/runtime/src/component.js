import { destroyDOM } from "./destroy-dom";
import { DOM_TYPES, extractChildren } from "./h";
import { mountDOM } from "./mount-dom";
import { patchDOM } from "./patch-dom";
import { hasOwnProperty } from "./utils/objects";

export function defineComponent({ render, state, ...methods }) {
  class Component {
    #isMounted = false;
    #vdom = null;
    #hostEl = null;

    constructor(props = {}) {
      this.props = props;
      this.state = state ? state(props) : {};
    }

    get elements() {
      if (this.#vdom == null) {
        return [];
      }

      // return elements inside the fragment
      if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
        return extractChildren(this.#vdom).map((child) => child.el);
      }

      return [this.#vdom.el];
    }

    get firstElement() {
      return this.elements[0];
    }

    get offset() {
      if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
        return Array.from(this.#hostEl.children).indexOf(this.firstElement);
      }

      return 0;
    }

    updateState(state) {
      // merge new state with current state
      this.state = { ...this.state, ...state };
      // patch based on new state
      this.#patch();
    }

    render() {
      return render.call(this);
    }

    mount(hostEl, index = null) {
      // check if component already mounted
      if (this.#isMounted) {
        throw new Error("Component is alreay mounted");
      }

      // call render method and save result in vdom property
      this.#vdom = this.render();
      // call mountDOM function to mount component view
      mountDOM(this.#vdom, hostEl, index, this);
      this.#hostEl = hostEl;
      this.#isMounted = true;
    }

    unmount() {
      // check if component is not yet mounted
      if (!this.#isMounted) {
        throw new Error("Component is not mounted");
      }

      // call destroyDOM function to unmount component's view
      destroyDOM(this.#vdom);

      this.#vdom = null;
      this.#hostEl = null;
      this.#isMounted = false;
    }

    #patch() {
      // check if not yet mounted
      if (!this.#isMounted) {
        throw new Error("Component is not mounted");
      }

      // get new virtual DOM
      const vdom = this.render();
      // patch DOM
      this.#vdom = patchDOM(this.#vdom, vdom, this.#hostEl, this);
    }
  }

  for (const methodName in methods) {
    // ensure component doesn't already have method with the same name.
    if (hasOwnProperty(Component, methodName)) {
      throw new Error(
        `Method "${methodName}" already exists in the component.`
      );
    }
    // adds the method to component's prototype.
    Component.prototype[methodName] = methods[methodName];
  }

  return Component;
}
