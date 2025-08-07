import type { CollectionAfterChangeHook } from 'payload'

const generateMetaDescription: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create' && !doc.metaDescription && doc.content) {
    const metaDescription = generateMetaDescriptionFromContent(doc.content) // Fonction à extraire
    await req.payload.update({
      collection: 'blogs',
      id: doc.id,
      data: { metaDescription },
    })
  }
}

// Extrait la logique de génération de la meta description dans une fonction séparée
function generateMetaDescriptionFromContent(content: any): string {
  if (typeof content === 'string') {
    return content.substring(0, 150) + '...'
  } else if (Array.isArray(content)) {
    const textContent = content.map((block: any) => block.text || '').join(' ')
    return textContent.substring(0, 150) + '...'
  }
  return ''
}

export default generateMetaDescription
