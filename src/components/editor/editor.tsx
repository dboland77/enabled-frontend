import '../../utils/highlight';

import ReactQuill from 'react-quill-new';

import { alpha } from '@mui/material/styles';

import { EditorProps } from './types';
import { StyledEditor } from './styles';
import Toolbar, { formats } from './toolbar';

export default function Editor({
  id = 'enabled-quill',
  error,
  simple = false,
  helperText,
  placeholder,
  sx,
  ...other
}: EditorProps) {
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
            border: (theme) => `solid 1px ${theme.palette.error.main}`,
            '& .ql-editor': {
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
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
