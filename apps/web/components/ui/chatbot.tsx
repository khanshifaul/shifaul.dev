"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { FaTimes, FaPaperPlane } from "react-icons/fa"
import { cn } from "@/lib/utils"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LuMessageSquare, LuX } from "react-icons/lu"

// --- Primitives ---

const ChatbotContainer = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col w-full border rounded-xl bg-background text-foreground shadow-2xl overflow-hidden",
            className
        )}
        {...props}
    />
))
ChatbotContainer.displayName = "ChatbotContainer"

const ChatbotHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex items-center justify-between px-4 py-3 border-b bg-muted/40",
            className
        )}
        {...props}
    />
))
ChatbotHeader.displayName = "ChatbotHeader"

const ChatbotContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <ScrollArea
        ref={ref}
        className={cn("flex-1 p-4", className)}
        scrollbarSize="thin"
        {...props}
    />
))
ChatbotContent.displayName = "ChatbotContent"

const chatbotMessageVariants = cva(
    "max-w-[85%] rounded-2xl px-4 py-2 text-sm break-words shadow-sm",
    {
        variants: {
            variant: {
                user: "bg-primary text-primary-foreground rounded-br-none ml-auto",
                bot: "bg-muted text-foreground rounded-bl-none mr-auto",
            },
        },
        defaultVariants: {
            variant: "bot",
        },
    }
)

const ChatbotMessage = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof chatbotMessageVariants>
>(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        // Wrapper div for alignment if needed, but styling handles float-like behavior
        className={cn("mb-4 flex", variant === "user" ? "justify-end" : "justify-start")}
    >
        <div
            className={cn(chatbotMessageVariants({ variant }), className)}
            {...props}
        />
    </div>
))
ChatbotMessage.displayName = "ChatbotMessage"

const ChatbotFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center gap-2 p-3 border-t bg-background", className)}
        {...props}
    />
))
ChatbotFooter.displayName = "ChatbotFooter"

// --- Main Widget Component ---

export function Chatbot() {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <>
            {/* Chat Window - Fixed Position (left of dock) */}
            {isOpen && (
                <div className="fixed bottom-4 right-16 md:bottom-6 md:right-32 z-50 w-[calc(100vw-80px)] sm:w-[350px] h-[500px] max-h-[70vh] animate-in slide-in-from-right-10 fade-in duration-300">
                    <ChatbotContainer className="h-full">
                        <ChatbotHeader>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-semibold text-sm">AI Assistant</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                                <FaTimes className="h-4 w-4" />
                            </Button>
                        </ChatbotHeader>

                        <ChatbotContent>
                            <div className="flex flex-col">
                                <ChatbotMessage variant="bot">
                                    Hello! 👋 I'm your AI assistant. How can I help you build your next project?
                                </ChatbotMessage>
                                <ChatbotMessage variant="user">
                                    I need help with the new dashboard layout.
                                </ChatbotMessage>
                                <ChatbotMessage variant="bot">
                                    Sure thing! I can help you with components, layout structures, or styling. What specifically are you looking for?
                                </ChatbotMessage>
                            </div>
                        </ChatbotContent>

                        <ChatbotFooter>
                            <Input placeholder="Type a message..." className="flex-1" />
                            <Button size="icon" type="submit">
                                <FaPaperPlane className="h-4 w-4" />
                            </Button>
                        </ChatbotFooter>
                    </ChatbotContainer>
                </div >
            )
            }

            {/* Trigger Button */}
            <Button
                variant="default"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "rounded-full h-10 w-10 md:h-16 md:w-16 shadow-lg transition-all duration-300 hover:scale-110",
                    isOpen ? "bg-muted text-foreground hover:bg-muted/80" : "bg-primary text-primary-foreground"
                )}
            >
                {isOpen ? <LuX className="!h-5 !w-5 md:!h-8 md:!w-8" /> : <LuMessageSquare className="!h-5 !w-5 md:!h-8 md:!w-8" />}
            </Button>
        </>
    )
}

// Export parts if still needed by other consumers (optional, but good practice)
export {
    ChatbotContainer,
    ChatbotHeader,
    ChatbotContent,
    ChatbotMessage,
    ChatbotFooter,
}
