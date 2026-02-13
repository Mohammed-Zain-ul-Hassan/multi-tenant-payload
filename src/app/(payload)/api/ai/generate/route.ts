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
            const markdown = (await generateFullArticle(input, brandVoice)) || '';

            // Convert Markdown to a simple Lexical JSON structure for Payload 3.0
            // This ensures the content is populated even if full conversion is complex.
            result = {
                root: {
                    type: 'root',
                    children: [
                        {
                            type: 'paragraph',
                            children: [
                                {
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: markdown,
                                    type: 'text',
                                    version: 1,
                                },
                            ],
                            direction: 'ltr',
                            format: '',
                            indent: 0,
                            version: 1,
                        },
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    version: 1,
                },
            };
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
