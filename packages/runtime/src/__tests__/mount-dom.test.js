import { beforeEach, expect, test } from "vitest";
import { h, hFragment, hString } from "../h";
import { mountDOM } from "../mount-dom";

beforeEach(() => {
  document.body.innerHTML = "";
});

test("mount a text vNode", () => {
  const vdom = hString("hello");
  mountDOM(vdom, document.body);
  // check html
  expect(document.body.innerHTML).toBe("hello");
  // check element reference
  const el = vdom.el;
  expect(el).toBeInstanceOf(Text);
  expect(el.textContent).toBe("hello");
});

test("mount an element vNode", () => {
  const vdom = h("div", {}, [hString("hello")]);
  mountDOM(vdom, document.body);
  // check html
  expect(document.body.innerHTML).toBe("<div>hello</div>");
  // check element reference
  const el = vdom.el;
  expect(el).toBeInstanceOf(HTMLDivElement);
});

test("mount a fragment vNode", () => {
  const vdom = hFragment([hString("hello, "), hString("world")]);
  mountDOM(vdom, document.body);
  // check html
  expect(document.body.innerHTML).toBe("hello, world");
  // ccheck element reference
  const el = vdom.el;
  expect(el).toBe(document.body);
});
