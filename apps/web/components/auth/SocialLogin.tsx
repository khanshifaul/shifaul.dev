"use client";

import { Button } from "@/components/ui/button";
import { initiateGitHubAuth, initiateGoogleAuth } from "@/lib/actions/authAPi";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function SocialLogin() {
    return (
        <div className="w-full grid grid-cols-2 gap-2 mb-6">
            <Button
                variant="outline"
                className="w-full gap-2 cursor-pointer transition-all"
                onClick={initiateGoogleAuth}
                type="button"
            >
                <FcGoogle /> Continue with Google
            </Button>

            <Button
                variant="outline"
                className="w-full gap-2 cursor-pointer transition-all"
                onClick={initiateGitHubAuth}
                type="button"
            >
                <FaGithub /> Continue with GitHub
            </Button>
        </div>
    );
}
