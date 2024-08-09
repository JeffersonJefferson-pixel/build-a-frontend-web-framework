export const ARRAY_DIFF_OP = {
  ADD: 'add',
  REMOVE: 'remove',
  MOVE: 'move',
  NOOP: 'noop'
}

class ArrayWithOrginalIndices {
  #array = []
  #originalIndices = []
  #equalsFn

  constructor(array, equalsFn) {
    this.#array = [...array]
    this.#originalIndices = array.map((_, i) => i)
    this.#equalsFn = equalsFn
  }

  get length() {
    return this.#array.length
  }

  originalIndexAt(index) {
    return this.#originalIndices[index]
  }

  isRemoval(index, newArray) {
    if (index >= this.length) {
      return false;
    }

    // get item in the old array at the given index
    const item = this.#array[index]
    // tries to find the same item in the new array
    const indexInNewArray = newArray.findIndex((newItem) => this.#equalsFn(item, newItem))

    return indexInNewArray === -1
  }

  removeItem(index) {
    // creates remove operation
    const operation = {
      op: ARRAY_DIFF_OP.REMOVE,
      index,
      item: this.#array[index]
    }
    this.#array.splice(index, 1)
    this.#originalIndices.splice(index, 1)

    return operation
  }

  isNoop(index, newArray) {
    if (index >= this.length) {
      return false
    }
    
    // item in old array
    const item = this.#array[index]
    // item in new array
    const newItem = newArray[index]

    //  check if there are equal
    return this.#equalsFn(item, newItem)
  }

  noopItem(index) {
    // creates a noop operation
    return {
      op: ARRAY_DIFF_OP.NOOP,
      originalIndex: this.originalIndexAt(index),
      index,
      item: this.#array[index]
    }
  }

  isAddition(item, fromIdx) {
    return this.findIndexFrom(item, fromIdx) === - 1
  }

  findIndexFrom(item, fromIndex) {
    for (let i = fromIndex; i < this.length; i++) {
      if (this.#equalsFn(item, this.#array[i])) {
        return i
      }

      return -1
    }
  }

  addItem(item, index) {
    // creates the add operation
    const operation  ={
      op: ARRAY_DIFF_OP.ADD,
      index, 
      item
    }
    // adds the new item to theold array add the given index
    this.#array.splice(index, 0, item)
    // adds a -1 index to originalIndices array at the given index
    this.#originalIndices.splice(index, 0, -1)

    return operation
  }

  moveItem(item, toIndex) {
    // looks for item in the old array, starting from the target index
    const fromIndex = this.findIndexFrom(item, toIndex)

    const operation = {
      op: ARRAY_DIFF_OP.MOVE,
      originalIndex: this.originalIndexAt(fromIndex),
      from: fromIndex,
      index: toIndex,
      item: this.#array[fromIndex]
    }

    // extracts item from the old array
    const [_item] = this.#array.splice(fromIndex, 1)
    // inserts item into the new position
    this.#array.splice(toIndex, 0, _item)

    // extracts original index from the originalIndices array
    const [originalIndex] = this.#originalIndices.splice(fromIndex, 1)
    this.#originalIndices.splice(toIndex, 0, originalIndex)

    return operation
  }

  removeItemsAfter(index) {
    const operations = []

    while (this.length > index) {
      operations.push(this.removeItem(index))
    }

    return operations
  }
}

export function withoutNulls(arr) {
  return arr.filter((item) => item != null);
}

export function arraysDiff(oldArray, newArray) {
  return {
    added: newArray.filter((newItem) => !oldArray.includes(newItem)),
    removed: oldArray.filter((oldItem) => !newArray.includes(oldItem)),
  }
}



export function arraysDiffSequence(oldArray, newArray, equalsFn = (a, b) => a === b) {
  const sequence = []
  // wrap old array
  const array = new ArrayWithOrginalIndices(oldArray, equalsFn)

  //  iterate indices of the new array
  for (let index = 0; index < newArray.length; index++) {
    // checks whether item in the old array at the current index was removed
    if (array.isRemoval(index, newArray)) {
      // removes the item and pushes the operation to the sequence
      sequence.push(array.removeItem(index))
      index--
      continue
    }

    // checks whether the operation is a noop
    if (array.isNoop(index, newArray)) {
      sequence.push(array.noopItem(index))
      continue
    }

    // get items in the new array at the current index
    const item = newArray[index]

    // check whether the case is an addition
    if (array.isAddition(item, index)) {
      // appends the add operation to the sequence
      sequence.push(array.addItem(item, index))
      continue
    }

    sequence.push(array.moveItem(item, index))
  }

  sequence.push(...array.removeItemsAfter(newArray.length))

  return sequence 
}