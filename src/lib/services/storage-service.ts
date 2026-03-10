import { supabase } from "@/lib/supabase";

export type UploadProgressEvent = {
  progress: number;
  loaded: number;
  total: number;
};

export type UploadOptions = {
  bucketName?: string;
  path?: string;
  onProgress?: (event: UploadProgressEvent) => void;
  cacheControl?: string;
  upsert?: boolean;
};

export type UploadResult = {
  path: string;
  url: string;
};

/**
 * Uploads a file to Supabase Storage with progress tracking
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const {
    bucketName = "enabled-storage",
    path = "",
    onProgress,
    cacheControl = "3600",
    upsert = false,
  } = options;

  try {
    // Create a unique file name if path is not provided
    const filePath = path || `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const fullPath = path
      ? `${path}/${file.name.replace(/\s+/g, "_")}`
      : filePath;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fullPath, file, {
        cacheControl,
        upsert,
      });

    // Note: As of the latest Supabase version, upload progress tracking is handled differently
    // Progress tracking would need to be implemented using a custom solution or XHR

    if (error) {
      throw error;
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fullPath);

    return {
      path: fullPath,
      url: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteFile(
  path: string,
  bucketName: string,
): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucketName).remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

/**
 * Lists all files in a bucket or folder
 */
export async function listFiles(
  bucketName: string = "enabled-storage",
  path: string = "",
) {
  try {
    const { data, error } = await supabase.storage.from(bucketName).list(path);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
}
