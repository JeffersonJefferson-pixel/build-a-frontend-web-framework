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

    // TODO: addition case
    // TODO: move case
  }

  return sequence 
}