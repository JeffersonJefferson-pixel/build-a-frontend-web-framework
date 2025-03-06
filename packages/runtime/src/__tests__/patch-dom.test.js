import { beforeEach, test, expect, describe, vi } from 'vitest';
import { h, hFragment, hString } from "../h";
import { mountDOM } from "../mount-dom";
import { patchDOM } from "../patch-dom";

beforeEach(() => {
    document.body.innerHTML = '';
});

test('no change', () => {
    const oldVdom = h('div', {}, ['hello']);
    const newVdom = h('div', {}, ['hello']);

    const vdom = patch(oldVdom, newVdom);

    expect(document.body.innerHTML).equal('<div>hello</div>');

    // set el in new vdom
    expect(newVdom.el).toBe(vdom.el);
});

test('change the root node', () => {
    const oldVdom = h('div', {}, ['hello']);
    const newVdom = h('span', {}, ['hello']);

    const vdom = patch(oldVdom, newVdom);

    expect(document.body.innerHTML).toEqual('<span>hello</span>');
    expect(vdom.el).toBeInstanceOf(HTMLSpanElement);
    expect(newVdom.el).toBe(vdom.el);
});

test('patch text', async () => {
    const oldVdom = hString('foo');
    const newVdom = hString('bar');

    patch(oldVdom, newVdom);

    expect(document.body.innerHTML).toEqual('bar');
});

describe('patch fragments', () => {
    test('nested fragments, add child', () => {
        const oldVdom = hFragment([hFragment([hString('foo')])]);
        const newVdom = hFragment([hFragment([hString('foo'), hString('bar')]), h('p', {}, ['baz'])]);

        patch(oldVdom, newVdom);

        expect(document.body.innerHTML).toEqual('foobar<p>baz</p>');
    });
});

describe('patch attributes', () => {
    test('add attribute', () => {
        const oldVdom = h('div', {});
        const newVdom = h('div', { id: 'foo' });
        
        patch(oldVdom, newVdom);
        expect(document.body.innerHTML).toEqual('<div id="foo"></div>');
    })
});

describe('patch class', () => {
    test('from no class', () => {
        const oldVdom = h('div', {})
        const newVdom = h('div', { class: 'foo' })

        patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toEqual('<div class="foo"></div>')
    })
})

describe('patch style', () => {
    test('add style', () => {
        const oldVdom = h('div')
        const newVdom = h('div', { style: { color: 'red' } })

        patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toBe('<div style="color: red;"></div>')
    })

    test('remove style', () => {
        const oldVdom = h('div', { style: { color: 'red' } })
        const newVdom = h('div')

        patch(oldVdom, newVdom);
        expect(document.body.innerHTML).toBe('<div style=""></div>')
    })
})

describe('patch event handler', () => {
    test('update event handler', async () => {
        const oldHandler = vi.fn()
        const oldVdom = h('button', { on: { click: oldHandler } }, ['Click me'])

        const newHandler = vi.fn()
        const newVdom = h('button', { on: { click: newHandler } }, ['Click me'])

        await patch(oldVdom, newVdom)

        document.body.querySelector('button').click()

        expect(oldHandler).not.toHaveBeenCalled()
        expect(newHandler).toHaveBeenCalled()
        expect(newVdom.listeners).not.toBeUndefined()
    })
})

async function patch(oldVdom, newVdom, hostComponent = null) {
    await mountDOM(oldVdom, document.body);
    return patchDOM(oldVdom, newVdom, document.body, hostComponent);
}