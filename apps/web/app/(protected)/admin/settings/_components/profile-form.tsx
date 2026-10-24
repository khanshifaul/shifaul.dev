"use client";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/lib/actions/authAPi";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppDispatch } from "@/lib/store/hooks";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

const profileFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileForm = () => {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState<ProfileFormValues>({
        name: "",
        email: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            setValues({
                name: user.name || "",
                email: user.email || "",
            });
        }
    }, [user]);

    const validate = () => {
        const result = profileFormSchema.safeParse(values);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((err) => {
                if (err.path[0]) {
                    fieldErrors[err.path[0] as string] = err.message;
                }
            });
            setErrors(fieldErrors);
            return false;
        }
        setErrors({});
        return true;
    };

    const handleChange = (field: keyof ProfileFormValues, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await updateProfile({ name: values.name }, dispatch);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update profile"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <form onSubmit={onSubmit} className="space-y-4 max-w-md">
                <FormField
                    label="Name"
                    htmlFor="name"
                    description="This is the name that will be displayed on your profile and in emails."
                    error={errors.name}
                >
                    <Input
                        id="name"
                        placeholder="Your name"
                        value={values.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                    />
                </FormField>

                <FormField
                    label="Email"
                    htmlFor="email"
                    description="You cannot change your email address here. Please contact support."
                >
                    <Input
                        id="email"
                        placeholder="Email"
                        value={values.email || ""}
                        disabled
                    />
                </FormField>

                <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Profile"}
                </Button>
            </form>
        </div>
    );
};

export default ProfileForm;
