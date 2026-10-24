"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import React from "react";

// Define the type for the message prop
interface Message {
  subject: string;
  name: string;
  email: string;
  message: string;
}

interface MessageSheetProps {
  message: Message | null;
  onClose: () => void;
}

const MessageSheet: React.FC<MessageSheetProps> = ({ message, onClose }) => {
  return (
    <Sheet open={!!message} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{message?.subject}</SheetTitle>
          <SheetDescription>
            From: {message?.name} ({message?.email})
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p>{message?.message}</p>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" onClick={onClose}>
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MessageSheet;
