'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

import { EditorProps } from '@/components/editor/types';
import { StyledEditor } from '@/components/editor/styles';
import Toolbar, { formats } from '@/components/editor/toolbar';

import { alpha } from '@mui/system';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function Editor({
  id = 'enabled-quill',
  error,
  simple = false,
  helperText,
  placeholder,
  sx,
  ...other
}: EditorProps) {
  useEffect(() => {
    // Load highlight only on the client to avoid SSR "document is not defined"
    import('@/utils/highlight');
  }, []);

  const modules = {
    toolbar: {
      container: `#${id}`,
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true,
    },
    syntax: true,
    clipboard: {
      matchVisual: false,
    },
  };

  return (
    <>
      <StyledEditor
        sx={{
          ...(error && {
            border: (theme: any) => `solid 1px ${theme.palette.error.main}`,
            '& .ql-editor': {
              bgcolor: (theme: any) => alpha(theme.palette.error.main, 0.08),
            },
          }),
          ...sx,
        }}
      >
        <Toolbar id={id} simple={simple} />

        <ReactQuill modules={modules} formats={formats} placeholder={placeholder} {...other} />
      </StyledEditor>

      {helperText && helperText}
    </>
  );
}
