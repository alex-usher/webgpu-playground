// File containing all string processing functions bound to keyboard shortcuts in the code editor page

/*
  HTML textareas have some internal validation of selectionStart and selectionEnd 
  - To prevent this from causing unexpected errors, get and set only the relevant values all at once
*/

type textareaState = {
  text: string;
  start: number;
  end: number;
};

const getTextareaState = (textareaRef: HTMLTextAreaElement): textareaState => {
  //console.log(textareaRef);
  return {
    text: textareaRef.value,
    start: textareaRef.selectionStart,
    end: textareaRef.selectionEnd,
  };
};

const setTextareaState = (
  newState: textareaState,
  textareaRef: HTMLTextAreaElement
): void => {
  //console.log(textareaRef);
  textareaRef.value = newState.text;
  textareaRef.selectionStart = newState.start;
  textareaRef.selectionEnd = newState.end;
  // console.log(textareaRef);
  // textareaRef.innerText = newState.text;
  // console.log(textareaRef);
  // console.log("COMPARISON");
  // console.log(textareaRef.value);
  // console.log(textareaRef.value.replace(/<br\s?\/?>/g, "\r\n"));
  // console.log(
  //   textareaRef.value === textareaRef.value.replace(/<br\s?\/?>/g, "\r\n")
  // );
  // textareaRef.value = textareaRef.value.replace(/<br\s?\/?>/g, "\r\n"); //= textareaRef.value.split("<br>").join("\n"); //replace(/<br *\/?>/gi, "\n");
  // console.log(textareaRef);
  // console.log(textareaRef);
  // console.log(textareaRef.innerHTML);
  // textareaRef.innerHTML = textareaRef.innerHTML.replace(/<br *\/?>/gi, "\n");
  // console.log(textareaRef);
};

const getCurrentLineIndex = (state: textareaState): number => {
  const selectionPrefix = state.text.slice(0, state.start);
  return selectionPrefix.lastIndexOf("\n");
};

// Add indents to the selection
const insertTab = (textareaRef: HTMLTextAreaElement): string => {
  const state = getTextareaState(textareaRef);
  const { text, start, end } = state;
  const newState: textareaState = { text: "", start: 0, end: 0 };

  // If the selection has no length, add a tab at the cursor
  if (start === end) {
    newState.text = text.slice(0, start) + "\t" + text.slice(start);
    newState.start = start + 1;
    newState.end = end + 1;
    // Otherwise add tabs to the start of every line in the selection
  } else {
    newState.text = replaceSelectionLineStart(state, "", "\t").text;
    newState.start = start + 1;
    newState.end = end + (newState.text.length - text.length);
  }

  setTextareaState(newState, textareaRef);
  return newState.text;
};

// Remove indents from the selection
const applyShiftTab = (textareaRef: HTMLTextAreaElement) => {
  const currentState = getTextareaState(textareaRef);
  const { text, start, end } = getTextareaState(textareaRef);
  const currentLineIndex = getCurrentLineIndex(currentState);

  console.log(text.slice(0, currentLineIndex));

  // remove both spaces and tabs from the start of lines
  const stateWithoutTabs = replaceSelectionLineStart(currentState, "\t", "");
  const newState = replaceSelectionLineStart(stateWithoutTabs, "  ", "");

  if (newState.text !== text) {
    newState.start = start - (text[currentLineIndex] == "\t" ? 1 : 0);
    newState.end = end - (text.length - newState.text.length);

    setTextareaState(newState, textareaRef);
  }
};

// Replaces find with replace at the start of every line in the selcetion
// TODO - move calculation of new start/end into here
const replaceSelectionLineStart = (
  state: textareaState,
  find: string,
  replace: string
): textareaState => {
  const { text, start, end } = state;
  // Handle the first line separately as it won't necessarily be preceeded by a new line
  const firstLineIndex = getCurrentLineIndex(state);

  // Replace the first occurence - if adding, prepend replace
  const firstLinePrefix =
    find === ""
      ? replace + text.slice(firstLineIndex, start)
      : text.slice(firstLineIndex, start).replace(find, replace);

  const newText =
    // Keep text before the selection the same
    text.slice(0, firstLineIndex) +
    firstLinePrefix +
    // Replace all occurences after
    text.slice(start, end).replaceAll("\n" + find, "\n" + replace) +
    // Keep text after the selection the same
    text.slice(end);

  return { text: newText, start, end };
};

export { insertTab, applyShiftTab };
