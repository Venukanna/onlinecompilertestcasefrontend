import { useState, useEffect } from "react";
import "../styles/CodeCompiler.css";
import ReactSandpackPlayground from "./ReactSandpackPlayground";

const LANGUAGES = [
  { id: "java", name: "Java", icon: "Ja" },
  { id: "python", name: "Python", icon: "Py" },
  { id: "c", name: "C", icon: "C" },
  { id: "cpp", name: "C++", icon: "C++" },
  { id: "javascript", name: "JavaScript", icon: "JS" },
  { id: "html", name: "HTML", icon: "HTML" },
  { id: "react", name: "React", icon: "⚛️" },
];

const REACT_FILES = {
  "App.js": `export default function App() {
  return <h1>Hello world</h1>
}`,
  "index.js": `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
createRoot(document.getElementById("root")).render(<App />);`,
  "package.json": `{
  "name": "react-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
  "styles.css": `.title {
  color: #2c3e50;
  text-align: center;
  font-family: Arial, sans-serif;
}`,
  "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>React Output</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
};

const REACT_FILE_ORDER = ["App.js", "index.js", "package.json", "styles.css", "index.html"];

const DEFAULT_CODES = {
  java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello world");
  }
}`,
  python: `print("Hello world")`,
  c: `#include <stdio.h>
int main() {
  printf("Hello world\\n");
  return 0;
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
  cout << "Hello world" << endl;
  return 0;
}`,
  javascript: `console.log("Hello world");`,
  html: `<!DOCTYPE html>
<html>
<head>
  <title>Hello, World!</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    .title {
      color: #2c3e50;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1 class="title">Hello World!</h1>
  <p id="currentTime"></p>
  <script>
    document.getElementById('currentTime').textContent =
      'Current time: ' + new Date().toLocaleTimeString();
  </script>
</body>
</html>`,
  react: REACT_FILES["App.js"],
};

