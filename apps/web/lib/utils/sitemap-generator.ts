/**
 * Comprehensive Sitemap Generator Utility
 * Supports real-time API generation, build-time fallback, pagination, and SEO optimization
 */

import { getPublicBlogPosts } from '@/lib/actions/blogApi';
import { getPublicProjects } from '@/lib/actions/projectsApi';

export interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

export interface SitemapConfig {
    baseUrl: string;
    siteName: string;
    defaultChangefreq: SitemapUrl['changefreq'];
    defaultPriority: number;
    maxUrlsPerSitemap: number;
    includeLastmod: boolean;
    includeChangefreq: boolean;
    includePriority: boolean;
    paginationEnabled: boolean;
    buildTime: boolean;
    realTime: boolean;
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    published: boolean;
    createdAt: string;
    updatedAt: string;
    views?: number;
    reactions?: number;
}

export interface PortfolioItem {
    id: string;
    slug: string;
    title: string;
    published?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SitemapGenerationResult {
    success: boolean;
    sitemap?: string;
    sitemaps?: string[]; // For pagination
    sitemapIndex?: string; // For multiple sitemaps
    totalUrls: number;
    generatedAt: string;
    errors?: string[];
}

export class SitemapGenerator {
    private config: SitemapConfig;
    private baseUrls: SitemapUrl[] = [
        {
            loc: '',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: 1.0
        },
        {
            loc: '/about',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.8
        },
        {
            loc: '/portfolio',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'daily',
            priority: 0.8
        },
        {
            loc: '/blog',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'daily',
            priority: 0.8
        },
        {
            loc: '/contact',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'yearly',
            priority: 0.7
        }
    ];

    constructor(config: Partial<SitemapConfig> = {}) {
        this.config = {
            baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shifaul.dev',
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
            ...config
        };
    }

    /**
     * Generate sitemap XML from all configured sources
     */
    async generateSitemap(): Promise<SitemapGenerationResult> {
        const errors: string[] = [];
        const startTime = Date.now();

        try {
            // Collect all URLs
            const allUrls = await this.getAllUrls();

            // Generate sitemap XML
            const sitemapResult = this.formatSitemapXml(allUrls);

            if (!sitemapResult.success) {
                errors.push(...sitemapResult.errors || []);
            }

            const result: SitemapGenerationResult = {
                success: errors.length === 0,
                sitemap: sitemapResult.sitemap,
                totalUrls: allUrls.length,
                generatedAt: new Date().toISOString(),
                errors: errors.length > 0 ? errors : undefined
            };

            console.log(`Sitemap generation completed in ${Date.now() - startTime}ms with ${allUrls.length} URLs`);
            return result;

        } catch (error) {
            const errorMsg = `Sitemap generation failed: ${error}`;
            console.error(errorMsg);
            return {
                success: false,
                totalUrls: 0,
                generatedAt: new Date().toISOString(),
                errors: [errorMsg]
            };
        }
    }

    /**
     * Generate sitemap with pagination support
     */
    async generatePaginatedSitemap(): Promise<SitemapGenerationResult> {
        const errors: string[] = [];
        const startTime = Date.now();

        try {
            // Collect all URLs
            const allUrls = await this.getAllUrls();

            // Check if pagination is needed
            if (allUrls.length <= this.config.maxUrlsPerSitemap) {
                // Single sitemap
                const sitemapResult = this.formatSitemapXml(allUrls);
                return {
                    success: errors.length === 0,
                    sitemap: sitemapResult.sitemap,
                    totalUrls: allUrls.length,
                    generatedAt: new Date().toISOString(),
                    errors: errors.length > 0 ? errors : undefined
                };
            }

            // Multiple sitemaps with index
            const sitemapParts = this.paginateUrls(allUrls);
            const sitemapFiles: string[] = [];

            for (let i = 0; i < sitemapParts.length; i++) {
                const sitemapResult = this.formatSitemapXml(sitemapParts[i]);
                if (sitemapResult.sitemap) {
                    sitemapFiles.push(sitemapResult.sitemap);
                }
            }

            // Generate sitemap index
            const sitemapIndex = this.generateSitemapIndex(sitemapFiles);

            console.log(`Paginated sitemap generation completed in ${Date.now() - startTime}ms with ${sitemapFiles.length} sitemap files`);

            return {
                success: errors.length === 0,
                sitemaps: sitemapFiles,
                sitemapIndex,
                totalUrls: allUrls.length,
                generatedAt: new Date().toISOString(),
                errors: errors.length > 0 ? errors : undefined
            };

        } catch (error) {
            const errorMsg = `Paginated sitemap generation failed: ${error}`;
            console.error(errorMsg);
            return {
                success: false,
                totalUrls: 0,
                generatedAt: new Date().toISOString(),
                errors: [errorMsg]
            };
        }
    }

