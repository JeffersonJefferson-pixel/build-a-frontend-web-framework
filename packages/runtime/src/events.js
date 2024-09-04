export function addEventListener(eventName, handler, el, hostComponent) {
  function boundHandler() {
    hostComponent
      ? handler.apply(hostComponent, arguments) // bind host component to event handler context
      : handler(...arguments);
  }

  el.addEventListener(eventName, boundHandler);
  return handler;
}

export function addEventListeners(listeners = {}, el, hostComponent = null) {
  const addedListeners = {};

  Object.entries(listeners).forEach(([eventName, handler]) => {
    const listener = addEventListener(eventName, handler, el, hostComponent);
    addedListeners[eventName] = listener;
  });

  return addedListeners;
}

export function removeEventListeners(listeners = {}, el) {
  Object.entries(listeners).forEach(([eventName, handler]) => {
    el.removeEventListener(eventName, handler);
  });
}
