import { useState } from "react";
import Button from "@mui/material/Button";

import "../assets/consoleOutput.css";

interface ConsoleOutputProps {
  messages: string;
}

export const ConsoleOutput = ({ messages }: ConsoleOutputProps) => {
  const [viewConsole, setViewConsole] = useState(true);

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
        id="view-console-button"
        onClick={() => setViewConsole(!viewConsole)}
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
