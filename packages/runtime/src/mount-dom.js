import { extractPropsAndEvents } from "./utils/props";
import { DOM_TYPES } from "./h";
import { setAttributes } from "./attributes";
import { addEventListeners } from "./events";
import { enqueueJob } from "./scheduler";

export function mountDOM(vdom, parentEl, index, hostComponent = null) {
  console.log('mounting dom: ', vdom)
  switch (vdom.type) {
    case DOM_TYPES.TEXT: {
      createTextNode(vdom, parentEl, index);
      break;
    }

    case DOM_TYPES.ELEMENT: {
      createElementNode(vdom, parentEl, index, hostComponent);
      break;
    }

    case DOM_TYPES.FRAGMENT: {
      createFragmentNodes(vdom, parentEl, index, hostComponent);
      break;
    }

    case DOM_TYPES.COMPONENT: {
      createComponentNode(vdom, parentEl, index, hostComponent);
      // enqueue component onmounted hook in the scheduler. 
      enqueueJob(() => vdom.component.onMounted())
      break;
    }

    default: {
      throw new Error(`Can't mount DOM of type: ${vdom.type}`);
    }
  }
}

function createTextNode(vdom, parentEl, index) {
  const { value } = vdom;

  const textNode = document.createTextNode(value);
  vdom.el = textNode;

  insert(textNode, parentEl, index)
}

function createFragmentNodes(vdom, parentEl, index, hostComponent) {
  const { children } = vdom;
  vdom.el = parentEl;

  children.forEach((child, i) => mountDOM(child, parentEl, index ? index + i : null, hostComponent));
}

function createElementNode(vdom, parentEl, index, hostComponent) {
  const { tag, children } = vdom;

  const element = document.createElement(tag);
  addProps(element, vdom, hostComponent);
  vdom.el = element;

  children.forEach((child) => mountDOM(child, element, null, hostComponent));
  insert(element, parentEl, index)
}

function createComponentNode(vdom, parentEl, index, hostComponent) {
  // extract component from virtual node.
  const { tag: Component, children } = vdom;
  // extract props and events.
  const { props, events  } = extractPropsAndEvents(vdom);
  // instantiate component.
  const component = new Component(props, events, hostComponent);
  component.setChildren(children)

  // mount component.
  component.mount(parentEl, index);
  vdom.component = component;
  vdom.el = component.firstElement;
}

function addProps(el, vdom, hostComponent) {
  const { props: attrs, events } = extractPropsAndEvents(vdom);

  vdom.listeners = addEventListeners(events, el, hostComponent);
  setAttributes(el, attrs);
}

function insert(el, parentEl, index) {
  if (index == null) {
    // when no index is provided, appends the node
    parentEl.append(el)
  }

  if (index < 0) {
    // negatiev indices are considered an error
    throw new Error(`Index must be a positive integer, got ${index}`)
  }
  
  const children = parentEl.childNodes

  if (index >= children.length) {
    // if index is beyond the last child, node is appended
    parentEl.append(el)
  } else {
    // otherwise, node is inserted at the given index
    parentEl.insertBefore(el, children[index])
  }
}