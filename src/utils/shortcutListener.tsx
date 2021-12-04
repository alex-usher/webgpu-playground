import KeyboardShortcut from "./keyboardShortcuts";

// A listener attached to one object in the dom
const ShortcutListener = (
  event: KeyboardEvent,
  pattern: KeyboardShortcut,
  action: Function // eslint-disable-line
) => {
  if (pattern.match(event)) {
    action();
    event.preventDefault();
  }
};

const addShortcuts = (
  selector: string,
  shortcuts: { shortcut: KeyboardShortcut; action: () => void }[]
) => {
  const objectRef = document.querySelector(selector);
  shortcuts.forEach(({ shortcut, action }) => {
    objectRef?.addEventListener(
      "keydown",
      (event) => {
        ShortcutListener(event as KeyboardEvent, shortcut, action);
      },
      true
    );
  });
};

export { ShortcutListener, addShortcuts };
