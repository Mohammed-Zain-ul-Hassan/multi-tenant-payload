import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { markdownToLexical } from '@/utilities/markdownToLexical'

export const maxDuration = 60 // Allow 60 seconds for generation

export async function POST(req: Request) {
    try {
        const payload = await getPayload({ config: configPromise })
        const { user } = await payload.auth(req)

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { tenantId, topic } = await req.json()

        if (!tenantId || !topic) {
            return NextResponse.json({ error: 'Missing tenantId or topic' }, { status: 400 })
        }

        // 0. Strict Input Validation (Security Hardening)
        if (typeof topic !== 'string' || topic.length > 200) {
            return NextResponse.json({ error: 'Topic must be a string under 200 characters' }, { status: 400 })
        }
        const sanitizedTopic = topic.trim().replace(/[<>]/g, '') // Basic sanitization

        // 0.5 Functional Rate Limiting
        // Prevent abuse by checking if this user created a post in the last 1 minute
        const CACHE_WINDOW_MS = 60 * 1000
        const oneMinuteAgo = new Date(Date.now() - CACHE_WINDOW_MS)

        const recentPosts = await payload.find({
            collection: 'blogs',
            where: {
                user: {
                    equals: user.id,
                },
                createdAt: {
                    greater_than: oneMinuteAgo.toISOString(),
                },
            },
            limit: 1,
        })

        if (recentPosts.totalDocs > 0) {
            return NextResponse.json({ error: 'Rate limit exceeded. Please wait 1 minute between generations.' }, { status: 429 })
        }

        // 1. Verify Tenant Access (IDOR Fix)
        // Check if the user has a role or relationship that allows access to this tenant
        const hasAccess =
            (user.roles && user.roles.includes('super-admin')) ||
            (user.tenants &&
                user.tenants.some((t: any) => {
                    // Handle both populated and unpopulated relationships
                    const id = typeof t.tenant === 'string' ? t.tenant : t.tenant?.id
                    return id === tenantId
                }))

        if (!hasAccess) {
            return NextResponse.json({ error: 'Unauthorized access to this tenant' }, { status: 403 })
        }

        // 2. Fetch Tenant Context
        const tenant = await payload.findByID({
            collection: 'tenants',
            id: tenantId,
        })

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
        }

        const brandVoice = (tenant as any).aiStrategy?.brandVoice || 'neutral and professional'
        const targetAudience = (tenant as any).aiStrategy?.targetAudience || 'general audience'
        const keywords = (tenant as any).aiStrategy?.keywords?.map((k: any) => k.keyword).join(', ') || ''

        // Smart Linking: Fetch existing blogs
        const existingBlogs = await payload.find({
            collection: 'blogs',
            where: { tenant: { equals: tenantId } },
            limit: 10,
        })
        const internalLinks = existingBlogs.docs.map(doc => doc.slug).join(', ')

        // 3. Prompt Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

        const prompt = `Write a 1500-word blog post about "${sanitizedTopic}".
    
    Context:
    - Tone: ${brandVoice}
    - Target Audience: ${targetAudience}
    - Keywords to include: ${keywords}
    ${internalLinks ? `- Internal links to reference (interlink naturally): ${internalLinks}` : ''}
    
    Formatting Rules:
    - Use strictly GitHub Flavored Markdown.
    - Use H1 for the main title, H2 and H3 for subsections.
    - Use standard Markdown lists (unordered and ordered).
    - If you need to include a table, use valid GFM table syntax.
    - If you need to include raw HTML (like a complex layout), wrap it in a code block with language 'html'.
    ${internalLinks ? '- Use Markdown syntax [text](slug) for internal links.' : ''}
    `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const markdown = response.text()

        // 4. Convert via Bridge with Fallback
        let content
        try {
            content = await markdownToLexical(markdown)
        } catch (conversionError) {
            console.error('Markdown to Lexical Conversion Failed:', conversionError)
            // Fallback to simple paragraph with raw markdown
            content = {
                root: {
                    type: 'root',
                    children: [
                        {
                            type: 'paragraph',
                            version: 1,
                            children: [
                                {
                                    type: 'text',
                                    text: markdown,
                                    version: 1,
                                },
                            ],
                        },
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    version: 1,
                },
            }
        }

        // 5. Save Blog Post
        const newPost = await payload.create({
            collection: 'blogs',
            data: {
                title: topic,
                tenant: tenantId,
                content: content as any, // Cast to any to avoid strict type checks on huge Lexical objects
                _status: 'draft',
                user: user.id,
                slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                featuredImage: '', // Placeholder
            } as any,
            draft: true,
        })

        return NextResponse.json({ success: true, postId: newPost.id })

    } catch (error: any) {
        console.error('AI Article Generation Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
