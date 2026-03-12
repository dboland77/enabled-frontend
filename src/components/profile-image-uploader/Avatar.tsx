'use client';

import { useState, useRef } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import Iconify from '../../iconify';
import { createClient } from '../../../lib/supabase/client';

// ----------------------------------------------------------------------

export default function ProfileImageUploader() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('enabled-storage')
        .upload(`profile-images/${filename}`, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setSuccess(true);
      setUploading(false);

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      setUploading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Stack spacing={2} sx={{ p: 3 }}>
      <Box
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleInputChange}
          disabled={uploading}
        />

        <Stack spacing={1} alignItems="center">
          <Iconify icon="solar:gallery-add-bold" width={48} sx={{ color: 'primary.main' }} />
          <Box>
            <Button
              component="span"
              variant="text"
              disabled={uploading}
              sx={{ textTransform: 'none' }}
            >
              Click to upload
            </Button>
            <Box component="span" sx={{ color: 'text.secondary' }}>
              {' or drag and drop'}
            </Box>
          </Box>
          <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            PNG, JPG, GIF up to 5MB
          </Box>
        </Stack>

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Image uploaded successfully!</Alert>}
    </Stack>
  );
}

