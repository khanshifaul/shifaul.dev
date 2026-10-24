import { Suspense } from 'react';
import ResetPasswordClient from './reset-password-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md shadow-xl rounded-2xl">
                    <CardHeader className="flex flex-col items-center space-y-4 p-4">
                        <CardTitle className="text-3xl font-bold text-foreground">
                            Reset Password
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-center text-muted-foreground">Loading reset page...</p>
                        <div className="flex justify-center mt-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        }>
            <ResetPasswordClient />
        </Suspense>
    );
}
