"use client";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/common/ImageUpload";
import { ForwardRefEditor } from "./ForwardRefEditor";

import React, { useState } from "react";
import { z } from "zod";

export const blogPostSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    thumbnail: z.string().optional().or(z.literal("")),
    content: z.string().min(1, "Content is required"),
    tags: z.string().optional(),
    published: z.boolean(),
});

export type BlogPostFormInput = z.infer<typeof blogPostSchema>;

interface BlogPostFormProps {
    initialData?: BlogPostFormInput;
    onSubmit: (data: BlogPostFormInput) => Promise<void>;
    loading?: boolean;
    buttonTextMap?: {
        draft: string;
        publish: string;
    };
}

// Constants
const BUTTON_TEXT_DEFAULTS = { draft: "Save Draft", publish: "Publish Now" };
const DEFAULT_VALUES: BlogPostFormInput = {
    title: "",
    slug: "",
    thumbnail: "",
    content: "",
    tags: "",
    published: false,
};

const slugify = (text: string) =>
    text
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");

export const BlogPostForm: React.FC<BlogPostFormProps> = ({
    initialData,
    onSubmit,
    loading = false,
    buttonTextMap = BUTTON_TEXT_DEFAULTS,
}) => {
    const [values, setValues] = useState<BlogPostFormInput>(initialData || DEFAULT_VALUES);
    const [touchedSlug, setTouchedSlug] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleFieldChange = (field: keyof BlogPostFormInput, value: string | boolean) => {
        if (field === "slug") setTouchedSlug(true);

        let newValues = { ...values, [field]: value };

        if (field === "title" && !touchedSlug && !initialData) {
            newValues.slug = slugify(value as string);
        }

        setValues(newValues);

        if (errors[field]) {
            setErrors(prev => {
                const { [field]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent, publishStatus: boolean) => {
        e.preventDefault();

        const currentContent = values.content;

        const submissionValues: BlogPostFormInput = {
            ...values,
            content: currentContent,
            published: publishStatus
        };

        const result = blogPostSchema.safeParse(submissionValues);

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            const formatted = result.error.format();

            Object.keys(formatted).forEach((key) => {
                const k = key as keyof typeof formatted;
                if (k !== '_errors' && formatted[k] && '_errors' in formatted[k]!) {
                    // @ts-ignore
                    fieldErrors[key] = formatted[k]._errors[0];
                }
            });

            setErrors(fieldErrors);
            return;
        }

        setValues(submissionValues);
        await onSubmit(submissionValues);
    };

    return (
        <form className="h-[calc(100vh-10rem)] flex flex-col text-left">
            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
                <div className="grid grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="col-span-3 space-y-6">
                        {/* Basic Info Card */}
                        <div className="p-6 rounded-lg border dark:border-gray-700 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-100">Basic Information</h3>

                            <FormField label="Title" error={errors.title}>
                                <Input
                                    placeholder="Enter Title"
                                    className="dark:bg-gray-700"
                                    value={values.title}
                                    onChange={(e) => handleFieldChange("title", e.target.value)}
                                />
                            </FormField>

                            <FormField label="Slug" error={errors.slug}>
                                <Input
                                    placeholder="Enter Slug"
                                    className="dark:bg-gray-700"
                                    value={values.slug}
                                    onChange={(e) => handleFieldChange("slug", e.target.value)}
                                />
                            </FormField>
                        </div>

                        {/* Content Card */}
                        <div className="p-6 rounded-lg border dark:border-gray-700 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-100">Post Content</h3>

                            <div className="space-y-2">
                                <Label className={errors.content ? "text-destructive" : ""}>Content (Markdown)</Label>
                                <div className={errors.content ? "border border-destructive rounded-md" : "h-fit shadow"}>
                                    <ForwardRefEditor
                                        markdown={values.content}
                                        onChange={(markdown) => handleFieldChange("content", markdown)}
                                        className="min-h-[400px]"
                                    />
                                </div>
                                {errors.content && <p className="text-[0.8rem] font-medium text-destructive">{errors.content}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-1 space-y-6">
                        {/* Media Card */}
                        <div className="p-6 rounded-lg border dark:border-gray-700 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-100">Post Media</h3>

                            <FormField label="Thumbnail" error={errors.thumbnail}>
                                <ImageUpload
                                    value={values.thumbnail}
                                    onChange={(url) => handleFieldChange("thumbnail", url)}
                                    folder="blog-posts"
                                />
                            </FormField>
                        </div>

                        {/* Categorization Card */}
                        <div className="p-6 rounded-lg border dark:border-gray-700 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-100">Categorization</h3>

                            <FormField label="Tags (comma-separated)" error={errors.tags}>
                                <Input
                                    placeholder="webdev, tutorial, nextjs"
                                    className="dark:bg-gray-700"
                                    value={values.tags || ""}
                                    onChange={(e) => handleFieldChange("tags", e.target.value)}
                                />
                            </FormField>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Buttons */}
            <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-end gap-4 sticky bottom-0 bg-background">
                <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, false)}
                    variant="secondary"
                    disabled={loading}
                >
                    {loading ? "Saving..." : buttonTextMap.draft}
                </Button>

                <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={loading}
                >
                    {loading ? "Publishing..." : buttonTextMap.publish}
                </Button>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #4b5563; /* gray-600 */
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #6b7280; /* gray-500 */
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #4b5563 transparent;
                }
            `}</style>
        </form>
    );
}; export default BlogPostForm;
