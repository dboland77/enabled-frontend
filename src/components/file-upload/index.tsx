"use client";

import { useState, useRef, useCallback } from "react";
import { useFileUpload } from "@/lib/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface FileUploadProps {
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: Error) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
  bucketName?: string;
}

const bucketName = "enabled-storage";

export function FileUpload({
  onUploadComplete,
  onUploadError,
  maxSizeMB = 10,
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  bucketName,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, status, progress, result, error, reset } = useFileUpload({
    bucketName,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      const error = new Error(`File size exceeds ${maxSizeMB}MB limit`);
      toast.error("File too large", {
        description: error.message,
      });
      onUploadError?.(error);
      return;
    }

    // Validate file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      const error = new Error(`File type ${file.type} is not allowed`);
      toast.error("Unsupported file type", {
        description: error.message,
      });
      onUploadError?.(error);
      return;
    }

    setSelectedFile(file);
    reset();
    toast.info("File selected", {
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Show loading toast
    const loadingToast = toast.loading(`Uploading ${selectedFile.name}...`);

    try {
      const result = await uploadFile(selectedFile);
      if (result) {
        // Dismiss loading toast and show success toast
        toast.dismiss(loadingToast);
        toast.success("File uploaded successfully!", {
          description: `${selectedFile.name} has been uploaded.`,
          action: {
            label: "View",
            onClick: () => window.open(result.url, "_blank"),
          },
        });
        onUploadComplete?.(result.url);
      }
    } catch (err) {
      // Dismiss loading toast and show error toast
      toast.dismiss(loadingToast);
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error("Upload failed", {
        description: error.message || "An error occurred during upload",
      });
      onUploadError?.(error);
    }
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag and drop handlers
  const [isDragging, setIsDragging] = useState(false);

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
    setIsDragging(true);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0] || null;
      if (!file) return;

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        const error = new Error(`File size exceeds ${maxSizeMB}MB limit`);
        toast.error("File too large", {
          description: error.message,
        });
        onUploadError?.(error);
        return;
      }

      // Validate file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        const error = new Error(`File type ${file.type} is not allowed`);
        toast.error("Unsupported file type", {
          description: error.message,
        });
        onUploadError?.(error);
        return;
      }

      setSelectedFile(file);
      reset();
      toast.info("File selected", {
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      });
    },
    [allowedTypes, maxSizeMB, onUploadError, reset],
  );

  return (
    <div className="w-full max-w-md space-y-4">
      <div
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"} rounded-lg transition-colors duration-200`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={allowedTypes.join(",")}
        />

        {!selectedFile ? (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Drag and drop files here, or click to select
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {allowedTypes.map((type) => type.split("/")[1]).join(", ")} up to{" "}
              {maxSizeMB}MB
            </p>
            <Button
              onClick={handleSelectFile}
              className="mt-4"
              variant="outline"
            >
              Select File
            </Button>
          </div>
        ) : (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="truncate max-w-[200px]">
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB ·{" "}
                  {selectedFile.type.split("/")[1]}
                </p>
              </div>
              <Button
                onClick={handleReset}
                variant="ghost"
                size="sm"
                className="h-8 px-2"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>

            {status === "uploading" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Uploading...</span>
                  <span>{Math.round(progress.progress)}%</span>
                </div>
                <Progress value={progress.progress} className="h-2" />
              </div>
            )}

            {status === "error" && (
              <p className="text-sm text-red-500">
                {error?.message || "An error occurred during upload"}
              </p>
            )}

            {status === "success" && (
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-green-500">
                  File uploaded successfully!
                </p>
                {result && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(result.url, "_blank")}
                    className="text-xs"
                  >
                    View Uploaded File
                  </Button>
                )}
              </div>
            )}

            {status !== "uploading" && status !== "success" && (
              <Button onClick={handleUpload} className="w-full">
                Upload
              </Button>
            )}

            {status === "success" && (
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full"
              >
                Upload Another File
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
