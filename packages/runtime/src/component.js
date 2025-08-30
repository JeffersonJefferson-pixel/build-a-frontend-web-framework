import { destroyDOM } from "./destroy-dom";
import { DOM_TYPES, extractChildren, didCreateSlot, resetDidCreateSlot } from "./h";
import { mountDOM } from "./mount-dom";
import { patchDOM } from "./patch-dom";
import { hasOwnProperty } from "./utils/objects";
import { fillSlots } from './slots'
import equal from 'fast-deep-equal';
import { Dispatcher } from './dispatcher';

const emptyFn = () => {}

export function defineComponent({ 
  render, 
  state,
  onMounted = emptyFn,
  onUnmounted = emptyFn, 
  ...methods 
}) {
  class Component {
    #isMounted = false;
    #vdom = null;
    #hostEl = null;
    #eventHandlers = null;
    #parentComponent = null;
    #dispatcher = new Dispatcher();
    // array of unsubscribe functions.
    #subscriptions = [];
    #children = [];
    #appContext = null;

    constructor(
      props = {}, 
      eventHandlers = {},
      parentComponent = null
    ) {
      this.props = props;
      this.state = state ? state(props) : {};
      this.#eventHandlers = eventHandlers;
      this.#parentComponent = parentComponent
    }

    get parentComponent() {
      return this.#parentComponent
    }

    get elements() {
      if (this.#vdom == null) {
        return [];
      }

      // return elements inside the fragment
      if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
        return extractChildren(this.#vdom).flatMap((child) => {
          if (child.type === DOM_TYPES.COMPONENT) {
            // get elements recursively.
            return child.component.elements;
          }

          return [child.el];
        });
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

    onMounted() {
      // bind function to component instance.
      return Promise.resolve(onMounted.call(this));
    }

    onUnmounted() {
      return Promise.resolve(onUnmounted.call(this));
    }

    setAppContext(appContext) {
      this.#appContext = appContext;
    }

    get appContext() {
      return this.#appContext;
    }

    updateState(state) {
      // merge new state with current state
      this.state = { ...this.state, ...state };
      // patch based on new state
      this.#patch();
    }

    setExternalContent(children) {
      this.#children = children;
    }

    updateProps(props) {
      // merge props.
      const newProps = { ...this.props, ...props };
      // compare old and new props.
      if (equal(this.props, newProps)) {
        return
      }
      this.props = newProps;
      // re-render.
      this.#patch();
    }

    render() {
      // hSlotCalled depends on whether component render method calls hSlot() function.
      const vdom = render.call(this);

      // only fill slots when needed.
      if (didCreateSlot()) {
        // replace virtual slot node with external content.
        fillSlots(vdom, this.#children);
        resetDidCreateSlot();
      }

      return vdom;
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
      // wire event handlers when component is mounted.
      this.#wireEventHandlers();
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
      this.#subscriptions.forEach((unsubcribe) => unsubcribe())

      this.#vdom = null;
      this.#hostEl = null;
      this.#isMounted = false;
      this.#subscriptions = []
    }

    emit(eventName, payload) {
      this.#dispatcher.dispatch(eventName, payload);
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

    #wireEventHandlers() {
      // iterate over event handler object
      this.#subscriptions = Object.entries(this.#eventHandlers).map(
        ([eventName, handler]) => 
          this.#wireEventHandler(eventName, handler)
      )
    }

    // subscribe event handler to component's dispatcher.
    #wireEventHandler(eventName, hanlder) {
      return this.#dispatcher.subscribe(eventName, (payload) => {
        if (this.#parentComponent) {
          // bind the element handler context to parent component.
          hanlder.call(this.#parentComponent, payload);
        } else {
          hanlder(payload);
        }
      });
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
