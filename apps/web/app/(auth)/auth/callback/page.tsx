import { Suspense } from 'react';
import OAuthCallbackClient from './callback-client';

export const dynamic = 'force-dynamic';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LuLoader } from 'react-icons/lu';


export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Card className="max-w-md w-full shadow-xl">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <LuLoader className="h-12 w-12 animate-spin text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Loading...
                        </CardTitle>
                        <CardDescription>
                            Please wait while we prepare the authentication page.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        }>
            <OAuthCallbackClient />
        </Suspense>
    );
}