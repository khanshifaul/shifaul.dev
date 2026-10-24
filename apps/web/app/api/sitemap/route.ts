import { SitemapGenerator } from '@/lib/utils/sitemap-generator';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Initialize sitemap generator with real-time configuration
        const generator = new SitemapGenerator({
            realTime: true,
            buildTime: false,
            includeLastmod: true,
            includeChangefreq: true,
            includePriority: true,
            paginationEnabled: true,
            maxUrlsPerSitemap: 1000
        });

        // Generate the sitemap
        const result = await generator.generateSitemap();

        if (!result.success) {
            console.error('Sitemap generation failed:', result.errors);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to generate sitemap',
                    details: result.errors
                },
                { status: 500 }
            );
        }

        if (!result.sitemap) {
            return NextResponse.json(
                { success: false, error: 'No sitemap content generated' },
                { status: 500 }
            );
        }

        // Return XML with appropriate headers
        return new NextResponse(result.sitemap, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
                'Last-Modified': result.generatedAt,
                'X-Generated-By': 'SitemapGenerator v1.0'
            }
        });

    } catch (error) {
        console.error('Sitemap API error:', error);
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