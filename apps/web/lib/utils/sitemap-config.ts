/**
 * Sitemap Generator Configuration
 * Centralized configuration for sitemap generation settings
 */

import { SitemapConfig } from './sitemap-generator';

export const sitemapConfig: Record<string, SitemapConfig> = {
    // Real-time API generation (primary)
    realtime: {
        baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://shifaul.dev',
        siteName: 'Shifaul Islam',
        defaultChangefreq: 'weekly',
        defaultPriority: 0.5,
        maxUrlsPerSitemap: 1000,
        includeLastmod: true,
        includeChangefreq: true,
        includePriority: true,
        paginationEnabled: true,
        buildTime: false,
        realTime: true,
    },

    // Build-time static generation (fallback)
    buildtime: {
        baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shifaul.dev',
        siteName: 'Shifaul Islam',
        defaultChangefreq: 'weekly',
        defaultPriority: 0.5,
        maxUrlsPerSitemap: 1000,
        includeLastmod: true,
        includeChangefreq: true,
        includePriority: true,
        paginationEnabled: true,
        buildTime: true,
        realTime: false,
    },

    // Development/testing configuration
    development: {
        baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        siteName: 'Shifaul Islam (Dev)',
        defaultChangefreq: 'weekly',
        defaultPriority: 0.5,
        maxUrlsPerSitemap: 100,
        includeLastmod: true,
        includeChangefreq: true,
        includePriority: true,
        paginationEnabled: true,
        buildTime: false,
        realTime: true,
    },
};

// Default configuration based on environment
export function getDefaultConfig(): SitemapConfig {
    const env = process.env.NODE_ENV || 'development';

    switch (env) {
        case 'production':
            return sitemapConfig.realtime;
        case 'development':
            return sitemapConfig.development;
        default:
            return sitemapConfig.buildtime;
    }
}

// Content type configurations
export const contentTypeConfig = {
    blog: {
        basePriority: 0.6,
        changefreq: 'monthly' as const,
        priorityBoost: {
            popular: 0.2, // High views/reactions
            recent: 0.1,  // Recent updates
            featured: 0.15 // Featured content
        }
    },
    portfolio: {
        basePriority: 0.7,
        changefreq: 'yearly' as const,
        priorityBoost: {
            recent: 0.1,  // Recent work
            featured: 0.15 // Showcase projects
        }
    },
    static: {
        homepage: {
            priority: 1.0,
            changefreq: 'weekly' as const
        },
        about: {
            priority: 0.8,
            changefreq: 'monthly' as const
        },
        contact: {
            priority: 0.7,
            changefreq: 'yearly' as const
        }
    }
};

// API endpoints configuration
export const apiEndpoints = {
    blogPosts: '/api/blog-posts/public',
    portfolio: '/api/projects/public',
    sitemap: '/api/sitemap',
    sitemapPaginated: '/api/sitemap/paginated',
    sitemapIndividual: '/api/sitemap'
};

// Pagination settings
export const paginationConfig = {
    defaultMaxUrls: 1000,
    maxSitemaps: 50000, // Maximum sitemaps in index
    urlPerSitemap: {
        small: 100,
        medium: 1000,
        large: 5000
    }
};

// Validation rules
export const validationConfig = {
    maxUrlLength: 2048,
    allowedChangefreq: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'],
    priorityRange: [0.0, 1.0],
    requiredFields: ['loc'],
    optionalFields: ['lastmod', 'changefreq', 'priority']
};

// Cache configuration
export const cacheConfig = {
    defaultTtl: 3600, // 1 hour in seconds
    maxAge: 86400,    // 24 hours in seconds
    revalidate: 300   // 5 minutes in seconds
};

// Export all configurations
export type { SitemapConfig } from './sitemap-generator';

