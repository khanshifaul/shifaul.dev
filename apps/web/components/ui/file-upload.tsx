"use client"

import * as React from "react"
import { LuUpload, LuX, LuFile, LuImage, LuFileText, LuFilm, LuMusic } from "react-icons/lu"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
    onChange?: (files: File[]) => void
    accept?: string
    multiple?: boolean
    maxSize?: number // in bytes
    maxFiles?: number
    className?: string
    disabled?: boolean
    variant?: 'default' | 'compact'
}

interface UploadedFile {
    file: File
    preview?: string
}

const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return LuImage
    if (type.startsWith("video/")) return LuFilm
    if (type.startsWith("audio/")) return LuMusic
    if (type.includes("pdf") || type.includes("document")) return LuFileText
    return LuFile
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function FileUpload({
    onChange,
    accept,
    multiple = false,
    maxSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 5,
    className,
    disabled = false,
    variant = 'default',
}: FileUploadProps) {
    const [files, setFiles] = React.useState<UploadedFile[]>([])
    const [isDragging, setIsDragging] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleFiles = React.useCallback(
        (newFiles: FileList | null) => {
            if (!newFiles) return
            setError(null)

            const fileArray = Array.from(newFiles)

            // Validate file count
            if (!multiple && fileArray.length > 1) {
                setError("Only one file allowed")
                return
            }

            if (multiple && files.length + fileArray.length > maxFiles) {
                setError(`Maximum ${maxFiles} files allowed`)
                return
            }

            // Validate file sizes
            const oversizedFiles = fileArray.filter(f => f.size > maxSize)
            if (oversizedFiles.length > 0) {
                setError(`File(s) exceed maximum size of ${formatFileSize(maxSize)}`)
                return
            }

            const uploadedFiles: UploadedFile[] = fileArray.map(file => ({
                file,
                preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
            }))

            const newFileList = multiple ? [...files, ...uploadedFiles] : uploadedFiles
            setFiles(newFileList)
            onChange?.(newFileList.map(f => f.file))
        },
        [files, multiple, maxFiles, maxSize, onChange]
    )

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (!disabled) {
            setIsDragging(true)
        }
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (!disabled) {
            handleFiles(e.dataTransfer.files)
        }
    }

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index)
        // Revoke object URL to prevent memory leaks
        if (files[index].preview) {
            URL.revokeObjectURL(files[index].preview!)
        }
        setFiles(newFiles)
        onChange?.(newFiles.map(f => f.file))
    }

    const handleClick = () => {
        if (!disabled) {
            inputRef.current?.click()
        }
    }

    // Cleanup previews on unmount
    React.useEffect(() => {
        return () => {
            files.forEach(f => {
                if (f.preview) URL.revokeObjectURL(f.preview)
            })
        }
    }, [])

    return (
        <div className={cn("space-y-4", className)}>
            {/* Drop Zone */}
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors",
                    variant === 'default' && "flex-col gap-4 p-8",
                    variant === 'compact' && "flex-row gap-3 p-4",
                    isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                    disabled && "opacity-50 cursor-not-allowed",
                    error && "border-destructive"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    disabled={disabled}
                />

                {variant === 'default' && (
                    <>
                        <div className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-full bg-muted transition-colors",
                            isDragging && "bg-primary/10"
                        )}>
                            <LuUpload className={cn(
                                "h-6 w-6 text-muted-foreground",
                                isDragging && "text-primary"
                            )} />
                        </div>

                        <div className="text-center">
                            <p className="text-sm font-medium">
                                {isDragging ? "Drop files here" : "Drag & drop files here"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                or click to browse
                            </p>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            {accept ? `Accepted: ${accept}` : "All file types accepted"} • Max {formatFileSize(maxSize)}
                        </p>
                    </>
                )}

                {variant === 'compact' && (
                    <>
                        <div className={cn(
                            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted transition-colors",
                            isDragging && "bg-primary/10"
                        )}>
                            <LuUpload className={cn(
                                "h-5 w-5 text-muted-foreground",
                                isDragging && "text-primary"
                            )} />
                        </div>

                        <div className="flex flex-col text-left">
                            <p className="text-sm font-medium">
                                {isDragging ? "Drop files" : "Upload files"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {accept ? accept : `Max ${formatFileSize(maxSize)}`}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            {/* LuFile List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((uploadedFile, index) => {
                        const FileIcon = getFileIcon(uploadedFile.file.type)
                        const dotIndex = uploadedFile.file.name.lastIndexOf('.')
                        const hasExtension = dotIndex !== -1
                        const name = hasExtension ? uploadedFile.file.name.slice(0, dotIndex) : uploadedFile.file.name
                        const extension = hasExtension ? uploadedFile.file.name.slice(dotIndex) : ''

                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 rounded-lg border bg-card p-3"
                            >
                                {uploadedFile.preview ? (
                                    <img
                                        src={uploadedFile.preview}
                                        alt={uploadedFile.file.name}
                                        className="h-10 w-10 rounded object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center min-w-0">
                                        <span className="truncate text-sm font-medium">
                                            {name}
                                        </span>
                                        <span className="text-sm font-medium whitespace-nowrap">
                                            {extension}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(uploadedFile.file.size)}
                                    </p>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation()
                                        removeFile(index)
                                    }}
                                >
                                    <LuX className="h-4 w-4" />
                                </Button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
