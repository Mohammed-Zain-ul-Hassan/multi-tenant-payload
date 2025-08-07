import type { FieldHook } from 'payload'

const generateSlug: FieldHook = ({ value, data, originalDoc }) => {
  // Vérifie si data existe avant d'accéder à ses propriétés
  if (data && ((!value && data.title) || (originalDoc && originalDoc.title !== data.title))) {
    return data.title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  return value
}

export default generateSlug
