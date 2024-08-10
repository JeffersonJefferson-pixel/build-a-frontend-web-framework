import { DOM_TYPES } from "./h";

export function areNodesEqual(nodeOne, nodeTwo) {
  // nodes of different types are never equal
  if (nodeOne.type !== nodeTwo.type) {
    return false
  }

  if (nodeOne.type === DOM_TYPES.ELEMENT) {
    const { tag: tagOne } = nodeOne 
    const { tag: tagTwo } = nodeTwo 

    return tagOne === tagTwo 
  }

  return true
}