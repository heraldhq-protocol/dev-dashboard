"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] rounded-lg">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal" />
    </div>
  ),
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  placeholder?: string;
  readOnly?: boolean;
}

// Track whether we've registered the completion provider globally.
// Monaco is a singleton — re-registering on every mount causes duplicates.
let completionProviderRegistered = false;

export function CodeEditor({
  value,
  onChange,
  language = "html",
  height = "400px",
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    if (!completionProviderRegistered) {
      completionProviderRegistered = true;
      monaco.languages.registerCompletionItemProvider("html", {
        triggerCharacters: ["{"],
        provideCompletionItems: () => ({
          suggestions: [
            "protocolName",
            "subject",
            "body",
            "actionUrl",
            "actionLabel",
            "unsubscribeUrl",
            "walletAddress",
          ].map((v) => ({
            label: `{{${v}}}`,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: `{{${v}}}`,
            documentation: `Herald template variable: ${v}`,
          })),
        }),
      });
    }

    editor.updateOptions({
      tabSize: 2,
      insertSpaces: true,
      wordWrap: "on",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: "on",
      renderLineHighlight: "gutter",
      folding: true,
      autoClosingBrackets: "always",
      autoClosingQuotes: "always",
      formatOnPaste: true,
      suggest: {
        showSnippets: true,
        showKeywords: true,
      },
    });
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e1e1e] border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="text-[11px] text-white/30 font-mono uppercase tracking-widest">
          {language}
        </span>
        <button
          className="text-[11px] text-white/30 hover:text-white/70 transition-colors"
          onClick={() => editorRef.current?.getAction("editor.action.formatDocument")?.run()}
          title="Format code (Alt+Shift+F)"
        >
          Format
        </button>
      </div>
      <MonacoEditor
        height={height}
        language={language}
        value={value}
        theme="vs-dark"
        onChange={(v) => onChange(v ?? "")}
        onMount={handleMount}
        options={{
          readOnly,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: "on",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          renderLineHighlight: "gutter",
          folding: true,
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          formatOnPaste: true,
          fontSize: 13,
          fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace",
          fontLigatures: true,
          padding: { top: 12, bottom: 12 },
          overviewRulerLanes: 0,
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />
    </div>
  );
}
