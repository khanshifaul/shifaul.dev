"use client";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/lib/actions/authAPi";
import { useAppDispatch } from "@/lib/store/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const ChangePasswordForm = () => {
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();
    const [values, setValues] = useState<ChangePasswordFormValues>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const result = changePasswordSchema.safeParse(values);
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

    const handleChange = (field: keyof ChangePasswordFormValues, value: string) => {
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
            await changePassword(
                {
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                },
                dispatch
            );
            toast.success("Password changed successfully");
            setValues({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to change password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={onSubmit} className="space-y-4 max-w-md">
                <FormField
                    label="Current Password"
                    htmlFor="currentPassword"
                    error={errors.currentPassword}
                >
                    <Input
                        id="currentPassword"
                        type="password"
                        value={values.currentPassword}
                        onChange={(e) => handleChange("currentPassword", e.target.value)}
                    />
                </FormField>

                <FormField
                    label="New Password"
                    htmlFor="newPassword"
                    error={errors.newPassword}
                >
                    <Input
                        id="newPassword"
                        type="password"
                        value={values.newPassword}
                        onChange={(e) => handleChange("newPassword", e.target.value)}
                    />
                </FormField>

                <FormField
                    label="Confirm New Password"
                    htmlFor="confirmPassword"
                    error={errors.confirmPassword}
                >
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={values.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    />
                </FormField>

                <Button type="submit" disabled={loading}>
                    {loading ? "Changing..." : "Change Password"}
                </Button>
            </form>
        </div>
    );
};

export default ChangePasswordForm;
