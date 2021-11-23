import React, { useEffect } from "react";
import "../assets/editor.css";
import "../assets/prism.css";
import Prism from "prismjs";

import KeyboardShortcut from "../utils/keyboardShortcuts";
import { addShortcuts } from "../utils/shortcutListener";
import { applyShiftTab, insertTab } from "../utils/textareaActions";

const tab = new KeyboardShortcut("Tab");
const shiftTab = new KeyboardShortcut("Tab", true);

console.log(insertTab);

interface EditorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  opacity?: number;
}

const Editor = ({ value, onChange, opacity = 0.5 }: EditorProps) => {
  let lines = 0;
  if (value) {
    lines = value.split(/\r\n|\r|\n/).length;
  }

  const gutterRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<HTMLTextAreaElement>(null);
  const codeBlockRef = React.useRef<HTMLPreElement>(null);

  //const [codeValue, setCodeValue] = React.useState(value);

  const lineNumbers = [...Array(lines)].map((_, i) => (
    <div key={i}>
      {i + 1}
      <br />
    </div>
  ));

  useEffect(() => {
    if (editorRef?.current) {
      console.log("USE EFFECT:");
      console.log(editorRef.current);
      Prism.highlightAll();
    }
  }, [editorRef?.current?.value]);

  // Add the shortcut listeners once after render
  useEffect(() => {
    if (editorRef?.current) {
      const ref = document.querySelector(
        ".code-text-editor"
      ) as HTMLTextAreaElement;
      //const ref = editorRef.current;
      //ref.focus();
      //changeSpacesToTabs(textareaRef);

      const textareaShortcuts = [
        {
          shortcut: tab,
          action: () => {
            console.log("tab");
            console.log(ref);
            insertTab(ref);
            update(ref.value);
            // update(ref.value);
            console.log(ref);
            //Prism.highlightAll();
          },
        },
        {
          shortcut: shiftTab,
          action: () => {
            console.log("shiftTab");
            applyShiftTab(ref);
            update(ref.value);
            //Prism.highlightAll();
          },
        },
      ];
      addShortcuts(".code-text-editor", textareaShortcuts);
    }
  }, []);

  // Ensure editor scroll positions are the same, set gutter scroll to the editor scroll
  const textAreaScroll = (_e: React.UIEvent<HTMLElement>): void => {
    if (gutterRef.current && editorRef.current && codeBlockRef.current) {
      codeBlockRef.current.focus();
      editorRef.current.focus();
      gutterRef.current.focus();
      gutterRef.current.scrollTop = editorRef.current.scrollTop;
      codeBlockRef.current.scrollTop = editorRef.current.scrollTop;
      codeBlockRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  };

  // Ensure editor scroll positions are the same, set gutter scroll to the editor scroll
  const codeBlockScroll = (_e: React.UIEvent<HTMLElement>): void => {
    if (gutterRef.current && editorRef.current && codeBlockRef.current) {
      codeBlockRef.current.focus();
      editorRef.current.focus();
      gutterRef.current.focus();
      gutterRef.current.scrollTop = codeBlockRef.current.scrollTop;
      editorRef.current.scrollTop = codeBlockRef.current.scrollTop;
      editorRef.current.scrollLeft = codeBlockRef.current.scrollLeft;
    }
  };

  // Set the editor scroll positions to the gutter positions
  const gutterScroll = (_e: React.UIEvent<HTMLElement>): void => {
    if (gutterRef.current && editorRef.current && codeBlockRef.current) {
      codeBlockRef.current.focus();
      editorRef.current.focus();
      gutterRef.current.focus();
      gutterRef.current.scrollTop = editorRef.current.scrollTop;
    }
  };

  // Update the textarea and code text values, re-highlight the text in the code block
  const update = (text: string): void => {
    if (editorRef.current && codeBlockRef.current) {
      editorRef.current.focus();
      codeBlockRef.current.focus();

      editorRef.current.innerText = text;
      codeBlockRef.current.innerText = text;

      // editorRef.current.innerText = text;
      // codeBlockRef.current.innerText = text; //+ "\n\r\n\r";
      //console.log("set code block text to \n" + text);

      window.Prism = window.Prism || {};
      // Prism.highlightAll();
      Prism.highlight(
        editorRef.current.value,
        Prism.languages.javascript,
        "javascript"
      );
    }
  };

  return (
    <div
      className="editor-container"
      style={{ backgroundColor: `rgb(50, 50, 50, ${opacity})` }}
    >
      {/* line numbers */}
      <div className="editor-gutter-container padding">
        <div
          className="editor-gutter scroll-text-style"
          onScroll={gutterScroll}
          ref={gutterRef as React.RefObject<HTMLDivElement>}
        >
          {lineNumbers}
        </div>
      </div>

      {/* code area */}
      <div className="editor scroll-text-style">
        <textarea
          className="code-text-editor padding"
          onChange={onChange}
          onInput={() => update(value)}
          onScroll={textAreaScroll}
          spellCheck="false"
          ref={editorRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
        />
        <pre className="language-javascript scroll-text-style padding">
          <code
            className="padding"
            onScroll={codeBlockScroll}
            ref={codeBlockRef as React.RefObject<HTMLPreElement>}
          >
            {value}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default Editor;
