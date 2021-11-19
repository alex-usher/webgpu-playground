import KeyboardShortcut from "./keyboardShortcuts";

// A listener attached to one object in the dom
const ShortcutListener = (
  event: KeyboardEvent,
  pattern: KeyboardShortcut,
  action: Function // eslint-disable-line
) => {
  if (pattern.match(event)) {
    action();
  }
};

export default ShortcutListener;
