'use client';

import { useState, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

import Iconify from '@/components/iconify';
import { createClient } from '@/lib/supabase/client';

interface ProfileImageUploaderProps {
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: Error) => void;
  bucketName?: string;
}

export default function ProfileImageUploader({
  onUploadComplete,
  onUploadError,
  bucketName = 'enabled-storage',
}: ProfileImageUploaderProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateFile = (file: File): boolean => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return false;
    }

    return true;
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!validateFile(file)) {
      return;
    }

    setError(null);
    setSuccess(false);
    setSelectedFile(file);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${selectedFile.name}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + Math.random() * 30;
          return next > 90 ? 90 : next;
        });
      }, 200);

      // Upload to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(`profile-images/${filename}`, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);
      setProgress(100);

      if (uploadError) {
        throw uploadError;
      }

      if (data) {
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(`profile-images/${filename}`);

        setSuccess(true);
        onUploadComplete?.(publicUrlData.publicUrl);

        // Reset after 3 seconds
        setTimeout(() => {
          setSelectedFile(null);
          setSuccess(false);
          setProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 3000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      onUploadError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Stack spacing={2} sx={{ p: 3 }}>
      <Box
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!selectedFile && !uploading ? handleClick : undefined}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          borderRadius: 1,
          cursor: !selectedFile && !uploading ? 'pointer' : 'default',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          bgcolor: isDragging ? 'action.hover' : 'transparent',
          '&:hover':
            !selectedFile && !uploading
              ? {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                }
              : {},
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

        {!selectedFile ? (
          <Stack spacing={1} alignItems="center">
            <Iconify icon="solar:gallery-add-bold" width={48} sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Click to upload or drag and drop
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              PNG, JPG, GIF up to 5MB
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2} alignItems="center">
            <Iconify icon="solar:check-circle-bold" width={48} sx={{ color: 'success.main' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {selectedFile.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          </Stack>
        )}
      </Box>

      {uploading && (
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption">Uploading...</Typography>
            <Typography variant="caption">{Math.round(progress)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} />
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Image uploaded successfully!</Alert>}

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        {selectedFile && !uploading && !success && (
          <>
            <Button variant="outlined" onClick={handleReset}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleUpload} disabled={uploading}>
              Upload
            </Button>
          </>
        )}
        {success && (
          <Button variant="contained" onClick={handleReset}>
            Upload Another
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
