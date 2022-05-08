/**
 * Checks if we're working with the touchscreen or with the
 * regular desktop browser. Used to determine, what kind of
 * events should we use:
 * mouse events or touch events.
 */
 function isTouchDevice() {
  return ('ontouchstart' in document.documentElement);
}

export {isTouchDevice};