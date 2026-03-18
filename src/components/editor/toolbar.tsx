'use client';

import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Link,
  Unlink,
  RemoveFormatting,
} from 'lucide-react';

type EditorToolbarProps = {
  editor: Editor | null;
  simple?: boolean;
};

export default function Toolbar({ editor, simple }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="tiptap-toolbar">
      {/* Text formatting */}
      <div className="tiptap-toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Bold"
        >
          <Bold />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italic"
        >
          <Italic />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          title="Underline"
        >
          <Underline />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          title="Strikethrough"
        >
          <Strikethrough />
        </button>
      </div>

      {/* Headings */}
      {!simple && (
        <div className="tiptap-toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
            title="Heading 1"
          >
            <Heading1 />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
            title="Heading 2"
          >
            <Heading2 />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
            title="Heading 3"
          >
            <Heading3 />
          </button>
        </div>
      )}

      {/* Lists */}
      <div className="tiptap-toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Bullet List"
        >
          <List />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Ordered List"
        >
          <ListOrdered />
        </button>
      </div>

      {/* Block elements */}
      {!simple && (
        <div className="tiptap-toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'is-active' : ''}
            title="Quote"
          >
            <Quote />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'is-active' : ''}
            title="Code Block"
          >
            <Code />
          </button>
        </div>
      )}

      {/* Links */}
      <div className="tiptap-toolbar-group">
        <button
          type="button"
          onClick={setLink}
          className={editor.isActive('link') ? 'is-active' : ''}
          title="Add Link"
        >
          <Link />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
          title="Remove Link"
        >
          <Unlink />
        </button>
      </div>

      {/* Utilities */}
      <div className="tiptap-toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear Formatting"
        >
          <RemoveFormatting />
        </button>
      </div>

      {/* History */}
      <div className="tiptap-toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo />
        </button>
      </div>
    </div>
  );
}