    /**
     * Get all URLs (public method for external access)
     */
    async getAllUrls(): Promise<SitemapUrl[]> {
        const allUrls: SitemapUrl[] = [...this.baseUrls];

        // Add blog posts
        if (this.config.realTime) {
            try {
                const blogUrls = await this.generateBlogPostUrls();
                allUrls.push(...blogUrls);
            } catch (error) {
                console.error('Failed to generate blog post URLs:', error);
            }
        }

        // Add portfolio items
        if (this.config.realTime) {
            try {
                const portfolioUrls = await this.generatePortfolioUrls();
                allUrls.push(...portfolioUrls);
            } catch (error) {
                console.error('Failed to generate portfolio URLs:', error);
            }
        }

        return allUrls;
    }

    /**
     * Generate URLs for blog posts
     */
    private async generateBlogPostUrls(): Promise<SitemapUrl[]> {
        const urls: SitemapUrl[] = [];
        const limit = 100;
        let page = 1;

        try {
            // First fetch to get pagination info
            const firstResponse = await getPublicBlogPosts({ page, limit });

            if (!firstResponse.data || !firstResponse.data.success || !firstResponse.data.data) {
                throw new Error('Invalid response from blog API');
            }

            const allPosts: BlogPost[] = [...firstResponse.data.data];
            const pagination = firstResponse.data.pagination;

            // Fetch remaining pages if any
            if (pagination && pagination.totalPages > 1) {
                const pendingPromises: Promise<any>[] = [];

                for (let p = 2; p <= pagination.totalPages; p++) {
                    pendingPromises.push(getPublicBlogPosts({ page: p, limit }));
                }

                if (pendingPromises.length > 0) {
                    const responses = await Promise.all(pendingPromises);
                    responses.forEach(res => {
                        if (res.data && res.data.success && res.data.data) {
                            allPosts.push(...res.data.data);
                        }
                    });
                }
            }

            for (const post of allPosts) {
                if (!post.published) continue; // Skip unpublished posts

                const url: SitemapUrl = {
                    loc: `/blog/${post.slug}`,
                    lastmod: this.config.includeLastmod ? this.formatDate(post.updatedAt) : undefined,
                    changefreq: this.calculateBlogPostChangefreq(post),
                    priority: this.calculateBlogPostPriority(post)
                };

                // Validate URL accessibility
                const fullUrl = `${this.config.baseUrl}${url.loc}`;
                const isAccessible = await this.validateUrl(fullUrl);

                if (isAccessible) {
                    urls.push(url);
                }
            }

            console.log(`Generated ${urls.length} blog post URLs from ${allPosts.length} posts`);
            return urls;

        } catch (error) {
            console.warn('Error generating blog post URLs (skipping):', error);
            // Return empty array instead of throwing to allow build to succeed
            return [];
        }
    }

    /**
     * Generate URLs for portfolio items
     */
    private async generatePortfolioUrls(): Promise<SitemapUrl[]> {
        const urls: SitemapUrl[] = [];
        const limit = 100;
        let page = 1;

        try {
            // Use direct server function call instead of fetch
            const firstResponse = await getPublicProjects({ page, limit });

            if (!firstResponse.data || !firstResponse.data.success || !firstResponse.data.data) {
                throw new Error('Invalid response from portfolio API');
            }

            const allItems: PortfolioItem[] = [...firstResponse.data.data];
            const pagination = firstResponse.data.pagination;

            // Fetch remaining pages if any
            if (pagination && pagination.totalPages > 1) {
                const pendingPromises: Promise<any>[] = [];

                for (let p = 2; p <= pagination.totalPages; p++) {
                    pendingPromises.push(getPublicProjects({ page: p, limit }));
                }

                if (pendingPromises.length > 0) {
                    const responses = await Promise.all(pendingPromises);
                    responses.forEach(res => {
                        if (res.data && res.data.success && res.data.data) {
                            allItems.push(...res.data.data);
                        }
                    });
                }
            }

            for (const item of allItems) {
                if (item.published === false) continue; // Skip unpublished items

                const url: SitemapUrl = {
                    loc: `/portfolio/${item.slug}`,
                    lastmod: this.config.includeLastmod ? this.formatDate(item.updatedAt) : undefined,
                    changefreq: this.calculatePortfolioChangefreq(item),
                    priority: this.calculatePortfolioPriority(item)
                };

                // Validate URL accessibility
                const fullUrl = `${this.config.baseUrl}${url.loc}`;
                const isAccessible = await this.validateUrl(fullUrl);

                if (isAccessible) {
                    urls.push(url);
                }
            }

            console.log(`Generated ${urls.length} portfolio URLs from ${allItems.length} items`);
            return urls;

        } catch (error) {
            console.warn('Error generating portfolio URLs (skipping):', error);
            // Return empty array instead of throwing
            return [];
        }
    }

