import { destroyDOM } from "./destroy-dom";
import { DOM_TYPES, extractChildren } from "./h";
import { mountDOM } from "./mount-dom";
import { areNodesEqual } from "./nodes-equal";
import { objectsDiff } from "./utils/objects";
import { removeAttribute, setAttribute } from "./attributes";
import { arraysDiff, arraysDiffSequence, ARRAY_DIFF_OP } from "./utils/arrays";
import { isNotBlankOrEmptyString } from "./utils/strings";
import { removeStyle, setStyle } from "./attributes";
import { addEventListener } from "./events";

export function patchDOM(oldVdom, newVdom, parentEl, hostComponent = null) {
  if (!areNodesEqual(oldVdom, newVdom)) {
    // finds the index in the parent node where the old node is
    const index = findIndexInParent(parentEl, oldVdom.el);
    // destorys the old node and its subtree
    destroyDOM(oldVdom);
    // mounts the new node and its subtree
    mountDOM(newVdom, parentEl, index, hostComponent);

    return newVdom;
  }

  // save reference to the DOM element in the new node
  newVdom.el = oldVdom.el;

  switch (newVdom.type) {
    case DOM_TYPES.TEXT: {
      // patch text
      patchText(oldVdom, newVdom);
      return newVdom;
    }

    case DOM_TYPES.ELEMENT: {
      patchElement(oldVdom, newVdom, hostComponent);
      break;
    }

    case DOM_TYPES.COMPONENT: {
      patchComponent(oldVdom, newVdom);
      break;
    }
  }

  patchChildren(oldVdom, newVdom, hostComponent);

  return newVdom;
}

function findIndexInParent(parentEl, el) {
  const index = Array.from(parentEl.childNodes).indexOf(el);
  if (index < 0) {
    return null;
  }

  return index;
}

function patchText(oldVdom, newVdom) {
  const el = oldVdom.el;
  const { value: oldText } = oldVdom;
  const { value: newText } = newVdom;

  if (oldText !== newText) {
    el.nodeValue = newText;
  }
}

function patchElement(oldVdom, newVdom, hostComponent) {
  const el = oldVdom.el;

  const {
    class: oldClass,
    style: oldStyle,
    on: oldEvents,
    ...oldAttrs
  } = oldVdom.props;
  const {
    class: newClass,
    style: newStyle,
    on: newEvents,
    ...newAttrs
  } = newVdom.props;
  const { listeners: oldListeners } = oldVdom;

  patchAttrs(el, oldAttrs, newAttrs);
  patchClasses(el, oldClass, newClass);
  patchStyles(el, oldStyle, newStyle);
  newVdom.listeners = patchEvents(el, oldListeners, oldEvents, newEvents, hostComponent);
}

function patchAttrs(el, oldAttrs, newAttrs) {
  // finds which attributes have been added, removed, or changed
  const { added, removed, updated } = objectsDiff(oldAttrs, newAttrs);

  // removes the attributes taht have been removed
  for (const attr of removed) {
    removeAttribute(el, attr);
  }

  // sets the attributes that have been added or changed
  for (const attr of added.concat(updated)) {
    setAttribute(el, attr, newAttrs[attr]);
  }
}

function patchClasses(el, oldClass, newClass) {
  // array of css classes
  const oldClasses = toClassList(oldClass);
  const newClasses = toClassList(newClass);

  // find which css classes have been added and removed
  const { added, removed } = arraysDiff(oldClasses, newClasses);

  // remove and  add the css classes
  if (removed.length > 0) {
    el.classList.remove(...removed);
  }
  if (added.length > 0) {
    el.classList.add(...added);
  }
}

function patchStyles(el, oldStyle = {}, newStyle = {}) {
  const { added, removed, updated } = objectsDiff(oldStyle, newStyle);

  for (const style of removed) {
    removeStyle(el, style);
  }

  for (const style of added.concat(updated)) {
    setStyle(el, style, newStyle[style]);
  }
}

function patchEvents(el, oldListeners = {}, oldEvents = {}, newEvents = {}, hostComponent) {
  // finds which event listeners changed
  const { removed, added, updated } = objectsDiff(oldEvents, newEvents);

  // removes removed or modified event listeners
  for (const eventName of removed.concat(updated)) {
    el.removeEventListener(eventName, oldListeners[eventName]);
  }

  const addedListeners = {};

  // adds added or modified event listeners
  for (const eventName of added.concat(updated)) {
    const listener = addEventListener(eventName, newEvents[eventName], el, hostComponent);
    addedListeners[eventName] = listener;
  }

  return addedListeners;
}

function patchChildren(oldVdom, newVdom, hostComponent) {
  // extract children araray
  const oldChildren = extractChildren(oldVdom);
  const newChildren = extractChildren(newVdom);
  const parentEl = oldVdom.el;

  // finds the operatios to transform the old array into the new one
  const diffSeq = arraysDiffSequence(oldChildren, newChildren, areNodesEqual);

  for (const operation of diffSeq) {
    const { originalIndex, index, item } = operation;
    const offset = hostComponent?.offset ?? 0;

    switch (operation.op) {
      case ARRAY_DIFF_OP.ADD: {
        mountDOM(item, parentEl, index + offset, hostComponent, hostComponent);
        break;
      }

      case ARRAY_DIFF_OP.REMOVE: {
        destroyDOM(item);
        break;
      }

      case ARRAY_DIFF_OP.MOVE: {
        // gets old virtual node at the original index
        const oldChild = oldChildren[originalIndex];
        // gets the new virtual node at the new index
        const newChild = newChildren[index];
        // gets the dom element associated with the moved node
        const el = oldChild.el;
        // finds the element at the target index inside the parent element
        const elAtTargetIndex = parentEl.childNodes[index];

        // inserts the moved element before the target element
        parentEl.insertBefore(el, elAtTargetIndex);
        // recursively patches the moved element
        patchDOM(oldChild, newChild, parentEl, hostComponent);
        break;
      }

      case ARRAY_DIFF_OP.NOOP: {
        patchDOM(
          oldChildren[originalIndex],
          newChildren[index],
          parentEl,
          hostComponent
        );
        break;
      }
    }
  }
}

function patchComponent(oldVdom, newVdom) {
  // extract component and props from virtual node.
  const { component } = oldVdom;
  const { props } = newVdom;
  // update component's props.
  component.updateProps(props);

  newVdom.component = component;
  newVdom.el = component.firstElement;
}

function toClassList(classes = "") {
  // filter blank and empty strings
  return Array.isArray(classes)
    ? classes.filter(isNotBlankOrEmptyString)
    : // split string on whitespace
      classes.split(/(\s+)/).filter(isNotBlankOrEmptyString);
}
