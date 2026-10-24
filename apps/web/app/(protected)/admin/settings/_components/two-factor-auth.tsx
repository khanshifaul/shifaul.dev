"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    disableTwoFactor,
    enableTwoFactor,
    generateTwoFactorSecret,
    getTwoFactorStatus,
} from "@/lib/actions/authAPi";
import { useAppDispatch } from "@/lib/store/hooks";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const TwoFactorAuth = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [setupData, setSetupData] = useState<{
        secret: string;
        qrCodeUrl: string;
        otpAuthUrl: string;
        manualEntryKey: string;
    } | null>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [showSetupDialog, setShowSetupDialog] = useState(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const { data } = await getTwoFactorStatus(dispatch);
            setIsEnabled(data.isEnabled);
        } catch (_error) {
            console.error("Failed to fetch 2FA status:", _error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnable = async () => {
        try {
            setLoading(true);
            const { data } = await generateTwoFactorSecret(dispatch);
            setSetupData(data);
            setShowSetupDialog(true);
        } catch {
            toast.error("Failed to start 2FA setup");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndEnable = async () => {
        if (!verificationCode) return;
        try {
            await enableTwoFactor({ totpCode: verificationCode }, dispatch);
            setIsEnabled(true);
            setShowSetupDialog(false);
            setSetupData(null);
            setVerificationCode("");
            toast.success("Two-factor authentication enabled");
        } catch {
            toast.error("Invalid verification code");
        }
    };

    const handleDisable = async () => {
        // For disabling, we typically require a current TOTP code or password for security.
        // Simplifying here to just toggle off for this demo, or we could prompt.
        // The API `disableTwoFactor` requires `totpCode`.
        // So we need a dialog for that too.
        toast.info("Please enter a code to disable 2FA");
        // This part requires ui flow for entering code to disable.
        // For now, I'll assume users can only enable it in this first pass or I'll add a simple prompt.
        const code = prompt("Enter your 2FA code to disable it:");
        if (!code) return;

        try {
            setLoading(true);
            await disableTwoFactor({ totpCode: code }, dispatch);
            setIsEnabled(false);
            toast.success("Two-factor authentication disabled");
        } catch {
            toast.error("Failed to disable 2FA");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading security settings...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                    Add an extra layer of security to your account.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
                <div className="space-y-1">
                    <Label className="text-base">
                        {isEnabled ? "Enabled" : "Disabled"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        {isEnabled
                            ? "Your account is secured with 2FA."
                            : "Protect your account with mobile authenticator app."}
                    </p>
                </div>
                <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => (checked ? handleEnable() : handleDisable())}
                    disabled={loading}
                />
            </CardContent>

            <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
                        <DialogDescription>
                            Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.) and enter the code below.
                        </DialogDescription>
                    </DialogHeader>

                    {setupData && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="p-4 bg-white rounded-lg">
                                <QRCodeSVG value={setupData.qrCodeUrl} size={192} />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Or enter manual key: <code className="bg-muted p-1 rounded select-all">{setupData.secret}</code>
                            </p>

                            <div className="w-full max-w-sm space-y-2">
                                <Label htmlFor="code">Verification Code</Label>
                                <Input
                                    id="code"
                                    placeholder="123456"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="text-center text-lg tracking-widest"
                                    maxLength={6}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleVerifyAndEnable} disabled={!verificationCode}>
                            Verify & Enable
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default TwoFactorAuth;
