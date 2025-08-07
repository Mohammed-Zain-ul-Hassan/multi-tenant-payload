import type { CollectionBeforeChangeHook } from 'payload'

export const updateTenantHook: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (operation === 'update') {
    const user = req.user

    if (user && user.roles && !user.roles.includes('super-admin')) {
      // Mettre à jour data.tenant avec l'ID du tenant du document original
      data.tenant = originalDoc.tenant.id
    }

    return data
  }

  return data
}
