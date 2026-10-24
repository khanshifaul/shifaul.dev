import { SitemapGenerator } from '@/lib/utils/sitemap-generator';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ sitemap: string }> }) {
    try {
        const { sitemap } = await params;
        const sitemapNumber = parseInt(sitemap.replace('sitemap-', ''), 10);

        if (isNaN(sitemapNumber) || sitemapNumber < 1) {
            return NextResponse.json(
                { success: false, error: 'Invalid sitemap number' },
                { status: 400 }
            );
        }

        // Initialize sitemap generator
        const generator = new SitemapGenerator({
            realTime: true,
            buildTime: false,
            includeLastmod: true,
            includeChangefreq: true,
            includePriority: true,
            paginationEnabled: true,
            maxUrlsPerSitemap: 1000
        });

        // Generate all URLs first
        const allUrls = await generator.getAllUrls();
        const paginatedUrls = generator['paginateUrls'](allUrls);

        if (sitemapNumber > paginatedUrls.length) {
            return NextResponse.json(
                { success: false, error: 'Sitemap not found' },
                { status: 404 }
            );
        }

        // Get specific sitemap
        const sitemapUrls = paginatedUrls[sitemapNumber - 1];
        const sitemapResult = generator['formatSitemapXml'](sitemapUrls);

        if (!sitemapResult.success || !sitemapResult.sitemap) {
            return NextResponse.json(
                { success: false, error: 'Failed to generate sitemap' },
                { status: 500 }
            );
        }

        return new NextResponse(sitemapResult.sitemap, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
                'X-Generated-By': 'SitemapGenerator v1.0',
                'X-Sitemap-Number': sitemapNumber.toString(),
                'X-Total-Sitemaps': paginatedUrls.length.toString()
            }
        });

    } catch (error) {
        console.error('Individual sitemap API error:', error);
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