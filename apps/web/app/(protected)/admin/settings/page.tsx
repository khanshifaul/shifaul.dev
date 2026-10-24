"use client";

import ChangePasswordForm from "./_components/change-password-form";
import ProfileForm from "./_components/profile-form";
import TwoFactorAuth from "./_components/two-factor-auth";

const SettingsPage = () => {
    return (
        <div className="w-full space-y-6">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="grid gap-6">
                <ProfileForm />
                <ChangePasswordForm />
                <TwoFactorAuth />
            </div>
        </div>
    );
};

export default SettingsPage;
