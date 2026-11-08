import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
} from "react";
import { text } from "../i18n";
import { DEFAULT_LINK_PROTOCOL, DEFAULT_LINK_SCHEME } from "../lib/constants";
import { normalizeLinkHref } from "../lib/rich-text";
import { KEYBOARD_KEY, RICH_TEXT_HEADING } from "./constants";
import {
  BoldIcon,
  BulletListIcon,
  HeadingThreeIcon,
  HeadingTwoIcon,
  ItalicIcon,
  LinkIcon,
  NumberedListIcon,
  RedoIcon,
  UndoIcon,
  type IconProps,
} from "./icons";
import { Button } from "./ui";

const EXTENSIONS = [
  StarterKit.configure({
    heading: {
      levels: [RICH_TEXT_HEADING.SECTION, RICH_TEXT_HEADING.SUBSECTION],
    },
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    underline: false,
    gapcursor: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: DEFAULT_LINK_PROTOCOL,
      HTMLAttributes: { target: null, rel: null },
    },
  }),
];

interface Tool {
  label: string;
  Icon: ComponentType<IconProps>;
  isActive?: (editor: Editor) => boolean;
  isEnabled?: (editor: Editor) => boolean;
  run?: (editor: Editor) => void;
  separatorBefore?: boolean;
}

const TOOLS: Tool[] = [
  {
    label: text.richText.heading,
    Icon: HeadingTwoIcon,
    isActive: (editor) =>
      editor.isActive("heading", { level: RICH_TEXT_HEADING.SECTION }),
    run: (editor) =>
      editor
        .chain()
        .focus()
        .toggleHeading({ level: RICH_TEXT_HEADING.SECTION })
        .run(),
  },
  {
    label: text.richText.subheading,
    Icon: HeadingThreeIcon,
    isActive: (editor) =>
      editor.isActive("heading", { level: RICH_TEXT_HEADING.SUBSECTION }),
    run: (editor) =>
      editor
        .chain()
        .focus()
        .toggleHeading({ level: RICH_TEXT_HEADING.SUBSECTION })
        .run(),
  },
  {
    label: text.richText.bold,
    Icon: BoldIcon,
    separatorBefore: true,
    isActive: (editor) => editor.isActive("bold"),
    run: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    label: text.richText.italic,
    Icon: ItalicIcon,
    isActive: (editor) => editor.isActive("italic"),
    run: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    label: text.richText.bulletList,
    Icon: BulletListIcon,
    separatorBefore: true,
    isActive: (editor) => editor.isActive("bulletList"),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: text.richText.numberedList,
    Icon: NumberedListIcon,
    isActive: (editor) => editor.isActive("orderedList"),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: text.richText.link,
    Icon: LinkIcon,
    separatorBefore: true,
    isActive: (editor) => editor.isActive("link"),
  },
  {
    label: text.richText.undo,
    Icon: UndoIcon,
    separatorBefore: true,
    isEnabled: (editor) => editor.can().undo(),
    run: (editor) => editor.chain().focus().undo().run(),
  },
  {
    label: text.richText.redo,
    Icon: RedoIcon,
    isEnabled: (editor) => editor.can().redo(),
    run: (editor) => editor.chain().focus().redo().run(),
  },
];

const htmlOf = (editor: Editor) => (editor.isEmpty ? "" : editor.getHTML());

