"use client";

import { MultiSelectCombobox, Option } from "@/components/common/MultiSelectCombobox";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { ImageUpload } from "@/components/common/ImageUpload";
import { LuPlus, LuX } from "react-icons/lu";

// Options for the comboboxes
const serviceOptions: Option[] = [
    { value: "design", label: "Design" },
    { value: "development", label: "Development" },
    { value: "consulting", label: "Consulting" },
    { value: "marketing", label: "Marketing" },
    { value: "seo", label: "SEO" },
];

const technologyOptions: Option[] = [
    { value: "react", label: "React" },
    { value: "next.js", label: "Next.js" },
    { value: "graphql", label: "GraphQL" },
    { value: "node.js", label: "Node.js" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "tailwindcss", label: "Tailwind CSS" },
    { value: "postgresql", label: "PostgreSQL" },
];

export const projectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    client: z.string().min(1, "Client is required"),
    logo: z.string().min(1, "Logo URL is required"),
    services: z.array(z.string()).nonempty("At least one service is required"),
    technologies: z.array(z.string()).nonempty("At least one technology is required"),
    website: z.string().min(1, "Website URL is required"),
    thumbnail: z.string().min(1, "Thumbnail URL is required"),
    about: z.string().min(1, "About is required"),
    goal: z.string().min(1, "Goal is required"),
    execution: z.string().min(1, "Execution is required"),
    results: z.string().min(1, "Results are required"),
    goalImages: z
        .array(z.object({ url: z.string().min(1, "Image URL is required") }))
        .min(1, "At least one goal image is required"),
    resultImages: z
        .array(z.object({ url: z.string().min(1, "Image URL is required") }))
        .min(1, "At least one result image is required"),
});

export type ProjectFormInput = z.infer<typeof projectSchema>;

