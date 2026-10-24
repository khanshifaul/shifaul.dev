import { SitemapGenerator } from '@/lib/utils/sitemap-generator';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Initialize sitemap generator with pagination enabled
        const generator = new SitemapGenerator({
            realTime: true,
            buildTime: false,
            includeLastmod: true,
            includeChangefreq: true,
            includePriority: true,
            paginationEnabled: true,
            maxUrlsPerSitemap: 1000
        });

        // Generate the paginated sitemap
        const result = await generator.generatePaginatedSitemap();

        if (!result.success) {
            console.error('Paginated sitemap generation failed:', result.errors);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to generate paginated sitemap',
                    details: result.errors
                },
                { status: 500 }
            );
        }

        // If it's a single sitemap (no pagination needed)
        if (result.sitemap && !result.sitemaps) {
            return new NextResponse(result.sitemap, {
                status: 200,
                headers: {
                    'Content-Type': 'application/xml; charset=utf-8',
                    'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
                    'Last-Modified': result.generatedAt,
                    'X-Generated-By': 'SitemapGenerator v1.0',
                    'X-Sitemap-Type': 'single'
                }
            });
        }

        // If multiple sitemaps with index
        if (result.sitemapIndex && result.sitemaps) {
            return NextResponse.json({
                success: true,
                sitemapIndex: result.sitemapIndex,
                sitemaps: result.sitemaps,
                totalUrls: result.totalUrls,
                sitemapCount: result.sitemaps.length,
                generatedAt: result.generatedAt,
                errors: result.errors || []
            }, {
                headers: {
                    'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
                    'Last-Modified': result.generatedAt,
                    'X-Generated-By': 'SitemapGenerator v1.0',
                    'X-Sitemap-Type': 'paginated'
                }
            });
        }

        return NextResponse.json(
            { success: false, error: 'No sitemap content generated' },
            { status: 500 }
        );

    } catch (error) {
        console.error('Paginated sitemap API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}