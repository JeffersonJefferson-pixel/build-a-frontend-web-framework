export async function readTodos() {
    console.log('reading todos...')
    // simulate slow io
    await delay(1000)
    return JSON.parse(localStorage.getItem('todos') || '[]')
}

export function writeTodos(todos) {
    localStorage.setItem('todos', JSON.stringify(todos))
}

const delay = (ms) => new Promise(res => setTimeout(res, ms));