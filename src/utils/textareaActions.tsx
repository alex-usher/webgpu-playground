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
    const replaced = replaceSelectionLineStart(state, "", "\t");
    newState.text = replaced.text;
    newState.start = replaced.start;
    newState.end = replaced.end;
  }

  setTextareaState(newState, textareaRef);
  return newState.text;
};

// Remove indents from the selection
const applyShiftTab = (textareaRef: HTMLTextAreaElement) => {
  const currentState = getTextareaState(textareaRef);

  // remove both spaces and tabs from the start of lines
  const stateWithoutTabs = replaceSelectionLineStart(currentState, "\t", "");
  const newState = replaceSelectionLineStart(stateWithoutTabs, "  ", "");

  if (newState.text !== currentState.text) {
    setTextareaState(newState, textareaRef);
  }
};

// Toggles comments at the start of every line of the selection
// TODO change to support tabbing/untabbingn at the current indentation level
const applyCtrlSlash = (textareaRef: HTMLTextAreaElement) => {
  const currentState = getTextareaState(textareaRef);
  const { text, start, end } = currentState;
  // Match "// " or "//"
  const commentRegex = /\n\/\/( |)/gm;
  const firstLineIndex = getCurrentLineIndex(currentState);

  // Get all the comment matches and newlines in the selection
  const selectionComments = text.slice(firstLineIndex, end).match(commentRegex);
  const selectionLines = text.slice(start, end).split("\n");

  // Boolean storing if every line in the selection is commented
  let commented = false;
  if (selectionComments) {
    if (selectionLines) {
      commented = selectionComments.length >= selectionLines.length;
    } else {
      commented = true;
    }
  }
  console.log(selectionComments);
  console.log(selectionLines?.length);
  console.log(commented);

  // Remove comments if all lines in the selection start with comments
  const newState = commented
    ? replaceSelectionLineStart(currentState, commentRegex, "")
    : replaceSelectionLineStart(currentState, "", "// ");
  setTextareaState(newState, textareaRef);
};

// Replaces find with replace at the start of every line in the selcetion
const replaceSelectionLineStart = (
  state: textareaState,
  find: string | RegExp,
  replace: string
): textareaState => {
  const { text, start, end } = state;
  // Handle the first line separately as it won't necessarily be preceeded by a new line
  const firstLineIndex = getCurrentLineIndex(state);
  const findExp = typeof find == "string" ? "\n" + find : find;

  const newText =
    // Keep text before the selection the same
    text.slice(0, firstLineIndex) +
    // Replace all occurences
    text.slice(firstLineIndex, end).replaceAll(findExp, "\n" + replace) +
    // Keep text after the selection the same
    text.slice(end);

  let newStart = start;
  if (find === "") {
    // If adding, replace will always be added before the selection start
    newStart += replace.length;
  } else {
    // Match find in the first line prefix
    const firstMatch = text.slice(firstLineIndex, start).match(find);
    if (firstMatch) {
      // If find is in the first line prefix, it will be removed
      newStart -= firstMatch[0].replace("\n", "").length;
    }
  }

  const newEnd = end + (newText.length - text.length);
  return { text: newText, start: newStart, end: newEnd };
};

export { insertTab, applyShiftTab, applyCtrlSlash };
