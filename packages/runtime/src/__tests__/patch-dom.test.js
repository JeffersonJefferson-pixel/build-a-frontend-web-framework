import { beforeEach, test, expect, describe } from 'vitest';
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

function patch(oldVdom, newVdom, hostComponent = null) {
    mountDOM(oldVdom, document.body);
    return patchDOM(oldVdom, newVdom, document.body, hostComponent);
}