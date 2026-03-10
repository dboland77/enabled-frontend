import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export type UploadProgress = {
  progress: number;
  loaded: number;
  total: number;
};

export type UploadResult = {
  path: string;
  url: string;
};

export type UseFileUploadOptions = {
  bucketName?: string;
  path?: string;
  cacheControl?: string;
  upsert?: boolean;
};

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    bucketName = 'enabled-storage',
    path = '',
    cacheControl = '3600',
    upsert = false,
  } = options;

  const supabase = createClient();

  console.log('hello from upload', bucketName);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState<UploadProgress>({
    progress: 0,
    loaded: 0,
    total: 0,
  });
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const reset = () => {
    setStatus('idle');
    setProgress({ progress: 0, loaded: 0, total: 0 });
    setResult(null);
    setError(null);
  };

  const uploadFile = async (file: File): Promise<UploadResult | null> => {
    try {
      setStatus('uploading');
      setProgress({ progress: 0, loaded: 0, total: file.size });
      setError(null);

      // Create a unique file name if path is not provided
      const filePath = path
        ? `${path}/${file.name.replace(/\s+/g, '_')}`
        : `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

      // For progress tracking, we need to use XMLHttpRequest
      // since the Supabase client doesn't support progress tracking directly
      return new Promise((resolve, reject) => {
        // First, get a signed URL for the file upload
        supabase.storage
          .from(bucketName)
          .createSignedUploadUrl(filePath)
          .then(({ data, error }) => {
            if (error) {
              throw error;
            }

            if (!data) {
              throw new Error('Failed to create signed URL');
            }

            const { signedUrl, path } = data;

            // Use XMLHttpRequest for progress tracking
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const progressData = {
                  progress: (event.loaded / event.total) * 100,
                  loaded: event.loaded,
                  total: event.total,
                };
                setProgress(progressData);
              }
            });

            xhr.addEventListener('load', async () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                // Get public URL for the uploaded file
                const { data: publicUrlData } = supabase.storage
                  .from(bucketName)
                  .getPublicUrl(path);

                const result = {
                  path,
                  url: publicUrlData.publicUrl,
                };

                setStatus('success');
                setResult(result);
                resolve(result);
              } else {
                const error = new Error(`Upload failed with status ${xhr.status}`);
                setStatus('error');
                setError(error);
                reject(error);
              }
            });

            xhr.addEventListener('error', () => {
              const error = new Error('Network error during upload');
              setStatus('error');
              setError(error);
              reject(error);
            });

            xhr.addEventListener('abort', () => {
              const error = new Error('Upload aborted');
              setStatus('error');
              setError(error);
              reject(error);
            });

            // Open and send the request
            xhr.open('PUT', signedUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.setRequestHeader('Cache-Control', cacheControl);
            xhr.send(file);
          })
          .catch((error) => {
            setStatus('error');
            setError(error instanceof Error ? error : new Error(String(error)));
            reject(error);
            return null;
          });
      });
    } catch (error) {
      setStatus('error');
      setError(error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  };

  return {
    uploadFile,
    status,
    progress,
    result,
    error,
    reset,
  };
}
