import "../assets/consoleOutput.css";

import Button from "@mui/material/Button";
import { useState } from "react";

interface ConsoleOutputProps {
  messages: string;
}

const ConsoleOutput = ({ messages }: ConsoleOutputProps) => {
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
        className="view-console-button"
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

export default ConsoleOutput;