export default function CodeCompiler() {
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(DEFAULT_CODES["java"]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("Your output will appear here...");
  const [theme, setTheme] = useState("light");
  const [activeFile, setActiveFile] = useState("App.js");
  const [isLoading, setIsLoading] = useState(false);
  const [htmlCode, setHtmlCode] = useState(DEFAULT_CODES["html"]);
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");
  const [reactFiles, setReactFiles] = useState({ ...REACT_FILES });
  const [displayedHtmlOutput, setDisplayedHtmlOutput] = useState("");
  const [testCases, setTestCases] = useState([{ id: 1, input: "", expected: "" }]);
  const [testResults, setTestResults] = useState([]);
  const [activeTab, setActiveTab] = useState("output");
  const [editorKey, setEditorKey] = useState(0); // Force re-render when language changes

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (language === "react") {
      setActiveFile("App.js");
      setReactFiles({ ...REACT_FILES });
      setCode(REACT_FILES["App.js"]);
    } else if (language === "html") {
      setActiveFile("html");
      setCode(htmlCode);
      const styleMatch = htmlCode.match(/<style>([\s\S]*?)<\/style>/);
      const scriptMatch = htmlCode.match(/<script>([\s\S]*?)<\/script>/);
      setCssCode(styleMatch ? styleMatch[1] : "");
      setJsCode(scriptMatch ? scriptMatch[1] : "");
      setDisplayedHtmlOutput("");
    } else {
      setActiveFile(language);
      setCode(DEFAULT_CODES[language]);
    }
    setOutput("Your output will appear here...");
    setTestResults([]);
    setEditorKey(prev => prev + 1); // Force editor re-render
  }, [language]);

  useEffect(() => {
    if (language === "react" && activeFile) {
      setCode(reactFiles[activeFile]);
    } else if (language === "html") {
      if (activeFile === "html") setCode(htmlCode);
      if (activeFile === "css") setCode(cssCode);
      if (activeFile === "js") setCode(jsCode);
    }
  }, [activeFile]);

  const detectLanguageMismatch = (code) => {
    const languagePatterns = {
      java: [
        /public\s+class\s+\w+\s*\{/,
        /public\s+static\s+void\s+main\s*\(String\s*(\[\s*\]\s+\w+|\[\s*\]\s*\[\s*\]\s+\w+)?\)/,
        /System\.(out|err)\.print/,
        /import\s+java\./
      ],
      python: [
        /^print\(/,
        /def\s+\w+\(/,
        /import\s+\w+/,
        /:\s*(#.*)?$/,
        /^\s{4}\w+/,
        /^[ \t]*\w+\s*=\s*[^;]+$/
      ],
      cpp: [
        /#include\s+<iostream>/,
        /using\s+namespace\s+std/,
        /cout\s*<</,
        /cin\s*>>/,
        /std::/
      ],
      c: [
        /#include\s+<stdio\.h>/,
        /printf\s*\(/,
        /scanf\s*\(/
      ],
      javascript: [
        /console\.log\(/,
        /function\s+\w+\(/,
        /=>/,
        /let\s+\w+/,
        /const\s+\w+/
      ]
    };

    if (language === "cpp") {
      const cppPatterns = languagePatterns["cpp"];
      const cPatterns = languagePatterns["c"];
      const isCpp = cppPatterns.some(p => p.test(code));
      const isC = cPatterns.some(p => p.test(code));

      // Allow mixed C-style in C++
      if (!isCpp && isC) {
        return "c"; // Only return if it’s *clearly* C and not mixed
      }
      return null;
    }

    for (const lang in languagePatterns) {
      if (lang === language) continue;
      if (languagePatterns[lang].some(pattern => pattern.test(code))) {
        return lang;
      }
    }
    return null;
  };

  const formatError = (error, lang) => {
    if (lang === "java") {
      if (error.includes("Main method not found in class")) {
        const classNameMatch = error.match(/Main method not found in class (\w+)/);
        const className = classNameMatch ? classNameMatch[1] : "YourClass";
        
        return `Error: Main method not found in class ${className}, please define the main method as:
   public static void main(String[] args)
or a JavaFX application class must extend javafx.application.Application

Example:
public class ${className} {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello, World!");
    }
}`;
      }
    }
    
    // General error formatting
    const lines = error.split('\n');
    let formattedError = "";
    
    for (const line of lines) {
      if (line.startsWith("error:")) {
        formattedError += `Error: ${line.substring(6).trim()}\n`;
      } else if (line.includes(`.${lang === "python" ? "py" : lang}:`)) {
        const parts = line.split(':');
        if (parts.length >= 3) {
          formattedError += `At ${parts[0]}, line ${parts[1]}:\n`;
        }
      } else {
        formattedError += `${line}\n`;
      }
    }
    
    return formattedError.trim();
  };

  const languageValidators = {
    java: code => {
      const mismatchedLang = detectLanguageMismatch(code);
      if (mismatchedLang) {
        return { 
          isValid: false, 
          message: `This looks like ${mismatchedLang} code. For Java, use:\n` +
                   `public class Main {\n` +
                   `  public static void main(String[] args) {\n` +
                   `    System.out.println("Hello");\n` +
                   `  }\n` +
                   `}`
        };
      }
      
      const hasClass = /class\s+\w+\s*\{/.test(code);
      const hasMainMethod = /public\s+static\s+void\s+main\s*\(String\s*(\[\s*\]\s+\w+|\[\s*\]\s*\[\s*\]\s+\w+)?\)/.test(code);
      
      if (!hasClass) {
        return { 
          isValid: false, 
          message: "Java requires a class definition:\n" +
                  "public class YourClassName {\n" +
                  "  // Your main method goes here\n" +
                  "}"
        };
      }
      if (!hasMainMethod) {
        return { 
          isValid: false, 
          message: "Java requires a main method:\n" +
                  "public static void main(String[] args) {\n" +
                  "  // Your code here\n" +
                  "}"
        };
      }
      return { isValid: true, message: "" };
    },
    python: code => {
      const mismatchedLang = detectLanguageMismatch(code);
      if (mismatchedLang) {
        return { 
          isValid: false, 
          message: `This looks like ${mismatchedLang} code. Python uses:\n` +
                   `- No semicolons\n` +
                   `- Indentation for blocks\n` +
                   `- print() function\n` +
                   `Example:\n` +
                   `print("Hello")\n` +
                   `if x > 5:\n` +
                   `    print("Greater")`
        };
      }
      
      const hasJavaLikeSyntax = /class\s+\w+|public\s+static\s+void\s+main|System\.out\.print/.test(code);
      const hasCSyntax = /#include|printf\s*\(|int\s+main\s*\(/.test(code);
      const hasJSSyntax = /function\s+\w+|console\.log|let\s+|const\s+|var\s+/.test(code);
      
      if (hasJavaLikeSyntax || hasCSyntax || hasJSSyntax) {
        return { 
          isValid: false, 
          message: "This doesn't look like Python code. Remember:\n" +
                  "- No curly braces {}\n" +
                  "- Indentation defines blocks\n" +
                  "- print() instead of console.log or System.out.println\n" +
                  "Example:\n" +
                  "name = input('Your name: ')\n" +
                  "print(f'Hello {name}')"
        };
      }
      
      return { isValid: true, message: "" };
    },
    c: code => {
      const mismatchedLang = detectLanguageMismatch(code);
      if (mismatchedLang) {
        return { 
          isValid: false, 
          message: `This looks like ${mismatchedLang} code. For C, use:\n` +
                   `#include <stdio.h>\n` +
                   `int main() {\n` +
                   `  printf("Hello\\n");\n` +
                   `  return 0;\n` +
                   `}`
        };
      }
      
      const hasInclude = /#include\s+<.*\.h>/.test(code);
      const hasMain = /int\s+main\s*\(/.test(code);
      
      if (!hasInclude) {
        return { 
          isValid: false, 
          message: "C programs need #include directives:\n" +
                  "#include <stdio.h>  // For input/output\n" +
                  "#include <math.h>   // For math functions"
        };
      }
      if (!hasMain) {
        return { 
          isValid: false, 
          message: "C programs need a main function:\n" +
                  "int main() {\n" +
                  "  // Your code here\n" +
                  "  return 0;\n" +
                  "}"
        };
      }
      return { isValid: true, message: "" };
    },
    cpp: code => {
      const mismatchedLang = detectLanguageMismatch(code);
      if (mismatchedLang && mismatchedLang !== "cpp") {
        return {
          isValid: false,
          message: `This looks like ${mismatchedLang} code. For C++, use:\n` +
                   `#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello";\n  return 0;\n}`
        };
      }
      const hasIostream = /#include\s*<iostream>/.test(code);
      const hasMain = /int\s+main\s*\(/.test(code);
      const usesCout = /cout\s*<</.test(code);

      if (!hasIostream || !hasMain || !usesCout) {
        return {
          isValid: true, // Allow more flexibility
          message: ""
        };
      }
      return { isValid: true, message: "" };
    },
    javascript: code => {
      const mismatchedLang = detectLanguageMismatch(code);
      if (mismatchedLang) {
        return { 
          isValid: false, 
          message: `This looks like ${mismatchedLang} code. JavaScript uses:\n` +
                   `- console.log() for output\n` +
                   `- let/const for variables\n` +
                   `- Functions like: function foo() { } or const foo = () => { }\n` +
                   `Example:\n` +
                   `const name = "World";\n` +
                   `console.log(\`Hello \${name}\`);`
        };
      }
      
      const hasJavaLikeSyntax = /System\.out\.print|public\s+class/.test(code);
      const hasPythonSyntax = /^print\(|def\s+\w+\(|:\s*$/.test(code);
      const hasCSyntax = /#include|printf\s*\(|int\s+main\s*\(/.test(code);
      
      if (hasJavaLikeSyntax || hasPythonSyntax || hasCSyntax) {
        return { 
          isValid: false, 
          message: "This doesn't look like JavaScript. Remember:\n" +
                  "- Use console.log() for output\n" +
                  "- Variables use let/const, not types\n" +
                  "- Functions use function keyword or arrow syntax\n" +
                  "Example:\n" +
                  "function greet(name) {\n" +
                  "  console.log(`Hello ${name}`);\n" +
                  "}\n" +
                  "greet('World');"
        };
      }
      
      return { isValid: true, message: "" };
    },
  };

  const handleReactFileChange = (val) => {
    setCode(val);
    setReactFiles(files => ({ ...files, [activeFile]: val }));
  };

  const handleHtmlFileChange = (val) => {
    if (activeFile === "html") setHtmlCode(val);
    if (activeFile === "css") setCssCode(val);
    if (activeFile === "js") setJsCode(val);
    setCode(val);
  };

  const getHtmlOutput = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Output</title>
  <style>${cssCode}</style>
</head>
<body>
  ${htmlCode.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '')}
  <script>
    try {
      ${jsCode}
    } catch (error) {
      console.error(error);
      document.body.innerHTML += '<div style="color: red;">Error: ' + error.message + '</div>';
    }
  </script>
</body>
</html>`;
  };

  const handleRun = async () => {
    setIsLoading(true);
    setOutput("Running...");
    setTestResults([]);
    setActiveTab("output");

    if (languageValidators[language]) {
      const validation = languageValidators[language](code);
      if (!validation.isValid) {
        setOutput(validation.message);
        setIsLoading(false);
        return;
      }
    }

    if (language === "html") {
      setDisplayedHtmlOutput(getHtmlOutput());
      setIsLoading(false);
      setOutput("HTML rendered successfully");
      return;
    }

    if (language === "react") {
      setIsLoading(false);
      setOutput("React code saved. Preview updating...");
      return;
    }

    try {
      const cleanedInput = input
        .split(/\r?\n/)
        .map(line => line.trim())
        .join("\n");
      const res = await fetch("https://onlinecompilertestcasebackend.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, input: cleanedInput }),
      });
      const data = await res.json();
      
      if (data.error) {
        setOutput(formatError(data.error, language));
      } else {
        setOutput(data.output || data.result || "No output");
      }
    } catch (err) {
      setOutput("Connection error: " + err.message);
    }
    setIsLoading(false);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { 
      id: Date.now(), 
      input: "", 
      expected: "" 
    }]);
  };

  const updateTestCase = (id, field, value) => {
    setTestCases(testCases.map(tc => 
      tc.id === id ? { ...tc, [field]: value } : tc
    ));
  };

  const removeTestCase = (id) => {
    setTestCases(testCases.filter(tc => tc.id !== id));
  };

  const runTestCases = async () => {
    if (!testCases.some(tc => tc.input.trim())) {
      setTestResults([]);
      setActiveTab("output");
      setOutput("No test cases with input provided");
      return;
    }
    
    setIsLoading(true);
    setTestResults([]);
    setActiveTab("testCases");
    
    const results = [];
    
    for (const testCase of testCases) {
      if (!testCase.input.trim()) continue;
      
      try {
        const res = await fetch("http://localhost:1234/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            language, 
            code, 
            input: testCase.input 
          }),
        });
        
        const data = await res.json();
        const actualOutput = data.error ? data.error : data.output || data.result || "No output";
        
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: actualOutput,
          status: testCase.expected ? 
            (actualOutput.trim() === testCase.expected.trim() ? "pass" : "fail") 
            : "no-expected"
        });
      } catch (err) {
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: "Connection error: " + err.message,
          status: "error"
        });
      }
    }
    
    setTestResults(results);
    setIsLoading(false);
  };

  const sandpackFiles = {
    "/App.js": reactFiles["App.js"],
    "/index.js": reactFiles["index.js"],
    "/package.json": reactFiles["package.json"],
    "/styles.css": reactFiles["styles.css"],
    "/index.html": reactFiles["index.html"],
  };

  const renderOutputSection = () => {
    if (language === "react") {
      return <ReactSandpackPlayground files={sandpackFiles} />;
    }
    
    if (language === "html") {
      return displayedHtmlOutput ? (
        <iframe 
          className="html-output" 
          srcDoc={displayedHtmlOutput} 
          title="HTML Output" 
          sandbox="allow-scripts allow-modals allow-forms"
          style={{ border: 'none', width: '100%', height: '100%', backgroundColor: 'white' }}
        />
      ) : (
        <div className="output-placeholder">
          Click "Run" to execute your HTML code
        </div>
      );
    }
    
    return (
      <div className="output-tabs">
        <div className="tab-buttons">
          <button 
            className={activeTab === "output" ? "active" : ""}
            onClick={() => setActiveTab("output")}
          >
            Output
          </button>
          <button 
            className={activeTab === "testCases" ? "active" : ""}
            onClick={() => setActiveTab("testCases")}
          >
            Test Cases
          </button>
        </div>
        
        {activeTab === "output" ? (
          <pre className={`output-area ${output.startsWith("Error:") || output.includes("requires") ? "error" : ""}`}>
            {output}
          </pre>
        ) : (
          <div className="test-cases-container">
            <div className="test-cases-actions">
              <button 
                onClick={runTestCases} 
                disabled={isLoading || !testCases.some(tc => tc.input.trim())}
                className={isLoading ? "loading" : ""}
              >
                {isLoading ? "Running..." : "Run All Test Cases"}
              </button>
            </div>
            
            <div className="test-cases-list">
              {testCases.map((testCase) => (
                <div key={testCase.id} className="test-case">
                  <div className="test-case-input">
                    <label>Input</label>
                    <textarea
                      value={testCase.input}
                      onChange={(e) => updateTestCase(testCase.id, "input", e.target.value)}
                      placeholder="Enter input (stdin)"
                    />
                  </div>
                  <div className="test-case-expected">
                    <label>Expected Output (optional)</label>
                    <textarea
                      value={testCase.expected}
                      onChange={(e) => updateTestCase(testCase.id, "expected", e.target.value)}
                      placeholder="Enter expected output"
                    />
                  </div>
                  <button 
                    className="remove-test-case"
                    onClick={() => removeTestCase(testCase.id)}
                    disabled={testCases.length <= 1}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <button className="add-test-case" onClick={addTestCase}>
                + Add Test Case
              </button>
            </div>
            
            {testResults.length > 0 && (
              <div className="test-results">
                <h4>Test Results</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Input</th>
                      <th>Expected</th>
                      <th>Actual</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((result, index) => (
                      <tr key={index}>
                        <td className="input-cell">{result.input}</td>
                        <td className="expected-cell">{result.expected || "-"}</td>
                        <td className={`actual-cell ${result.status === "pass" ? "success" : 
                                         result.status === "fail" ? "fail" : 
                                         result.status === "error" ? "error" : ""}`}>
                          {result.actual}
                        </td>
                        <td className="status-cell">
                          {result.status === "pass" ? (
                            <span className="status-pass">✅ Pass</span>
                          ) : result.status === "fail" ? (
                            <span className="status-fail">❌ Fail</span>
                          ) : result.status === "error" ? (
                            <span className="status-error">⚠️ Error</span>
                          ) : (
                            <span className="status-no-expected">↗️ No Expected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="compiler-main">
      <aside className="sidebar">
        <div className="sidebar-title">Files</div>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            className={`sidebar-btn${language === lang.id ? " active" : ""}`}
            onClick={() => setLanguage(lang.id)}
            title={lang.name}
          >
            {lang.icon}
          </button>
        ))}
      </aside>

      <section className="editor-section">
        {language === "react" && (
          <div className="file-tabs">
            {REACT_FILE_ORDER.map((file) => (
              <div
                key={file}
                className={`file-tab${activeFile === file ? " active" : ""}`}
                onClick={() => { setActiveFile(file); setCode(reactFiles[file]); }}
              >
                {file}
              </div>
            ))}
          </div>
        )}
        {language === "html" && (
          <div className="file-tabs">
            {["html", "css", "js"].map((file) => (
              <div
                key={file}
                className={`file-tab${activeFile === file ? " active" : ""}`}
                onClick={() => setActiveFile(file)}
              >
                {file === "html" ? "index.html" : file === "css" ? "styles.css" : "script.js"}
              </div>
            ))}
          </div>
        )}
        {language !== "react" && language !== "html" && (
          <div className="file-tab single">{language.toUpperCase()}</div>
        )}

        {language === "react" ? (
          <textarea 
            key={`react-editor-${editorKey}`}
            className="code-editor" 
            value={code} 
            onChange={e => handleReactFileChange(e.target.value)} 
            spellCheck={false} 
          />
        ) : language === "html" ? (
          activeFile === "html" ? (
            <textarea 
              key={`html-editor-${editorKey}`}
              className="code-editor" 
              value={htmlCode} 
              onChange={e => handleHtmlFileChange(e.target.value)} 
              spellCheck={false} 
            />
          ) : activeFile === "css" ? (
            <textarea 
              key={`css-editor-${editorKey}`}
              className="code-editor" 
              value={cssCode} 
              onChange={e => handleHtmlFileChange(e.target.value)} 
              spellCheck={false} 
            />
          ) : (
            <textarea 
              key={`js-editor-${editorKey}`}
              className="code-editor" 
              value={jsCode} 
              onChange={e => handleHtmlFileChange(e.target.value)} 
              spellCheck={false} 
            />
          )
        ) : (
          <textarea 
            key={`${language}-editor-${editorKey}`}
            className="code-editor" 
            value={code} 
            onChange={e => setCode(e.target.value)} 
            spellCheck={false} 
          />
        )}

        {language !== "html" && language !== "react" && (
          <div className="input-container">
            <textarea
              placeholder="Optional stdin input (separate multiple inputs by newlines)..."
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={4}
              spellCheck={false}
            />
          </div>
        )}

        <div className="editor-actions">
          <button onClick={handleRun} disabled={isLoading}>
            {isLoading ? "Running..." : "Run"}
          </button>
          <button className="theme-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </section>

      <section className="output-section">
        <div className="output-title">Output</div>
        <div className="output-container">
          {renderOutputSection()}
        </div>
      </section>
    </div>
  );
}
