'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/system';
import FormHelperText from '@mui/material/FormHelperText';

import { EditorProps } from '@/components/editor/types';

// Dynamic import to avoid SSR issues
const DefaultEditor = dynamic(
  () => import('react-simple-wysiwyg').then((mod) => mod.default),
  { ssr: false }
);

const StyledEditorWrapper = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  border: `solid 1px ${alpha(theme.palette.grey[500], 0.2)}`,
  '& .rsw-editor': {
    minHeight: 200,
    border: 'none',
    backgroundColor: 'transparent',
  },
  '& .rsw-ce': {
    minHeight: 160,
    padding: theme.spacing(2),
    outline: 'none',
    '&:focus': {
      outline: 'none',
    },
    '& p': {
      margin: 0,
      marginBottom: theme.spacing(1),
    },
    '& ul, & ol': {
      paddingLeft: theme.spacing(3),
      marginBottom: theme.spacing(1),
    },
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      marginTop: 0,
      marginBottom: theme.spacing(1),
    },
    '& a': {
      color: theme.palette.primary.main,
    },
  },
  '& .rsw-toolbar': {
    backgroundColor: alpha(theme.palette.grey[500], 0.08),
    borderBottom: `solid 1px ${alpha(theme.palette.grey[500], 0.2)}`,
    padding: theme.spacing(0.5, 1),
    '& .rsw-btn': {
      border: 'none',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: 'transparent',
      color: theme.palette.text.secondary,
      cursor: 'pointer',
      padding: theme.spacing(0.75),
      margin: theme.spacing(0.25),
      minWidth: 32,
      height: 32,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      '&:hover': {
        backgroundColor: alpha(theme.palette.grey[500], 0.16),
      },
      '&[data-active="true"]': {
        backgroundColor: alpha(theme.palette.primary.main, 0.16),
        color: theme.palette.primary.main,
      },
    },
    '& .rsw-separator': {
      width: 1,
      height: 24,
      backgroundColor: alpha(theme.palette.grey[500], 0.24),
      margin: theme.spacing(0, 0.5),
    },
  },
}));

export default function Editor({
  id = 'enabled-editor',
  error,
  helperText,
  value,
  onChange,
  sx,
  editable = true,
  ...other
}: EditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: { target: { value: string } }) => {
    const html = e.target.value;
    // Return empty string if editor only contains empty content
    const isEmpty = !html || html === '<br>' || html === '<p><br></p>';
    onChange?.(isEmpty ? '' : html);
  };

  if (!mounted) {
    return (
      <StyledEditorWrapper
        sx={{
          minHeight: 200,
          ...sx,
        }}
      />
    );
  }

  return (
    <>
      <StyledEditorWrapper
        id={id}
        sx={{
          ...(error && {
            border: (theme: any) => `solid 1px ${theme.palette.error.main}`,
            '& .rsw-ce': {
              bgcolor: (theme: any) => alpha(theme.palette.error.main, 0.08),
            },
          }),
          ...(!editable && {
            opacity: 0.6,
            pointerEvents: 'none',
          }),
          ...sx,
        }}
        {...other}
      >
        <DefaultEditor
          value={value || ''}
          onChange={handleChange}
        />
      </StyledEditorWrapper>

      {helperText && (
        <FormHelperText error={error} sx={{ px: 2 }}>
          {helperText}
        </FormHelperText>
      )}
    </>
  );
}