export default function RichTextEditor({
  id,
  value,
  onChange,
  onBlur,
  ariaLabel,
  describedBy,
  lang,
  required = false,
  invalid = false,
  disabled = false,
}: {
  id: string;
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  ariaLabel: string;
  describedBy?: string;
  lang?: string;
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const [focusedTool, setFocusedTool] = useState(0);
  const [linkDraft, setLinkDraft] = useState<string | null>(null);
  const [isLinkInvalid, setIsLinkInvalid] = useState(false);
  const toolRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const linkInputId = useId();

  const editor = useEditor({
    immediatelyRender: true,
    extensions: EXTENSIONS,
    content: value,
    editable: !disabled,
    injectCSS: false,
    editorProps: {
      attributes: {
        id,
        class: "rich-text__content",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": ariaLabel,
        "aria-invalid": String(invalid),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(required ? { "aria-required": "true" } : {}),
        ...(lang ? { lang } : {}),
      },
    },
    onUpdate: ({ editor: updated }) => onChange(htmlOf(updated)),
    onBlur: () => onBlur?.(),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      active: TOOLS.map((tool) => tool.isActive?.(current) ?? false),
      enabled: TOOLS.map((tool) => tool.isEnabled?.(current) ?? true),
      isLink: current.isActive("link"),
    }),
  });

  useEffect(() => {
    if (editor.isDestroyed || htmlOf(editor) === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    if (editor.isDestroyed) return;
    editor.setEditable(!disabled, false);
  }, [editor, disabled]);

  const usableTools = TOOLS.flatMap((_, index) =>
    !disabled && state.enabled[index] ? [index] : [],
  );
  const tabStop = usableTools.includes(focusedTool)
    ? focusedTool
    : (usableTools[0] ?? 0);

  const onToolbarKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const count = usableTools.length;
    const position = usableTools.indexOf(tabStop);
    const moves: Partial<Record<string, number>> = {
      [KEYBOARD_KEY.ARROW_RIGHT]: (position + 1) % count,
      [KEYBOARD_KEY.ARROW_LEFT]: (position - 1 + count) % count,
      [KEYBOARD_KEY.HOME]: 0,
      [KEYBOARD_KEY.END]: count - 1,
    };
    const nextPosition = moves[event.key];
    if (nextPosition === undefined || count === 0) return;

    event.preventDefault();
    const next = usableTools[nextPosition];
    setFocusedTool(next);
    toolRefs.current[next]?.focus();
  };

  const openLinkEditor = () => {
    const href = editor.getAttributes("link").href;
    setLinkDraft(typeof href === "string" ? href : "");
    setIsLinkInvalid(false);
  };

  const closeLinkEditor = () => {
    setLinkDraft(null);
    setIsLinkInvalid(false);
    editor.commands.focus();
  };

  const applyLink = () => {
    const href = normalizeLinkHref(linkDraft ?? "");
    if (!href) {
      setIsLinkInvalid(true);
      return;
    }

    const chain = editor.chain().focus().extendMarkRange("link");
    if (editor.state.selection.empty && !editor.isActive("link")) {
      chain
        .insertContent({
          type: "text",
          text: href,
          marks: [{ type: "link", attrs: { href } }],
        })
        .run();
    } else {
      chain.setLink({ href }).run();
    }

    setLinkDraft(null);
    setIsLinkInvalid(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkDraft(null);
    setIsLinkInvalid(false);
  };

  const runTool = (tool: Tool) => {
    if (tool.run) tool.run(editor);
    else if (linkDraft === null) openLinkEditor();
    else closeLinkEditor();
  };

  return (
    <div
      className={`rich-text${invalid ? " is-invalid" : ""}${disabled ? " is-disabled" : ""}`}
    >
      <div
        className="rich-text__toolbar"
        role="toolbar"
        aria-label={text.richText.toolbar}
        aria-controls={id}
        onKeyDown={onToolbarKeyDown}
      >
        {TOOLS.map((tool, index) => {
          const isActive =
            state.active[index] || (!tool.run && linkDraft !== null);

          return (
            <span key={tool.label} className="rich-text__tool-slot">
              {tool.separatorBefore && (
                <span className="rich-text__separator" aria-hidden />
              )}
              <button
                ref={(node) => {
                  toolRefs.current[index] = node;
                }}
                type="button"
                className={`rich-text__tool${isActive ? " is-active" : ""}`}
                aria-label={tool.label}
                title={tool.label}
                aria-pressed={isActive}
                tabIndex={index === tabStop ? 0 : -1}
                disabled={disabled || !state.enabled[index]}
                onFocus={() => setFocusedTool(index)}
                onClick={() => runTool(tool)}
              >
                <tool.Icon />
              </button>
            </span>
          );
        })}
      </div>

      {linkDraft !== null && (
        <div className="rich-text__link">
          <div className="rich-text__link-row">
            <input
              id={linkInputId}
              className="input rich-text__link-input"
              type="text"
              inputMode="url"
              aria-label={text.richText.linkAddress}
              aria-invalid={isLinkInvalid}
              aria-describedby={
                isLinkInvalid ? `${linkInputId}-error` : undefined
              }
              placeholder={DEFAULT_LINK_SCHEME}
              value={linkDraft}
              autoFocus
              onChange={(event) => {
                setLinkDraft(event.target.value);
                setIsLinkInvalid(false);
              }}
              onKeyDown={(event) => {
                if (event.key === KEYBOARD_KEY.ENTER) {
                  event.preventDefault();
                  applyLink();
                } else if (event.key === KEYBOARD_KEY.ESCAPE) {
                  event.stopPropagation();
                  closeLinkEditor();
                }
              }}
            />
            <Button size="small" variant="primary" onClick={applyLink}>
              {text.richText.linkApply}
            </Button>
            {state.isLink && (
              <Button size="small" variant="ghost" onClick={removeLink}>
                {text.richText.linkRemove}
              </Button>
            )}
          </div>
          {isLinkInvalid && (
            <span
              className="rich-text__link-error"
              id={`${linkInputId}-error`}
              role="alert"
            >
              {text.richText.linkInvalid}
            </span>
          )}
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
