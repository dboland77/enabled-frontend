import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/system';

// ----------------------------------------------------------------------

export const StyledEditor = styled(Box)(({ theme }: any) => ({
  overflow: 'hidden',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  border: `solid 1px ${alpha(theme.palette.grey[500], 0.2)}`,
  '& .tiptap-toolbar': {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(1),
    borderBottom: `solid 1px ${alpha(theme.palette.grey[500], 0.2)}`,
    backgroundColor: theme.palette.background.paper,
  },
  '& .tiptap-toolbar-group': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.25),
    '&:not(:last-of-type)': {
      marginRight: theme.spacing(1),
      paddingRight: theme.spacing(1),
      borderRight: `solid 1px ${alpha(theme.palette.grey[500], 0.2)}`,
    },
  },
  '& .tiptap-toolbar button': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    padding: 0,
    border: 'none',
    borderRadius: 4,
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    cursor: 'pointer',
    transition: theme.transitions.create(['background-color', 'color']),
    '&:hover': {
      backgroundColor: alpha(theme.palette.grey[500], 0.08),
    },
    '&.is-active': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
      color: theme.palette.primary.main,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    '& svg': {
      width: 18,
      height: 18,
    },
  },
  '& .tiptap': {
    minHeight: 160,
    maxHeight: 640,
    overflow: 'auto',
    padding: theme.spacing(2),
    backgroundColor: alpha(theme.palette.grey[500], 0.08),
    ...theme.typography.body2,
    fontFamily: theme.typography.fontFamily,
    outline: 'none',
    '& p.is-editor-empty:first-child::before': {
      content: 'attr(data-placeholder)',
      float: 'left',
      color: theme.palette.text.disabled,
      pointerEvents: 'none',
      height: 0,
    },
    '& h1': {
      ...theme.typography.h1,
    },
    '& h2': {
      ...theme.typography.h2,
    },
    '& h3': {
      ...theme.typography.h3,
    },
    '& h4': {
      ...theme.typography.h4,
    },
    '& h5': {
      ...theme.typography.h5,
    },
    '& h6': {
      ...theme.typography.h6,
    },
    '& p': {
      ...theme.typography.body2,
      margin: 0,
      marginBottom: theme.spacing(1),
    },
    '& ul, & ol': {
      paddingLeft: theme.spacing(3),
      marginBottom: theme.spacing(1),
    },
    '& li': {
      ...theme.typography.body2,
    },
    '& blockquote': {
      borderLeft: `4px solid ${theme.palette.grey[300]}`,
      paddingLeft: theme.spacing(2),
      marginLeft: 0,
      marginRight: 0,
      fontStyle: 'italic',
      color: theme.palette.text.secondary,
    },
    '& pre': {
      ...theme.typography.body2,
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.grey[900],
      color: theme.palette.common.white,
      fontFamily: 'monospace',
      overflow: 'auto',
    },
    '& code': {
      backgroundColor: alpha(theme.palette.grey[500], 0.16),
      borderRadius: 4,
      padding: '2px 4px',
      fontFamily: 'monospace',
      fontSize: '0.875em',
    },
    '& pre code': {
      backgroundColor: 'transparent',
      padding: 0,
    },
    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    '& hr': {
      border: 'none',
      borderTop: `1px solid ${theme.palette.divider}`,
      margin: theme.spacing(2, 0),
    },
  },
}));

export const StyledEditorToolbar = styled('div')(({ theme }: any) => ({
  // Keep for backwards compatibility, but Tiptap uses inline toolbar
}));
