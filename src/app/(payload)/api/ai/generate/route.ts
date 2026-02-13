import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { generateSEO, generateKeywords, generateFullArticle } from '@/utils/ai';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tenantId, input, type } = body;

        if (!tenantId || !type || !input) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const payload = await getPayload({ config });

        // Fetch Tenant strategy
        const tenant = await payload.findByID({
            collection: 'tenants',
            id: tenantId,
            overrideAccess: true, // Fix for "Not Found" if user context is missing
        });

        const brandVoice = tenant.brandVoice || undefined;

        let result: any = '';

        if (type === 'meta') {
            result = (await generateSEO(input, brandVoice)) || '';
        } else if (type === 'keywords') {
            result = (await generateKeywords(input, brandVoice)) || '';
        } else if (type === 'full-article') {
            // Smart Linking: Fetch existing blogs to interlink
            const existingBlogs = await payload.find({
                collection: 'blogs',
                where: {
                    tenant: { equals: tenantId }
                },
                limit: 10
            });

            // Ensure we only pass strings to internalLinks
            const internalLinks = existingBlogs.docs
                .map(doc => doc.slug)
                .filter((slug): slug is string => typeof slug === 'string');

            const markdown = (await generateFullArticle(input, brandVoice, internalLinks)) || '';

            // Import the Lexical Bridge utility
            const { markdownToLexical } = await import('@/utilities/markdownToLexical');
            result = await markdownToLexical(markdown);
        } else {
            return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            result,
        });
    } catch (error: any) {
        console.error('AI Generation Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
        }, { status: 500 });
    }
}
