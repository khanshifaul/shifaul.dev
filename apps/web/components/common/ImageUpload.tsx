"use client";

import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/utils/upload";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { LuLoader, LuUpload, LuX } from "react-icons/lu";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    placeholder?: string;
    folder?: string;
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    placeholder = "Upload Image",
    folder = "general",
    className = "",
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const url = await uploadFile(file, folder);
            onChange(url);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
            // Reset file input so the same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onChange("");
    };

    return (
        <div className={`relative ${className}`}>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isUploading}
            />

            {value ? (
                <div className="relative group aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                    <Image
                        src={value}
                        alt="Preview"
                        fill
			sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            Change
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleRemove}
                            disabled={isUploading}
                        >
                            <LuX className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-[200px] aspect-video rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900/50 text-slate-500"
                >
                    {isUploading ? (
                        <>
                            <LuLoader className="h-8 w-8 animate-spin text-primary" />
                            <span className="text-sm font-medium">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                <LuUpload className="h-6 w-6" />
                            </div>
                            <span className="text-sm font-medium">{placeholder}</span>
                            <span className="text-xs text-slate-400">JPG, PNG, WebP up to 5MB</span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
};
