import { withoutNulls } from "./utils/arrays";

export const DOM_TYPES = {
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
};

export function h(tag, props = {}, children = []) {
  return {
    tag,
    props,
    children: mapTextNodes(withoutNulls(children)),
    type: DOM_TYPES.ELEMENT,
  };
}

function mapTextNodes(children) {
  return children.map((child) =>
    typeof child === "string" ? hString(child) : child
  );
}

export function hString(str) {
  return { type: DOM_TYPES.TEXT, value: str };
}

export function hFragment(vNodes) {
  return {
    type: DOM_TYPES.FRAGMENT,
    children: mapTextNodes(withoutNulls(vNodes)),
  };
}

export function extractChildren(vdom) {
  // if the node has no children, returns an empty array
  if (vdom.children == null) {
    return []
  }

  const children = []

  // iterates over the children
  for (const child of vdom.children) {
    if (child.type === DOM_TYPES.FRAGMENT) {
      // extracts it children recursively
      children.push(...extractChildren(child, children))
    } else {
      // adds the child to the array
      children.push(child)
    }
  }

  return children
}

export function lipsum(n) {
  const text = `Lorem ipsum dolor sit amet, consectetur adipisc
    ing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
     ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com
    modo consequat.`;

  return hFragment(Array(n).fill(h("p", {}, [text])));
}

export function MessageComponent(level, message) {
    return h("div", { class: `message message--${level}` }, [h("p", {}, [message])])
}