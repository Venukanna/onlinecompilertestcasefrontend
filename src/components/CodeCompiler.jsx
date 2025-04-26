import { useState, useEffect } from "react";
import "../styles/CodeCompiler.css"; // Assuming you have a CSS file for styles

const LANGUAGES = [
  { id: 50, name: "C", icon: "C" },
  { id: 54, name: "C++", icon: "C++" },
  { id: 71, name: "Python", icon: "Py" },
  { id: 62, name: "Java", icon: "Ja" },
  { id: 63, name: "JavaScript", icon: "JS" },
  { id: 1, name: "HTML", icon: "HTML" },
];

export default function CodeCompiler() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(62); // Default to Java
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [theme, setTheme] = useState("light");
  const [outputStatus, setOutputStatus] = useState("idle");
  const [token, setToken] = useState("");
  const [activeFile, setActiveFile] = useState("html");
  const [isLoading, setIsLoading] = useState(false);
  const [htmlCode, setHtmlCode] = useState(
    `<!DOCTYPE html>
<html>
<head>
  <title>Hello, World!</title>
  <style>
    /* CSS will be inserted here */
  </style>
</head>
<body>
  <h1 class="title">Hello World!</h1>
  <p id="currentTime"></p>
  <script>
    // JS will be inserted here
  </script>
</body>
</html>`
  );
  const [cssCode, setCssCode] = useState(
    `.title {
  color: #2c3e50;
  text-align: center;
  font-family: Arial, sans-serif;
}`
  );
  const [jsCode, setJsCode] = useState(
    `document.getElementById('currentTime').textContent = 
  'Current time: ' + new Date().toLocaleTimeString();`
  );
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // Updated language code structure validation rules
  const languageValidators = {
    62: code => {
      const hasMainClass = /class\s+Main\s*\{/.test(code);
      const hasMainMethod = /public\s+static\s+void\s+main\s*\(/.test(code);
      
      if (!hasMainClass) {
        return {
          isValid: false,
          message: "Hey! For Java code to run properly, please use 'Main' as your class name. Like this: 'public class Main { ... }'"
        };
      }
      if (!hasMainMethod) {
        return {
          isValid: false,
          message: "Don't forget to add the main method! Include this in your Main class: 'public static void main(String[] args) { ... }'"
        };
      }
      return { isValid: true, message: "" };
    },
    71: code => {
      const isValid = /def\s+\w+|print\(|import\s+/.test(code) && !/class\s+\w+|public\s+static\s+void\s+main/.test(code);
      return {
        isValid,
        message: isValid ? "" : "This doesn't look like Python code. Try using Python syntax like 'print()', 'def', or 'import' statements."
      };
    }, // Python
    54: code => {
      const isValid = /#include\s+<|int\s+main\s*\(\)/.test(code) && !/std::/.test(code);
      return {
        isValid,
        message: isValid ? "" : "This doesn't look like C++ code. Try using C++ syntax like '#include' or 'int main()'."
      };
    }, // C++
    50: code => {
      const isValid = /#include\s+<|int\s+main\s*\(\)/.test(code) && !/std::/.test(code);
      return {
        isValid,
        message: isValid ? "" : "This doesn't look like C code. Try using C syntax like '#include' or 'int main()'."
      };
    }, // C
    63: code => {
      const isValid = /function\s+\w+|console\.log|let\s+|const\s+|var\s+/.test(code);
      return {
        isValid,
        message: isValid ? "" : "This doesn't look like JavaScript code. Try using JavaScript syntax like 'function', 'console.log', or 'let/const/var'."
      };
    }, // JavaScript
  };

  // Real-time validation effect
  useEffect(() => {
    if (language === 1) {
      setValidationError("");
      return;
    }
    if (!code.trim()) {
      setValidationError("");
      return;
    }
    const validator = languageValidators[language];
    if (validator) {
      const result = validator(code);
      if (!result.isValid) {
        setValidationError(result.message);
      } else {
        setValidationError("");
      }
    } else {
      setValidationError("This language is not supported. Please select a supported language from the dropdown.");
    }
  }, [code, language]);

  const submitCode = async () => {
    if (validationError) {
      setOutput(validationError);
      setOutputStatus("error");
      return;
    }
    if (language === 1) {
      try {
        setOutputStatus("running");
        setIsLoading(true);
        setOutput("Running HTML code...");

        // Create a complete HTML document with proper script and style tags
        const fullHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Profile Card</title>
            <style>
              ${cssCode}
            </style>
          </head>
          <body>
            ${htmlCode}
            <script>
              ${jsCode}
            </script>
          </body>
          </html>
        `;

        setOutput(fullHtml);
        setOutputStatus("success");
      } catch (error) {
        setOutput(`Error: ${error.message}`);
        setOutputStatus("error");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      setOutputStatus("running");
      setIsLoading(true);
      setOutput("Submitting your code...");

      // Check if code matches the selected language
      const validator = languageValidators[language];
      if (validator) {
        const result = validator(code);
        if (!result.isValid) {
          setOutput(result.message || "Code does not match the selected language. Please check your code and try again.");
          setOutputStatus("error");
          setIsLoading(false);
          return;
        }
      }

      // Use the code as-is without wrapping in Main class
      const codeToSubmit = code;

      // UTF-8 encode the source code before base64 encoding
      const utf8Encode = (str) => {
        try {
          return new TextEncoder().encode(str); // Modern browsers
        } catch (e) {
          return new TextEncoderLite().encode(str); // Fallback for older browsers
        }
      };

      const encodedCode = btoa(String.fromCharCode.apply(null, [...utf8Encode(codeToSubmit)]));

      const request = {
        source_code: encodedCode,
        language_id: language,
        stdin: btoa(input),
      };

      const response = await fetch("http://localhost:1234/api/judge0/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.token) {
        throw new Error("No submission token received");
      }

      setToken(data.token);
      setOutput("Code submitted. Processing...");
      await checkResult(data.token);
    } catch (error) {
      console.error("Submission error:", error);
      setOutput(`Error: ${error.message}`);
      setOutputStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const checkResult = async (token) => {
    try {
      let result;
      let attempts = 0;
      const maxAttempts = 15;
      const delay = 2000;

      while (attempts < maxAttempts) {
        const response = await fetch(
          `http://localhost:1234/api/judge0/result/${token}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} when checking result`);
        }

        result = await response.json();
        console.log("Polling result:", result);

        // Safely extract output from any possible field
        const getOutputText = () => {
          if (!result) return "No result received";

          // Check all possible output fields
          const outputSources = [
            result.stdout,
            result.stderr,
            result.compile_output,
            result.message,
            result.status?.description
          ];

          // Find the first non-empty output
          const output = outputSources.find(text => text && text.trim().length > 0);

          // Handle base64 decoding if needed
          if (output) {
            try {
              // Attempt to decode the output using decodeURIComponent and escape
              return decodeURIComponent(escape(window.atob(output)));
            } catch (e) {
              // If decoding fails, return the original output
              console.error("Base64 decoding error:", e);
              return output;
            }
          }

          return "No output available";
        };

        const outputText = getOutputText();

        // Check if execution is complete
        if (result.status?.id > 2 || outputText !== "No output available") {
          setOutput(outputText);
          setOutputStatus(result.status?.id === 3 ? "success" : "error");
          return;
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      setOutput("Execution timed out after 30 seconds");
      setOutputStatus("error");
    } catch (error) {
      console.error("Result check error:", error);
      setOutput(`Error: ${error.message}`);
      setOutputStatus("error");
    }
  };

  const clearOutput = () => {
    setOutput("");
    setOutputStatus("idle");
  };

  const renderEditor = () => {
    if (language !== 1) {
      return (
        <textarea
          placeholder={`// Write your ${
            LANGUAGES.find((l) => l.id === language)?.name || ""
          } code here...\n${language === 62 ? 'public class YourClassName {\n    public static void main(String[] args) {\n        \n    }\n}' : ''}`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
        />
      );
    }

    switch (activeFile) {
      case "html":
        return (
          <textarea
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            spellCheck="false"
            placeholder="<!DOCTYPE html>
<html>
<head>
  <title>Your Page</title>
</head>
<body>
  <!-- Your HTML content here -->
</body>
</html>"
          />
        );
      case "css":
        return (
          <textarea
            value={cssCode}
            onChange={(e) => setCssCode(e.target.value)}
            spellCheck="false"
            placeholder="/* Your CSS styles here */
body {
  /* Example styles */
}"
          />
        );
      case "js":
        return (
          <textarea
            value={jsCode}
            onChange={(e) => setJsCode(e.target.value)}
            spellCheck="false"
            placeholder="// Your JavaScript code here
function example() {
  // Example function
}"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="code-compiler">
      <div className="sidebar">
        {LANGUAGES.map((lang) => (
          <div
            key={lang.id}
            className={`sidebar-item ${language === lang.id ? "active" : ""}`}
            onClick={() => {
              setLanguage(lang.id);
              if (lang.id === 1) setActiveFile("html");
            }}
            title={lang.name}
          >
            {lang.icon}
          </div>
        ))}
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Excelr Code Compiler</h1>
          <div className="theme-switch">
            <button
              className={theme === "light" ? "active" : ""}
              onClick={() => toggleTheme("light")}
            >
              Light
            </button>
            <button
              className={theme === "dark" ? "active" : ""}
              onClick={() => toggleTheme("dark")}
            >
              Dark
            </button>
          </div>
        </div>

        <div className="toolbar">
          <div className="language-select">
            <select
              value={language}
              onChange={(e) => {
                const newLang = parseInt(e.target.value);
                setLanguage(newLang);
                if (newLang === 1) setActiveFile("html");
              }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          {language === 1 && (
            <div className="file-tabs">
              <button
                className={activeFile === "html" ? "active" : ""}
                onClick={() => setActiveFile("html")}
              >
                index.html
              </button>
              <button
                className={activeFile === "css" ? "active" : ""}
                onClick={() => setActiveFile("css")}
              >
                styles.css
              </button>
              <button
                className={activeFile === "js" ? "active" : ""}
                onClick={() => setActiveFile("js")}
              >
                script.js
              </button>
            </div>
          )}
          <button
            className="run-button"
            onClick={submitCode}
            disabled={isLoading || !!validationError}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <span>▶</span>
            )}
            Run Code
          </button>
        </div>

        <div className="workspace-container">
          <div className="editor-container">
            <div className="section-header">
              <span>
                {language === 1
                  ? `Editor (${activeFile})`
                  : "Editor"}
              </span>
            </div>
            <div className="code-editor">
              {renderEditor()}
              {language !== 1 && (
                <div className="input-section">
                  <h4>Input (stdin):</h4>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter program input here..."
                  />
                </div>
              )}
            </div>
          </div>

          <div className="output-container">
            <div className="section-header">
              <span>Output</span>
              <button className="clear-button" onClick={clearOutput}>
                Clear
              </button>
            </div>
            <div className="output-content">
              {validationError ? (
                <pre className="output-pre error">{validationError}</pre>
              ) : isLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Processing your code...</p>
                </div>
              ) : language === 1 && output ? (
                <iframe
                  title="output"
                  srcDoc={output}
                  sandbox="allow-scripts"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    backgroundColor: "white",
                  }}
                />
              ) : (
                <pre className={`output-pre ${outputStatus}`}>
                  {output || "Your code output will appear here..."}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// A simple TextEncoder fallback for older browsers (Safari)
class TextEncoderLite {
  encode(string) {
    let utftext = [];
    for (let n = 0; n < string.length; n++) {
      let charcode = string.charCodeAt(n);
      if (charcode < 128) {
        utftext.push(charcode);
      } else if ((charcode > 127) && (charcode < 2048)) {
        utftext.push((charcode >> 6) | 192);
        utftext.push((charcode & 63) | 128);
      } else {
        utftext.push((charcode >> 12) | 224);
        utftext.push(((charcode >> 6) & 63) | 128);
        utftext.push((charcode & 63) | 128);
      }
    }
    return utftext;
  }
}