import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { IconType } from "react-icons/lib";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: IconType;
    className?: string;
    loading?: boolean;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    className,
    loading,
}: StatsCardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                ) : (
                    <>
                        <div className="text-2xl font-bold">{value}</div>
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
