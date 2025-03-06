import { beforeEach, expect, test, vi } from "vitest";
import { h, hFragment, hString } from "../h";
import { mountDOM } from "../mount-dom";
import { defineComponent } from "../component";

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


test('mount component with props', () => {
  const Component = defineComponent({
    render() {
      return h('p', { class: 'important' }, [this.props.message])
    }
  })
  const vdom = h(Component, { message: 'hello'})
  mountDOM(vdom, document.body)

  expect(document.body.innerHTML).toBe('<p class="important">hello</p>')
  expect(vdom.component).toBeInstanceOf(Component)
})

test('mount dom with children', () => {
  const ChildComp = defineComponent({
    render() {
      return h('p', {}, [this.props.message])
    }
  })

  const ParentComp = defineComponent({
    render() {
      return h(
        'div',
        {},
        this.props.messages.map(msg => h(ChildComp, { message: msg }))
      )
    }
  })

  const vdom = h(ParentComp, { messages: ['hello', 'world'] })
  mountDOM(vdom, document.body)

  expect(document.body.innerHTML).toBe(
    '<div><p>hello</p><p>world</p></div>'
  )
  expect(vdom.component).toBeInstanceOf(ParentComp)
})

test('mount a component with event handlers', () => {
  const onClick = vi.fn()
  const Component = defineComponent({
    render() {
      return h(
        'button', 
        { on: { click: () => this.emit('click') } },
        ['Click me']
      )
    }
  })
  const vdom = h(Component, { on: { click: onClick } })
  mountDOM(vdom, document.body)

  document.querySelector('button').click()

  expect(onClick).toBeCalledTimes(1)
})

test('mount a component with a parent component', () => {
  const Parent = {}
  const Component = defineComponent({
    render() {
      return h('p', {}, ['child'])
    }
  })
  const vdom = h(Component)
  mountDOM(vdom, document.body, null, Parent)

  expect(document.body.innerHTML).toBe('<p>child</p>')
  expect(vdom.component.parentComponent).toBe(Parent)
})