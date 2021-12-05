import { RenderLogger } from "../objects/RenderLogger";
import ConsoleOutput from "./ConsoleOutput";
import Editor from "./Editor";
import HelpBanner from "./HelpBanner";

interface CodeEditorProps {
  helpBoxVisible: boolean;
  editorOpacity: number;
  editorWidth: string;
  toggleHelpVisible: () => void;
  code: string;
  setCode: (code: string) => void;
  renderLogger: RenderLogger;
}

const CodeEditor = ({
  helpBoxVisible,
  editorOpacity,
  editorWidth,
  toggleHelpVisible,
  code,
  setCode,
  renderLogger,
}: CodeEditorProps) => (
  <div className="editors">
    {helpBoxVisible ? (
      <HelpBanner
        opacity={editorOpacity}
        toggleVisibility={toggleHelpVisible}
      />
    ) : (
      <></>
    )}
    <div style={{ height: "100%", width: editorWidth, float: "right" }}>
      <Editor
        value={code}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setCode(e.target.value);
        }}
        opacity={editorOpacity}
      />
      <ConsoleOutput messages={renderLogger.getMessages()} />
    </div>
  </div>
);

export default CodeEditor;
