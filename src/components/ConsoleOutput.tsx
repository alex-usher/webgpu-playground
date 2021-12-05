import "../assets/consoleOutput.css";

import Button from "@mui/material/Button";
import { useEffect, useRef, useState } from "react";

import KeyboardShortcut from "../utils/keyboardShortcuts";
import { addShortcuts } from "../utils/shortcutListener";

interface ConsoleOutputProps {
  messages: string;
}

export const ConsoleOutput = ({ messages }: ConsoleOutputProps) => {
  const viewConsoleRef = useRef(true);
  const [viewConsole, setViewConsole] = useState(viewConsoleRef.current);

  useEffect(() => {
    const shortcuts = [
      {
        shortcut: new KeyboardShortcut("E", false, false, true),
        action: () => {
          toggleViewConsole();
        },
      },
    ];
    addShortcuts("*", shortcuts);
  }, []);

  const toggleViewConsole = () => {
    viewConsoleRef.current = !viewConsoleRef.current;
    setViewConsole(viewConsoleRef.current);
  };

  return (
    <div
      className="view-console"
      style={
        viewConsole
          ? {
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: "1em",
            }
          : {}
      }
    >
      <Button
        variant="outlined"
        className="view-console-button"
        onClick={toggleViewConsole}
      >
        {viewConsole ? "Hide Console" : "View Console"}
      </Button>
      {viewConsole ? (
        <div>
          <textarea
            className="editor-console-area"
            disabled={true}
            value={messages}
            spellCheck={false}
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ConsoleOutput;
