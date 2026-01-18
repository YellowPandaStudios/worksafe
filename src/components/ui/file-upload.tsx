"use client"

import * as React from "react"
import { useDropzone, type DropzoneOptions } from "react-dropzone"
import { Upload, X, File, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface FileUploadProps extends Omit<DropzoneOptions, "onDrop"> {
  onUpload?: (files: File[]) => void | Promise<void>
  onRemove?: (file: File) => void
  value?: File[]
  className?: string
  maxFiles?: number
  showPreview?: boolean
  uploadProgress?: Record<string, number>
}

export function FileUpload({
  onUpload,
  onRemove,
  value = [],
  className,
  maxFiles = 10,
  accept,
  maxSize,
  showPreview = true,
  uploadProgress,
  ...props
}: FileUploadProps) {
  const [files, setFiles] = React.useState<File[]>(value)
  const [isDragging, setIsDragging] = React.useState(false)

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
      setFiles(newFiles)
      onUpload?.(newFiles)
    },
    [files, maxFiles, onUpload]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    noClick: true,
    noKeyboard: true,
    ...props,
  })

  const removeFile = (fileToRemove: File) => {
    const newFiles = files.filter((file) => file !== fileToRemove)
    setFiles(newFiles)
    onRemove?.(fileToRemove)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  React.useEffect(() => {
    setIsDragging(isDragActive)
  }, [isDragActive])

  React.useEffect(() => {
    setFiles(value)
  }, [value])

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-surface-hover",
          className
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div
            className={cn(
              "p-4 rounded-full transition-colors",
              isDragging ? "bg-primary/10" : "bg-surface-secondary"
            )}
          >
            <Upload
              className={cn(
                "h-8 w-8 transition-colors",
                isDragging ? "text-primary" : "text-text-tertiary"
              )}
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-primary">
              {isDragging
                ? "Drop files here"
                : "Drag & drop files here, or click to select"}
            </p>
            <p className="text-xs text-text-tertiary">
              {maxFiles > 1
                ? `Up to ${maxFiles} files`
                : "Single file only"}
              {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={open}
            className="mt-2"
          >
            Select Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-text-primary">
            Selected Files ({files.length})
          </div>
          <div className="space-y-2">
            {files.map((file, index) => {
              const progress = uploadProgress?.[file.name]
              const isImage = file.type.startsWith("image/")
              const previewUrl = isImage ? URL.createObjectURL(file) : null

              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 p-3 rounded-md border bg-surface-primary"
                >
                  {showPreview && previewUrl ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-surface-secondary">
                      {getFileIcon(file)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {formatFileSize(file.size)}
                    </p>
                    {progress !== undefined && (
                      <div className="mt-2">
                        <Progress value={progress} className="h-1" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeFile(file)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
