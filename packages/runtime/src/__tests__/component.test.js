import { beforeEach, describe, expect, test, vi } from "vitest"
import { defineComponent } from "../component"
import { h, hFragment, hString } from "../h"

beforeEach(() => {
    document.body.innerHTML = ''
})

describe('mounting and unmounting', () => {
    test('can be mounted into DOM', () => {
        new Comp().mount(document.body)

        expect(document.body.innerHTML).toBe(
            '<p>A point is that which has no part.</p>'
        )
    })

    test('can be mounted at a specific position', () => {
        document.body.innerHTML = '<h1>Definitions</h1><hr>'

        const comp = new Comp()
        comp.mount(document.body, 1)

        expect(document.body.innerHTML).toBe(
            '<h1>Definitions</h1><p>A point is that which has no part.</p><hr>'
        )
    })

    test('can be unmounted', () => {
        const comp = new Comp()
        comp.mount(document.body)
        comp.unmount()

        expect(document.body.innerHTML).toBe('')
    })

    test('can be mounted as a fragment', () => {
        const comp = new FragComp()
        comp.mount(document.body)

        expect(document.body.innerHTML).toBe(
            '<p>A point is that which has no part.</p><p>A line is breadthless length.</p>'
        )
    })
})

describe('Component props', () => {
    test('can have props', () => {
        const comp = new PropsComp({ pClass: 'definition' })
        comp.mount(document.body)

        expect(document.body.innerHTML).toBe(
            '<p class="definition">A point is that which has no part.</p>'
        )
    })

    test('when the props are updated, the DOM is patched', () => {
        const comp = new PropsComp({ pClass: 'definition' })
        comp.mount(document.body)

        comp.updateProps({ pClass: ['definition', 'updated'] })

        expect(document.body.innerHTML).toBe(
            '<p class="definition updated">A point is that which has no part.</p>'
        )
    })

    test('does not patch the DOM if the props are the same', () => {
        const comp = new PropsComp({ pClass: 'definition' })
        comp.mount(document.body)

        const renderSpy = vi.spyOn(comp, 'render')

        comp.updateProps({ pClass: 'definition' })

        expect(renderSpy).not.toHaveBeenCalled()
    })
})

describe('Component state', () => {
    test('can have its own internal state', () => {
        const comp = new StateComp()
        comp.mount(document.body)

        expect(document.body.innerHTML).toBe('<button>0</button>')
    })

    test('can be based on the props', () => {
        const Comp = defineComponent({
            state(props) {
                return { count: props.initialCount }
            },
            render() {
                return h('p', {}, [hString(this.state.count)])
            }
        })
        const comp = new Comp({ initialCount: 10 })

        comp.mount(document.body)

        expect(document.body.innerHTML).toBe('<p>10</p>')
    })

    test('when state changes, the DOM is patched', () => {
        const comp = new StateComp()
        comp.mount(document.body)

        comp.updateState({ count: 5 })

        expect(document.body.innerHTML).toBe('<button>5</button>')
    })

    test('an event can change the state', () => {
        const comp = new StateComp()
        comp.mount(document.body)

        document.querySelector('button').click()

        expect(document.body.innerHTML).toBe('<button>1</button>')
    })
})

describe('Component methods', () => {
    test('can use methods to handle events', () => {
            const Comp = defineComponent({
                state() {
                    return { count: 0 }
                },
                increment() {
                    this.updateState({ count: this.state.count + 1 })
                },
                render() {
                    return h(
                        'button',
                        {
                            on: {
                                click: this.increment
                            }
                        },
                        [hString(this.state.count)]
                    )
                }
            })

            const comp = new Comp()
            comp.mount(document.body)

            document.querySelector('button').click()

            expect(document.body.innerHTML).toBe('<button>1</button>')
        }
    )
})

describe('Child components', () => {
    const items = [
        'A point is that which has no part',
        'A line is breadthless length',
    ]

    test('can mount child components', () => {
        const comp = new List({ items })
        comp.mount(document.body)

        expect(document.body.innerHTML).toBe(
            '<ul><li>A point is that which has no part</li><li>A line is breadthless length</li></ul>'
        )

    })

    test('can unmoun child components', () => {
        const comp = new List({ items })
        comp.mount(document.body)

        comp.unmount()

        expect(document.body.innerHTML).toBe('')
    })

    test('children can be added', () => {
        const comp = new List({ items })
        comp.mount(document.body)

        comp.updateProps({
            items: [...items, 'The ends of a line are points'],
        })

        expect(document.body.innerHTML).toBe(
            '<ul><li>A point is that which has no part</li><li>A line is breadthless length</li><li>The ends of a line are points</li></ul>'
        )
    })

    test('children can be removed', () => {
        const comp = new List({ items })
        comp.mount(document.body)

        comp.updateProps({ items: [items[0]] })

        expect(document.body.innerHTML).toBe(
            '<ul><li>A point is that which has no part</li></ul>'
        )
    })
})

describe('Events', () => {
    test('components can emit events', () => {
        const handler = vi.fn()
        const comp = new ListItem(
            { text: 'A point is that which has no part' },
            { 'remove-item': handler }
        )
        comp.mount(document.body)

        document.querySelector('li').dispatchEvent(new Event('dblclick'))

        expect(handler).toHaveBeenCalledTimes(1)
        expect(handler).toHaveBeenCalledWith('A point is that which has no part')
    })
})

describe()

const Comp = defineComponent({
    render() {
        return h('p', {}, ['A point is that which has no part.'])
    }
})

const FragComp = defineComponent({
    render() {
        return hFragment([
            h('p', {}, ['A point is that which has no part.']),
            h('p', {}, ['A line is breadthless length.'])
        ])
    }
})

const PropsComp = defineComponent({
    render() {
        return h('p', { class: this.props.pClass }, ['A point is that which has no part.'])
    }
})

const StateComp = defineComponent({
    state() {
        return { count: 0}
    },
    render() {
        return h(
            'button',
            {
                on: {
                    click: () => this.updateState({ count: this.state.count + 1 })
                }
            },
            [hString(this.state.count)]
        )
    }
})

const ListItem = defineComponent({
    render() {
        return h(
            'li',
            {
                on: {
                    dblclick: () => this.emit('remove-item', this.props.text)
                }
            },
            [this.props.text]
        )
    }
})

const List = defineComponent({
    render() {
        return h(
            'ul',
            {},
            this.props.items.map((item) => 
                h(ListItem, {
                    text: item
                })
            )
        )
    }
}) 