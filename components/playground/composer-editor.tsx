import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { VariableChipNode } from './variable-chip';
import { useComposerStore } from '@/hooks/use-composer-store';
import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/Button';
import { Bold, Italic, Code as CodeIcon, List, ListOrdered, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Command palette for variables
const VariableList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="bg-popover border border-border rounded-md shadow-md overflow-hidden min-w-[200px]">
      <Command>
        <CommandInput placeholder="Search variables..." className="h-9 text-xs" />
        <CommandList>
          <CommandEmpty>No variables found.</CommandEmpty>
          <CommandGroup heading="Available Variables">
            {props.items.map((item: string, index: number) => (
              <CommandItem
                key={item}
                onSelect={() => selectItem(index)}
                className={`text-xs ${index === selectedIndex ? "bg-accent text-accent-foreground" : ""}`}
              >
                {`{{${item}}}`}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
});
VariableList.displayName = "VariableList";

// Suggestion plugin configuration
// import { PluginKey } from '@tiptap/pm/state';
import { useState } from 'react';

const mentionSuggestion = (availableKeys: string[]) => ({
  char: '{{',
  items: ({ query }: { query: string }) => {
    return availableKeys.filter(item => item.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10);
  },
  render: () => {
    let component: any;
    let popup: any;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(VariableList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },
      onUpdate(props: any) {
        component.updateProps(props);
        if (!props.clientRect) {
          return;
        }
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },
      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }
        return component.ref?.onKeyDown(props);
      },
      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
});

export function ComposerEditor() {
  const { activeChannel, emailContent, telegramContent, smsContent, setContent, emailSubject, setEmailSubject, testData } = useComposerStore();

  const availableVariables = Object.keys(testData).length > 0 ? Object.keys(testData) : ["name", "order_id", "date", "amount"];

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      VariableChipNode,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: mentionSuggestion(availableVariables),
      }),
    ],
    content: activeChannel === "email" ? emailContent : activeChannel === "telegram" ? telegramContent : smsContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(activeChannel, html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none min-h-[300px] max-w-none p-4',
      },
    },
  }, [activeChannel]); // Re-create editor when channel changes to reset content properly

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-bl-lg">
      {/* Channel specific top bar */}
      {activeChannel === "email" && (
        <div className="border-b border-border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted w-12 shrink-0">Subject</span>
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Enter subject line..."
              className="bg-card-2 border-border h-8 text-sm flex-1"
            />
            <span className="text-[10px] text-text-muted shrink-0 w-8 text-right">
              {emailSubject.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted w-12 shrink-0">From</span>
            <Input value="notifications@yourdomain.com" disabled className="bg-card-2/50 border-border h-8 text-xs flex-1 text-text-muted" />
          </div>
        </div>
      )}
      
      {activeChannel === "sms" && (
        <div className="border-b border-border p-3 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-500/80 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              SMS messages are sent as plain text. Formatting will be stripped.
            </span>
          </div>
        </div>
      )}

      {/* Editor Toolbar */}
      <div className="flex items-center flex-wrap gap-1 border-b border-border p-2 bg-card-2/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-primary/20 text-primary' : 'text-text-muted'}`}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-primary/20 text-primary' : 'text-text-muted'}`}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`h-8 w-8 ${editor.isActive('code') ? 'bg-primary/20 text-primary' : 'text-text-muted'}`}
        >
          <CodeIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 w-8 ${editor.isActive('bulletList') ? 'bg-primary/20 text-primary' : 'text-text-muted'}`}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 w-8 ${editor.isActive('orderedList') ? 'bg-primary/20 text-primary' : 'text-text-muted'}`}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().insertContent('{{').run()}
          className="h-8 text-xs gap-1.5 text-text-muted hover:text-amber-500 hover:bg-amber-500/10"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Insert Variable
        </Button>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto cursor-text" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* Bottom Quick Bar */}
      <div className="border-t border-border p-3 flex items-center justify-between bg-card-2/30">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mr-1 shrink-0">Variables:</span>
          {availableVariables.slice(0, 4).map((v) => (
            <button
              key={v}
              onClick={() => editor.chain().focus().insertContent(`{{${v}}}`).run()}
              className="shrink-0 px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-md text-[10px] font-mono font-bold transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
