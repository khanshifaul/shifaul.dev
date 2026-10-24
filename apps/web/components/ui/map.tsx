"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
// import dynamic from "next/dynamic"

// Dynamically import Leaflet components only on client side
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default marker icon in Next.js
const fixLeafletIcon = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    })
}

interface MapProps {
    lat: number
    lng: number
    zoom?: number
    provider?: "osm" | "google"
    className?: string
    googleApiKey?: string
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap()
    map.setView(center, zoom)
    return null
}

function OSMMap({ lat, lng, zoom = 13, className }: MapProps) {
    useEffect(() => {
        fixLeafletIcon()
    }, [])

    return (
        <MapContainer center={[lat, lng]} zoom={zoom} scrollWheelZoom={false} className={cn("h-full w-full", className)}>
            <ChangeView center={[lat, lng]} zoom={zoom} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
                <Popup>
                    We are here! <br /> Come visit us.
                </Popup>
            </Marker>
        </MapContainer>
    )
}

function GoogleMapEmbed({ lat, lng, zoom = 13, className, googleApiKey: _googleApiKey }: MapProps) {
    // Falls back to simple no-key embed if no key provided (limited functionality)
    // Or uses a proper specific place search if a key is provided.
    // For agency demo without a key, generic iframe might be safer or just a placeholder message.

    // Using unauthenticated iframe for location
    const src = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`

    return (
        <iframe
            width="100%"
            height="100%"
            className={cn("border-0", className)}
            src={src}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        />
    )
}

export default function Map(props: MapProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return (
            <div className={cn("flex items-center justify-center bg-muted animate-pulse", props.className)}>
                <span className="text-muted-foreground">Loading Map...</span>
            </div>
        )
    }

    if (props.provider === "google") {
        return <GoogleMapEmbed {...props} />
    }

    return <OSMMap {...props} />
}
