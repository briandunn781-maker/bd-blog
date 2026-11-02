import { useRef, useState } from 'react';
import { useEditor, useEditorState, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extensions';
import { uploadImage, errorMessage } from '../api/client.js';

function ToolbarButton({ active, disabled, onClick, label, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`min-w-8 rounded px-2 py-1 text-sm disabled:opacity-40 ${
        active ? 'bg-gold-soft text-gold-ink' : 'text-muted hover:bg-surface hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

export default function Editor({ content, onChange }) {
  const fileInput = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Image,
      Placeholder.configure({ placeholder: 'Write your story…' }),
    ],
    content,
    editorProps: {
      attributes: { class: 'prose max-w-none px-4 py-3' },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // TipTap v3 doesn't re-render on every transaction, so subscribe to toolbar state explicitly
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => e && ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      quote: e.isActive('blockquote'),
      codeBlock: e.isActive('codeBlock'),
      link: e.isActive('link'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  if (!editor || !s) return null;
  const run = (fn) => () => fn(editor.chain().focus()).run();

  function setLink() {
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('Link URL (leave empty to remove)', previous);
    if (url === null) return;
    if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  async function onImageSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await uploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, '') }).run();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg border border-line-strong focus-within:border-gold/60">
      <div className="sticky top-[61px] z-[5] flex flex-wrap gap-1 rounded-t-lg border-b border-line bg-page p-2">
        <ToolbarButton label="Bold" active={s.bold} onClick={run((c) => c.toggleBold())}><b>B</b></ToolbarButton>
        <ToolbarButton label="Italic" active={s.italic} onClick={run((c) => c.toggleItalic())}><i>I</i></ToolbarButton>
        <ToolbarButton label="Strikethrough" active={s.strike} onClick={run((c) => c.toggleStrike())}><s>S</s></ToolbarButton>
        <ToolbarButton label="Inline code" active={s.code} onClick={run((c) => c.toggleCode())}>{'</>'}</ToolbarButton>
        <ToolbarButton label="Heading 2" active={s.h2} onClick={run((c) => c.toggleHeading({ level: 2 }))}>H2</ToolbarButton>
        <ToolbarButton label="Heading 3" active={s.h3} onClick={run((c) => c.toggleHeading({ level: 3 }))}>H3</ToolbarButton>
        <ToolbarButton label="Bullet list" active={s.bullet} onClick={run((c) => c.toggleBulletList())}>• List</ToolbarButton>
        <ToolbarButton label="Numbered list" active={s.ordered} onClick={run((c) => c.toggleOrderedList())}>1. List</ToolbarButton>
        <ToolbarButton label="Quote" active={s.quote} onClick={run((c) => c.toggleBlockquote())}>❝</ToolbarButton>
        <ToolbarButton label="Code block" active={s.codeBlock} onClick={run((c) => c.toggleCodeBlock())}>{'{ }'}</ToolbarButton>
        <ToolbarButton label="Link" active={s.link} onClick={setLink}>🔗</ToolbarButton>
        <ToolbarButton label="Insert image" disabled={uploading} onClick={() => fileInput.current.click()}>
          {uploading ? '…' : '🖼️'}
        </ToolbarButton>
        <ToolbarButton label="Divider" onClick={run((c) => c.setHorizontalRule())}>―</ToolbarButton>
        <span className="mx-1 w-px bg-line" />
        <ToolbarButton label="Undo" disabled={!s.canUndo} onClick={run((c) => c.undo())}>↶</ToolbarButton>
        <ToolbarButton label="Redo" disabled={!s.canRedo} onClick={run((c) => c.redo())}>↷</ToolbarButton>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={onImageSelected} />
      </div>
      {error && <p className="px-4 pt-2 text-sm text-red-600">{error}</p>}
      <EditorContent editor={editor} />
    </div>
  );
}
