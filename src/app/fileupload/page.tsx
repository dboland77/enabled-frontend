'use client';

import Image from 'next/image';
import { FileUpload } from '@/components/file-upload';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Supabase File Upload</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Upload files to Supabase Storage with real-time progress tracking
        </p>
        <div className="flex justify-center gap-2">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-400/30">
            Next.js
          </span>
          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-400/30">
            Supabase
          </span>
          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-purple-900/20 dark:text-purple-300 dark:ring-purple-400/30">
            TypeScript
          </span>
        </div>
      </header>

      <main className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-center">Upload Files</h2>
            <FileUpload
              onUploadComplete={(url) => {
                console.log('Upload complete:', url);
              }}
              onUploadError={(error) => {
                console.error('Upload error:', error);
              }}
              maxSizeMB={10}
              allowedTypes={[
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/pdf',
                'text/plain',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              ]}
              bucketName="enabled-storage"
            />
          </div>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Files are uploaded to Supabase Storage without authentication</p>
            <p className="mt-1">Maximum file size: 10MB</p>
          </div>
        </div>
      </main>
    </div>
  );
}
