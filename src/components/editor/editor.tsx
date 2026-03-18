'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

import { alpha } from '@mui/system';

import { EditorProps } from '@/components/editor/types';
import { StyledEditor } from '@/components/editor/styles';
import Toolbar from '@/components/editor/toolbar';

export default function Editor({
  id = 'enabled-editor',
  error,
  simple = false,
  helperText,
  placeholder,
  value,
  onChange,
  sx,
  editable = true,
  ...other
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
    ],
    content: value || '',
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Return empty string if editor only contains empty paragraph
      const isEmpty = html === '<p></p>' || html === '';
      onChange?.(isEmpty ? '' : html);
    },
    immediatelyRender: false,
  });

  // Sync external value changes with editor
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentContent = editor.getHTML();
      const isEmpty = currentContent === '<p></p>' || currentContent === '';
      const normalizedCurrent = isEmpty ? '' : currentContent;
      
      if (normalizedCurrent !== value) {
        editor.commands.setContent(value || '');
      }
    }
  }, [editor, value]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  return (
    <>
      <StyledEditor
        id={id}
        sx={{
          ...(error && {
            border: (theme: any) => `solid 1px ${theme.palette.error.main}`,
            '& .tiptap': {
              bgcolor: (theme: any) => alpha(theme.palette.error.main, 0.08),
            },
          }),
          ...sx,
        }}
        {...other}
      >
        <Toolbar editor={editor} simple={simple} />
        <EditorContent editor={editor} />
      </StyledEditor>

      {helperText && helperText}
    </>
  );
}
