import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Route definitions
const PUBLIC_ROUTES = [
    '/',
    '/about',
    '/contact',
    '/portfolio',
    '/blog',
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/resume',
    '/robots.txt',
    '/sitemap.xml',
    '/favicon.ico',
    '/icons/',
    '/images/',
    '/fonts/'
]

const ADMIN_ROUTES = ['/admin']
const PROTECTED_USER_ROUTES = ['/dashboard', '/profile', '/settings']

// Helper function to check if path matches any route patterns
const matchesRoutePatterns = (pathname: string, patterns: string[]): boolean => {
    return patterns.some(pattern => {
        if (pattern.endsWith('/')) {
            return pathname.startsWith(pattern)
        }
        return pathname === pattern || pathname.startsWith(pattern + '/')
    })
}

// Simple JWT decode function (client-side only)
const decodeJWT = (token: string): any | null => {
    try {
        const payload = token.split('.')[1]
        const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/')
        const decodedPayload = atob(base64Payload)
        return JSON.parse(decodedPayload)
    } catch (error) {
        console.error('Failed to decode JWT:', error)
        return null
    }
}

// Check if user has admin role
const hasAdminRole = (userData: any): boolean => {
    if (!userData) return false
    return userData.roles?.includes('admin') || userData.role === 'admin'
}

// Main proxy function for Next.js 16
export async function proxy(request: NextRequest) {
    const { pathname, search: _search } = request.nextUrl

    // Allow OAuth callbacks and static assets
    if (pathname.startsWith('/api/auth/callback') ||
        pathname.includes('.') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/public/')) {
        return NextResponse.next()
    }

    // Public routes - allow access
    if (matchesRoutePatterns(pathname, PUBLIC_ROUTES)) {
        return NextResponse.next()
    }

    // Root path handling
    if (pathname === '/') {
        // For now, allow access to home page
        // Client-side component will handle auth state and redirect if needed
        return NextResponse.next()
    }

    // Admin routes protection
    if (matchesRoutePatterns(pathname, ADMIN_ROUTES)) {
        // Since we can't access localStorage/sessionStorage from middleware,
        // we'll add headers to help client-side auth check
        const response = NextResponse.next()
        response.headers.set('x-requires-auth', 'true')
        response.headers.set('x-required-role', 'admin')
        return response
    }

    // Protected user routes (require any authentication)
    if (matchesRoutePatterns(pathname, PROTECTED_USER_ROUTES)) {
        const response = NextResponse.next()
        response.headers.set('x-requires-auth', 'true')
        return response
    }

    // Allow access for all other routes
    return NextResponse.next()
}

// Alternative: Client-side middleware helper
export const authHelpers = {
    // Check if route is public
    isPublicRoute: (pathname: string): boolean => {
        return matchesRoutePatterns(pathname, PUBLIC_ROUTES)
    },

    // Check if route requires admin
    isAdminRoute: (pathname: string): boolean => {
        return matchesRoutePatterns(pathname, ADMIN_ROUTES)
    },

    // Check if route requires authentication
    isProtectedRoute: (pathname: string): boolean => {
        return matchesRoutePatterns(pathname, [...PROTECTED_USER_ROUTES, ...ADMIN_ROUTES])
    },

    // Client-side auth check using localStorage/sessionStorage
    checkAuth: () => {
        if (typeof window === 'undefined') return { isAuthenticated: false, user: null }

        const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
        if (!accessToken) return { isAuthenticated: false, user: null }

        try {
            const decodedToken = decodeJWT(accessToken)
            if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
                return {
                    isAuthenticated: true,
                    user: decodedToken,
                    token: accessToken
                }
            }
            return { isAuthenticated: false, user: null }
        } catch (error) {
            console.error('Auth check error:', error)
            return { isAuthenticated: false, user: null }
        }
    },

    // Check if user has required role
    hasRole: (_requiredRole: string): boolean => {
        if (typeof window === 'undefined') return false

        const authData = authHelpers.checkAuth()
        if (!authData.isAuthenticated) return false

        return hasAdminRole(authData.user)
    }
}

// Export the proxy configuration
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - robots.txt
         */
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)',
    ],
}