    /**
     * Format URLs into XML sitemap
     */
    private formatSitemapXml(urls: SitemapUrl[]): { success: boolean; sitemap?: string; errors?: string[] } {
        const errors: string[] = [];

        try {
            if (urls.length === 0) {
                return { success: false, errors: ['No URLs to generate sitemap'] };
            }

            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

            for (const url of urls) {
                xml += '    <url>\n';
                xml += `        <loc>${this.escapeXml(`${this.config.baseUrl}${url.loc}`)}</loc>\n`;

                if (this.config.includeLastmod && url.lastmod) {
                    xml += `        <lastmod>${this.escapeXml(url.lastmod)}</lastmod>\n`;
                }

                if (this.config.includeChangefreq && url.changefreq) {
                    xml += `        <changefreq>${this.escapeXml(url.changefreq)}</changefreq>\n`;
                }

                if (this.config.includePriority && url.priority !== undefined) {
                    xml += `        <priority>${url.priority.toFixed(1)}</priority>\n`;
                }

                xml += '    </url>\n';
            }

            xml += '</urlset>';

            // Basic XML validation
            if (!xml.includes('<loc>') || !xml.includes('</urlset>')) {
                errors.push('Generated XML is invalid');
                return { success: false, errors };
            }

            return { success: true, sitemap: xml };

        } catch (error) {
            const errorMsg = `XML formatting failed: ${error}`;
            errors.push(errorMsg);
            console.error(errorMsg);
            return { success: false, errors };
        }
    }

    /**
     * Generate sitemap index for multiple sitemaps
     */
    private generateSitemapIndex(sitemapFiles: string[]): string {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        const today = new Date().toISOString().split('T')[0];

        sitemapFiles.forEach((_, index) => {
            xml += '    <sitemap>\n';
            xml += `        <loc>${this.config.baseUrl}/sitemap-${index + 1}.xml</loc>\n`;
            xml += `        <lastmod>${today}</lastmod>\n`;
            xml += '    </sitemap>\n';
        });

        xml += '</sitemapindex>';
        return xml;
    }

    /**
     * Paginate URLs into chunks
     */
    private paginateUrls(urls: SitemapUrl[]): SitemapUrl[][] {
        const chunks: SitemapUrl[][] = [];
        for (let i = 0; i < urls.length; i += this.config.maxUrlsPerSitemap) {
            chunks.push(urls.slice(i, i + this.config.maxUrlsPerSitemap));
        }
        return chunks;
    }

    /**
     * Calculate blog post changefreq based on engagement metrics
     */
    private calculateBlogPostChangefreq(post: BlogPost): SitemapUrl['changefreq'] {
        // New posts get higher update frequency
        const daysSinceUpdate = this.getDaysSince(post.updatedAt);
        const views = post.views || 0;
        const reactions = post.reactions || 0;

        if (daysSinceUpdate < 7) return 'weekly';
        if (daysSinceUpdate < 30) return 'monthly';
        if (views > 1000 || reactions > 50) return 'monthly';
        return 'yearly';
    }

    /**
     * Calculate blog post priority based on engagement
     */
    private calculateBlogPostPriority(post: BlogPost): number {
        const views = post.views || 0;
        const reactions = post.reactions || 0;
        const daysSinceUpdate = this.getDaysSince(post.updatedAt);

        let priority = 0.6; // Base priority

        // Boost for popular content
        if (views > 2000) priority += 0.2;
        else if (views > 500) priority += 0.1;

        if (reactions > 100) priority += 0.1;
        else if (reactions > 20) priority += 0.05;

        // Boost for recent content
        if (daysSinceUpdate < 30) priority += 0.1;
        else if (daysSinceUpdate < 90) priority += 0.05;

        return Math.min(priority, 1.0);
    }

    /**
     * Calculate portfolio changefreq
     */
    private calculatePortfolioChangefreq(item: PortfolioItem): SitemapUrl['changefreq'] {
        const daysSinceUpdate = this.getDaysSince(item.updatedAt);

        if (daysSinceUpdate < 30) return 'monthly';
        if (daysSinceUpdate < 180) return 'yearly';
        return 'yearly';
    }

    /**
     * Calculate portfolio priority
     */
    private calculatePortfolioPriority(item: PortfolioItem): number {
        const daysSinceUpdate = this.getDaysSince(item.updatedAt);

        let priority = 0.7; // Base priority for portfolio items

        // Boost for recent work
        if (daysSinceUpdate < 30) priority += 0.1;
        else if (daysSinceUpdate < 90) priority += 0.05;

        return Math.min(priority, 1.0);
    }

    /**
     * Validate URL accessibility
     */
    private async validateUrl(url: string): Promise<boolean> {
        try {
            // If validating internal URL during build, skip fetch or use internal check
            // For now, simple fetch but with proper error handling
            if (!url.startsWith('http')) return true; // Relative URLs valid

            const response = await fetch(url, {
                method: 'HEAD',
                next: { revalidate: 3600 }
            });
            return response.ok;
        } catch (error) {
            console.warn(`URL validation failed for ${url}:`, error);
            return false;
        }
    }

    /**
     * Format date to YYYY-MM-DD
     */
    private formatDate(dateString: string): string {
        return new Date(dateString).toISOString().split('T')[0];
    }

    /**
     * Calculate days since a date
     */
    private getDaysSince(dateString: string): number {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Escape XML special characters
     */
    private escapeXml(text: string): string {
        return text
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, "'")
    }

    /**
     * Get configuration
     */
    getConfig(): SitemapConfig {
        return { ...this.config };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<SitemapConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
}