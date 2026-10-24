"use client";

import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/5",
        className,
      )}
      {...props}
    >
      {Icon && (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mt-2 mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
