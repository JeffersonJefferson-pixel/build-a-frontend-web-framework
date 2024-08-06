import { beforeEach, expect, test } from 'vitest'
import { h, hFragment, hString } from '../h'
import {  mountDOM } from '../mount-dom'
import { destroyDOM } from '../destroy-dom'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('destroy a text node', () => {
  const vdom = hString('hello')

  mountDOM(vdom, document.body)
  destroyDOM(vdom)

  expect(document.body.innerHTML).toBe('')
  expect(vdom.el).toBeUndefined()
})

test('destroy an element node', () => {
  const vdom = h('div', {}, [hString('hello')])

  mountDOM(vdom, document.body)
  destroyDOM(vdom)

  expect(document.body.innerHTML).toBe('')
  expect(vdom.el).toBeUndefined()
  expect(vdom.children.every(child => child.el == undefined)).toBe(true)
})

test('destroy a fragment node', () => {
  const vdom = hFragment([hString('hello, '), hString('world')])

  mountDOM(vdom, document.body)
  destroyDOM(vdom)

  expect(document.body.innerHTML).toBe('')
  expect(vdom.el).toBeUndefined()
  expect(vdom.children.every(child => child.el == undefined)).toBe(true)
})