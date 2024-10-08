import { DOM_TYPES } from "./h";
import { setAttributes } from "./attributes";
import { addEventListeners } from "./events";

export function mountDOM(vdom, parentEl, index, hostComponent = null) {
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
  const { tag, props, children } = vdom;

  const element = document.createElement(tag);
  addProps(element, props, vdom, hostComponent);
  vdom.el = element;

  children.forEach((child) => mountDOM(child, element, hostComponent));
  insert(element, parentEl, index)
}

function createComponentNode(vdom, parentEl, index, hostComponent) {
  // extract component from virtual node.
  const Component = vdom.tag;
  const props = vdom.props;
  // instantiate component.
  const component = new Component(props);

  // mount component.
  component.mount(parentEl, index);
  vdom.component = component;
  vdom.el = component.firstElement;
}

function addProps(el, props, vdom, hostComponent) {
  const { on: events, ...attrs } = props;

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