interface ProjectFormProps {
    initialData?: ProjectFormInput;
    onSubmit: (data: ProjectFormInput) => Promise<void>;
    loading?: boolean;
    buttonText?: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
    initialData,
    onSubmit,
    loading = false,
    buttonText = "Submit",
}) => {
    const [values, setValues] = useState<ProjectFormInput>(
        initialData || {
            title: "",
            subtitle: "",
            client: "",
            logo: "",
            services: [],
            technologies: [],
            website: "",
            thumbnail: "",
            about: "",
            goal: "",
            execution: "",
            results: "",
            goalImages: [{ url: "" }],
            resultImages: [{ url: "" }],
        }
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setValues(initialData);
        }
    }, [initialData]);

    const validate = () => {
        const result = projectSchema.safeParse(values);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            const formatted = result.error.format();
            const extractError = (err: any) => err?._errors?.[0];

            if (formatted.title) fieldErrors.title = extractError(formatted.title);
            if (formatted.client) fieldErrors.client = extractError(formatted.client);
            if (formatted.logo) fieldErrors.logo = extractError(formatted.logo);
            if (formatted.services) fieldErrors.services = extractError(formatted.services);
            if (formatted.technologies) fieldErrors.technologies = extractError(formatted.technologies);
            if (formatted.website) fieldErrors.website = extractError(formatted.website);
            if (formatted.thumbnail) fieldErrors.thumbnail = extractError(formatted.thumbnail);
            if (formatted.about) fieldErrors.about = extractError(formatted.about);
            if (formatted.goal) fieldErrors.goal = extractError(formatted.goal);
            if (formatted.execution) fieldErrors.execution = extractError(formatted.execution);
            if (formatted.results) fieldErrors.results = extractError(formatted.results);
            if (formatted.goalImages?._errors) fieldErrors.goalImages = extractError(formatted.goalImages);
            if (formatted.resultImages?._errors) fieldErrors.resultImages = extractError(formatted.resultImages);

            setErrors(fieldErrors);
            return false;
        }
        setErrors({});
        return true;
    };

    const handleChange = (field: keyof ProjectFormInput, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const addGoalImage = () => {
        setValues(prev => ({ ...prev, goalImages: [...prev.goalImages, { url: "" }] }));
    };

    const removeGoalImage = (index: number) => {
        setValues(prev => ({
            ...prev,
            goalImages: prev.goalImages.filter((_, i) => i !== index)
        }));
    };

    const updateGoalImage = (index: number, url: string) => {
        setValues(prev => {
            const newImages = [...prev.goalImages];
            newImages[index] = { url };
            return { ...prev, goalImages: newImages };
        });
    };

    const addResultImage = () => {
        setValues(prev => ({ ...prev, resultImages: [...prev.resultImages, { url: "" }] }));
    };

    const removeResultImage = (index: number) => {
        setValues(prev => ({
            ...prev,
            resultImages: prev.resultImages.filter((_, i) => i !== index)
        }));
    };

    const updateResultImage = (index: number, url: string) => {
        setValues(prev => {
            const newImages = [...prev.resultImages];
            newImages[index] = { url };
            return { ...prev, resultImages: newImages };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        await onSubmit(values);
    };

    return (
        <form onSubmit={handleSubmit} className="h-[calc(100vh-10rem)] flex flex-col text-left">
            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
                <div className="grid grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="col-span-3 space-y-6">
                        {/* Basic Info Card */}
                        <div className="p-6 rounded-lg border dark:border-gray-700 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-100">Basic Information</h3>

                            <FormField label="Title" error={errors.title}>
                                <Input
                                    placeholder="Project Title"
                                    className="dark:bg-gray-700"
                                    value={values.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                />
                            </FormField>

                            <FormField label="Subtitle">
                                <Input
                                    placeholder="Project Subtitle"
                                    className="dark:bg-gray-700"
                                    value={values.subtitle || ''}
                                    onChange={(e) => handleChange("subtitle", e.target.value)}
                                />
                            </FormField>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Client" error={errors.client}>
                                    <Input
                                        placeholder="Client Name"
                                        className="dark:bg-gray-700"
                                        value={values.client}
                                        onChange={(e) => handleChange("client", e.target.value)}
                                    />
                                </FormField>

                                <FormField label="Website URL" error={errors.website}>
                                    <Input
                                        placeholder="https://example.com"
                                        className="dark:bg-gray-700"
                                        value={values.website}
                                        onChange={(e) => handleChange("website", e.target.value)}
                                    />
                                </FormField>
                            </div>
                        </div>

                        {/* Project Details Card */}
                        <div className="p-6 rounded-lg border dark:border-gray-700 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-100">Project Details</h3>


                            <div className="space-y-4">
                                <FormField label="About" error={errors.about}>
                                    <Textarea
                                        placeholder="About project"
                                        rows={5}
                                        className="dark:bg-gray-700"
                                        value={values.about}
                                        onChange={(e) => handleChange("about", e.target.value)}
                                    />
                                </FormField>

                                <FormField label="Goal" error={errors.goal}>
                                    <Textarea
                                        placeholder="Project goal"
                                        rows={5}
                                        className="dark:bg-gray-700"
                                        value={values.goal}
                                        onChange={(e) => handleChange("goal", e.target.value)}
                                    />
                                </FormField>
                            </div>

                            <div className="space-y-4">
                                <FormField label="Execution" error={errors.execution}>
                                    <Textarea
                                        placeholder="Execution details"
                                        rows={5}
                                        className="dark:bg-gray-700"
                                        value={values.execution}
                                        onChange={(e) => handleChange("execution", e.target.value)}
                                    />
                                </FormField>

                                <FormField label="Results" error={errors.results}>
                                    <Textarea
                                        placeholder="Results"
                                        rows={5}
                                        className="dark:bg-gray-700"
                                        value={values.results}
                                        onChange={(e) => handleChange("results", e.target.value)}
                                    />
                                </FormField>
                            </div>

                        </div>

                        {/* Images Card */}
                        <div className="p-6 rounded-lg border dark:border-gray-700 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-100">Project Images</h3>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Goal Images */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-base font-semibold">Goal Images</Label>
                                        <Button
                                            type="button"
                                            onClick={addGoalImage}
                                            className="flex items-center gap-1"
                                            size="sm"
                                            variant="outline"
                                        >
                                            <LuPlus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {values.goalImages.map((img, index) => (
                                            <div key={index} className="relative">
                                                <ImageUpload
                                                    value={img.url}
                                                    onChange={(url) => updateGoalImage(index, url)}
                                                    folder="projects/goals"
                                                />
                                                {values.goalImages.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeGoalImage(index)}
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90"
                                                        size="icon"
                                                    >
                                                        <LuX className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.goalImages && <p className="text-[0.8rem] font-medium text-destructive">{errors.goalImages}</p>}
                                </div>

                                {/* Result Images */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-base font-semibold">Result Images</Label>
                                        <Button
                                            type="button"
                                            onClick={addResultImage}
                                            className="flex items-center gap-1"
                                            size="sm"
                                            variant="outline"
                                        >
                                            <LuPlus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {values.resultImages.map((img, index) => (
                                            <div key={index} className="relative">
                                                <ImageUpload
                                                    value={img.url}
                                                    onChange={(url) => updateResultImage(index, url)}
                                                    folder="projects/results"
                                                />
                                                {values.resultImages.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeResultImage(index)}
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90"
                                                        size="icon"
                                                    >
                                                        <LuX className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.resultImages && <p className="text-[0.8rem] font-medium text-destructive">{errors.resultImages}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-1 space-y-6">
                        {/* Media Card */}
                        <div className="p-6 rounded-lg border dark:border-gray-700 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-100">Project Media</h3>

                            <FormField label="Thumbnail" error={errors.thumbnail}>
                                <ImageUpload
                                    value={values.thumbnail}
                                    onChange={(url) => handleChange("thumbnail", url)}
                                    folder="projects/thumbnails"
                                />
                            </FormField>

                            <FormField label="Logo" error={errors.logo}>
                                <ImageUpload
                                    value={values.logo}
                                    onChange={(url) => handleChange("logo", url)}
                                    folder="projects/logos"
                                />
                            </FormField>
                        </div>

                        {/* Categorization Card */}
                        <div className="p-6 rounded-lg border dark:border-gray-700 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-gray-100">Categorization</h3>

                            <div className="grid space-y-2">
                                <Label className={errors.services ? "text-destructive" : ""}>Services</Label>
                                <MultiSelectCombobox
                                    options={serviceOptions}
                                    selected={values.services}
                                    onSelectedChange={(val) => handleChange("services", val)}
                                    placeholder="Select services..."
                                />
                                {errors.services && <p className="text-[0.8rem] font-medium text-destructive">{errors.services}</p>}
                            </div>

                            <div className="grid space-y-2">
                                <Label className={errors.technologies ? "text-destructive" : ""}>Technologies</Label>
                                <MultiSelectCombobox
                                    options={technologyOptions}
                                    selected={values.technologies}
                                    onSelectedChange={(val) => handleChange("technologies", val)}
                                    placeholder="Select technologies..."
                                />
                                {errors.technologies && <p className="text-[0.8rem] font-medium text-destructive">{errors.technologies}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Buttons */}
            <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-end gap-4 sticky bottom-0 bg-background">
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading ? "Saving..." : buttonText}
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
}; export default ProjectForm;
