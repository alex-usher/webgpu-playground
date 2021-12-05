// Dataclass defining a complete keyboard shortcut
class KeyboardShortcut {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;

  constructor(key: string, shift = false, ctrl = false, alt = false) {
    this.key = key;
    this.altKey = alt;
    this.ctrlKey = ctrl;
    this.shiftKey = shift;
  }

  // returns true iff the current keyboard event matches the shortcut
  match = (event: KeyboardEvent) => {
    return (
      event.key.toLowerCase() == this.key.toLowerCase() &&
      event.altKey == this.altKey &&
      event.ctrlKey == this.ctrlKey &&
      event.shiftKey == this.shiftKey
    );
  };
}

export default KeyboardShortcut;
