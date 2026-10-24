"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, className, ...props }, ref) => {
    if (React.isValidElement(children)) {
      const child = children as React.ReactElement<any>;

      const mergedProps: Record<string, any> = { ...props };
      if (className) {
        mergedProps.className = className;
      }

      for (const propName in child.props) {
        const slotPropValue = mergedProps[propName];
        const childPropValue = child.props[propName];

        if (
          /^on[A-Z]/.test(propName) &&
          typeof slotPropValue === "function" &&
          typeof childPropValue === "function"
        ) {
          mergedProps[propName] = (...args: any[]) => {
            childPropValue(...args);
            if (!args[0]?.defaultPrevented) {
              slotPropValue(...args);
            }
          };
        } else if (propName === "style") {
          mergedProps[propName] = { ...slotPropValue, ...childPropValue };
        } else if (propName === "className") {
          mergedProps[propName] = cn(slotPropValue, childPropValue);
        } else {
          mergedProps[propName] = childPropValue;
        }
      }

      return React.cloneElement(child, {
        ...mergedProps,
        ref: (node: HTMLElement | null) => {
          // Handle both function and object refs for the forwarded ref
          if (typeof ref === "function") {
            ref(node);
          } else if (ref && "current" in ref) {
            (ref as any).current = node;
          }

          // Handle the child's existing ref
          const childRef = (child as any).ref;
          if (typeof childRef === "function") {
            childRef(node);
          } else if (childRef && "current" in childRef) {
            (childRef as any).current = node;
          }
        },
      });
    }

    return null;
  },
);

Slot.displayName = "Slot";

export { Slot };
