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

// Given a list of definitions for all shortcuts to add in each object, add the relevant listeners
// eslint-disable-next-line
// const addMappings = (mappings: { selector: string, shortcuts: { shortcut: KeyboardShortcut, action: () => void }[] }[]) => {
//   mappings.forEach((objectMapping) => {
//     addShortcuts(objectMapping.selector, objectMapping.shortcuts);
//   });
// };

const addShortcuts = (
  selector: string,
  shortcuts: { shortcut: KeyboardShortcut; action: () => void }[]
) => {
  const objectRef = document.querySelector(selector);
  shortcuts.forEach(({ shortcut, action }) => {
    console.log("added listener");
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
