"use client"

import * as React from "react"
import { FaWhatsapp } from "react-icons/fa"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface WhatsAppProps {
    phoneNumber?: string
    message?: string
}

export function WhatsApp({
    phoneNumber = "1234567890", // Default placeholder
    message = "Hello! I would like to know more about your services."
}: WhatsAppProps) {
    const handleClick = () => {
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
        window.open(url, "_blank")
    }

    return (
        <Button
            variant="default"
            size="icon"
            onClick={handleClick}
            className={cn(
                "rounded-full h-10 w-10 md:h-16 md:w-16 shadow-lg transition-all duration-300 hover:scale-110",
                "bg-[#25D366] hover:bg-[#20bd5a] text-white"
            )}
            aria-label="Contact us on WhatsApp"
        >
            <FaWhatsapp className="!h-5 !w-5 md:!h-8 md:!w-8" />
        </Button>
    )
}
