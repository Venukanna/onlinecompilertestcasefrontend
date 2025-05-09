// This file is part of the React Sandpack Playground component.
import { Sandpack } from "@codesandbox/sandpack-react";
import "../styles/ReactSandpackPlayground.css";

export default function ReactSandpackPlayground({ files }) {
  return (
    <div className="sandpack-container">
      <Sandpack
        template="react"
        files={files}
        options={{
          showTabs: false,
          showLineNumbers: true,
          showConsole: true,
          wrapContent: false,
          editorHeight: 650,
          editorWidthPercentage: 0,
          editorHeightPercentage: 50,
          showNavigator: false,
          showPreview: true, // Keep preview visible
          consoleShowHeader: false, // Disable default header
        }}
        customSetup={{
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0"
          }
        }}
      />
      <div className="console-title">Console</div>
    </div>
  );
}


