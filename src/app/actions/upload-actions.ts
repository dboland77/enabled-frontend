'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

const bucketName = 'enabled-storage';
const supabase = createClient();

// File validation schema
const fileSchema = z.object({
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  type: z
    .string()
    .refine(
      (type) =>
        [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ].includes(type),
      'Unsupported file type'
    ),
});

export type UploadResult = {
  success: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    type: string;
    path: string;
    url: string;
  };
};

/**
 * Server action to upload a file to Supabase Storage
 */
export async function uploadFile(formData: FormData): Promise<UploadResult> {
  try {
    // Get the file from FormData
    const file = formData.get('file') as File | null;

    // Validate file exists
    if (!file) {
      return {
        success: false,
        error: 'No file provided',
      };
    }

    // Validate file using Zod schema
    try {
      fileSchema.parse(file);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return {
          success: false,
          error: validationError.errors[0].message,
        };
      }
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop() || '';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    // Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase
    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    return {
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        path: fileName,
        url: publicUrlData.publicUrl,
      },
    };
  } catch (error) {
    console.error('Server error during upload:', error);
    return {
      success: false,
      error: 'Internal server error during file upload',
    };
  }
}
