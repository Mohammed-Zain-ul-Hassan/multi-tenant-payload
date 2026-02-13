import type { CollectionAfterChangeHook } from 'payload'
import { generateSEO } from '@/utils/ai'

const generateMetaDescription: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  // Only generate if it's a new document and there's no metaDescription yet
  if (operation === 'create' && !doc.metaDescription && doc.content) {
    try {
      // 1. Fetch Tenant context
      const tenantId = typeof doc.tenant === 'object' ? doc.tenant?.id : doc.tenant
      if (!tenantId) return

      const tenant = await req.payload.findByID({
        collection: 'tenants',
        id: tenantId,
      })

      // 2. Extract plain text from Lexical content
      const plainText = extractTextFromLexical(doc.content)
      if (!plainText) return

      // 3. Generate AI SEO description
      const aiMetaDescription = await generateSEO(
        plainText,
        tenant.brandVoice || undefined,
        tenant.keywords?.map((k: any) => k.keyword).filter(Boolean) || []
      )

      if (aiMetaDescription) {
        await req.payload.update({
          collection: 'blogs',
          id: doc.id,
          data: { metaDescription: aiMetaDescription },
        })
      }
    } catch (error) {
      console.error('Error in generateMetaDescription hook:', error)
    }
  }
}

/**
 * Helper to extract plain text from Payload's Lexical editor format
 */
function extractTextFromLexical(content: any): string {
  if (!content || !content.root || !content.root.children) return ''

  let text = ''

  function traverse(node: any) {
    if (node.text) {
      text += node.text + ' '
    }
    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  content.root.children.forEach(traverse)
  return text.trim()
}

export default generateMetaDescription
