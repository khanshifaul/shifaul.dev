"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { handleOAuthCallback } from "@/lib/actions/authAPi";
import { LuCircleCheck, LuLoader, LuCircleX } from "react-icons/lu";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function OAuthCallbackClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                if (!searchParams) {
                    throw new Error('No search parameters found');
                }

                const response = await handleOAuthCallback(searchParams, dispatch);
                setStatus('success');
                setMessage('Authentication successful! Redirecting...');

                const isAdmin = response.data.user?.roles?.includes('admin');

                setTimeout(() => {
                    if (isAdmin) {
                        router.push('/admin');
                    } else {
                        router.push('/');
                    }
                }, 2000);
            } catch (error) {
                console.error('OAuth callback error:', error);
                setStatus('error');
                setMessage(error instanceof Error ? error.message : 'Authentication failed');
            }
        };

        handleCallback();
    }, [searchParams, dispatch, router]);

    const handleRetry = () => {
        router.push('/sign-in');
    };

    const handleGoHome = () => {
        router.push('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="max-w-md w-full shadow-xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {status === 'loading' && <LuLoader className="h-12 w-12 animate-spin text-primary" />}
                        {status === 'success' && <LuCircleCheck className="h-12 w-12 text-green-600 dark:text-green-500" />}
                        {status === 'error' && <LuCircleX className="h-12 w-12 text-destructive" />}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {status === 'loading' && 'Authenticating...'}
                        {status === 'success' && 'Welcome!'}
                        {status === 'error' && 'Authentication Failed'}
                    </CardTitle>
                    <CardDescription>
                        {status === 'loading' && 'Please wait while we complete your sign-in.'}
                        {status === 'success' && 'You have been successfully authenticated.'}
                        {status === 'error' && message}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    {status === 'loading' && (
                        <p className="text-sm text-muted-foreground">
                            This may take a moment...
                        </p>
                    )}

                    {status === 'success' && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Redirecting you to your dashboard...
                            </p>
                            <Button onClick={handleGoHome} className="w-full">
                                Continue
                            </Button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                There was a problem completing your authentication.
                            </p>
                            <Button onClick={handleRetry} variant="outline" className="w-full">
                                Try Again
                            </Button>
                            <Button onClick={handleGoHome} className="w-full">
                                Go to Homepage
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
