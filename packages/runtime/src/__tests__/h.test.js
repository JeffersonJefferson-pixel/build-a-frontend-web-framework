import { test, expect } from "vitest";
import { h, hString, hFragment, DOM_TYPES } from "../h";

test("create a text vNode", () => {
  const vNode = hString("test");

  expect(vNode).toEqual({
    type: DOM_TYPES.TEXT,
    value: "test",
  });
});

test("create an element vNode", () => {
  const tag = "div";
  const props = { id: "test" };
  const children = [hString("test")];

  const vNode = h(tag, props, children);

  expect(vNode).toEqual({
    tag,
    props,
    children: [{ type: DOM_TYPES.TEXT, value: "test" }],
    type: DOM_TYPES.ELEMENT,
  });
});

test("create a fragment vNode", () => {
  const children = [h("div", { class: "foo" }, [])];
  const vNode = hFragment(children);

  expect(vNode).toEqual({
    type: DOM_TYPES.FRAGMENT,
    children: [
      {
        type: DOM_TYPES.ELEMENT,
        tag: "div",
        props: { class: "foo" },
        children: [],
      },
    ],
  });
});
