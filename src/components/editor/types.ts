import type ReactQuill from 'react-quill-new';

import { Theme, SxProps } from '@mui/material/styles';

// ----------------------------------------------------------------------

export interface EditorProps extends React.ComponentProps<typeof ReactQuill> {
  id: string;
  placeholder?: string;
  error?: boolean;
  simple?: boolean;
  helperText?: React.ReactNode;
  sx?: SxProps<Theme>;
}
