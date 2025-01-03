import { DOM_TYPES } from "./h";

export function areNodesEqual(nodeOne, nodeTwo) {
  // nodes of different types are never equal
  if (nodeOne.type !== nodeTwo.type) {
    return false;
  }

  // check if node is element type.
  if (nodeOne.type === DOM_TYPES.ELEMENT) {
    // compare element tag and key.
    const { 
      tag: tagOne,
      props: { key: keyOne } 
    } = nodeOne;
    const { 
      tag: tagTwo,
      props: { key: keyTwo }
    } = nodeTwo 

    return tagOne === tagTwo && keyOne === keyTwo ;
  }

  // check if type is component.
  if (nodeOne.type === DOM_TYPES.COMPONENT) {
    // compare component prototype and key.
    const { 
      tag: componentOne, 
      props: { key: keyOne } 
    } = nodeOne;
    const { 
      tag: componentTwo, 
      props: { key: keyTwo } 
    } = nodeTwo;
    
    return componentOne === componentTwo && keyOne === keyTwo;
  }

  return true;
}