import { Theme, SxProps } from '@mui/material/styles';

// ----------------------------------------------------------------------

export interface EditorProps {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  simple?: boolean;
  helperText?: React.ReactNode;
  sx?: SxProps<Theme>;
  editable?: boolean;
}
