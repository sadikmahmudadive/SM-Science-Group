"use client";

import { useState, useCallback } from "react";
import { Bold, Italic, List, Link2, Heading2 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [, setIsFocused] = useState(false);

  const applyFormat = useCallback((format: string) => {
    const textarea = document.getElementById("rich-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || "text";
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    let newText = value;

    switch (format) {
      case "bold":
        newText = beforeText + `**${selectedText}**` + afterText;
        break;
      case "italic":
        newText = beforeText + `*${selectedText}*` + afterText;
        break;
      case "heading":
        newText = beforeText + `\n## ${selectedText}\n` + afterText;
        break;
      case "link":
        newText = beforeText + `[${selectedText}](url)` + afterText;
        break;
      case "list":
        newText = beforeText + `\n- ${selectedText}\n` + afterText;
        break;
    }

    onChange(newText);

    // Move cursor after the inserted text
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + newText.length - value.length + selectedText.length;
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  const formatMarkdownToHTML = (markdown: string): string => {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^## (.*?)$/gm, "<h2 style='font-size:1.5rem;font-weight:bold;margin:0.5rem 0'>$1</h2>")
      .replace(/^- (.*?)$/gm, "<li>$1</li>")
      .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' style='color:#4f46e5;text-decoration:underline'>$1</a>")
        .replace(/(<li>[\s\S]*?<\/li>)/, "<ul style='padding-left:1.5rem'>$1</ul>");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 bg-slate-50 p-2 rounded-t-lg border border-b-0 border-slate-200">
        <button
          type="button"
          onClick={() => applyFormat("bold")}
          className="p-2 hover:bg-slate-200 rounded transition-colors text-slate-600 hover:text-slate-900"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("italic")}
          className="p-2 hover:bg-slate-200 rounded transition-colors text-slate-600 hover:text-slate-900"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("heading")}
          className="p-2 hover:bg-slate-200 rounded transition-colors text-slate-600 hover:text-slate-900"
          title="Heading"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("list")}
          className="p-2 hover:bg-slate-200 rounded transition-colors text-slate-600 hover:text-slate-900"
          title="List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("link")}
          className="p-2 hover:bg-slate-200 rounded transition-colors text-slate-600 hover:text-slate-900"
          title="Link"
        >
          <Link2 className="w-4 h-4" />
        </button>
      </div>

      <textarea
        id="rich-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder || "Share your message here..."}
        rows={6}
        className="w-full px-4 py-3 border border-slate-200 rounded-b-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium resize-none"
      />

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Preview:</p>
        <div
          className="text-sm text-slate-700 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: formatMarkdownToHTML(value) }}
        />
      </div>
    </div>
  );
}
