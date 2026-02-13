import type { CollectionBeforeChangeHook } from 'payload'

export const createTenantHook: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation === 'create') {
    if (req.user) {
      try {
        const user = await req.payload.findByID({
          collection: 'users',
          id: req.user?.id,
          depth: 2, // Augmente la profondeur pour récupérer les données du tenant
        })

        if (user && user.tenants && user.tenants.length > 0) {
          // Trouve le premier tenant qui est un objet et a une propriété 'id'
          for (const tenantRel of user.tenants) {
            if (
              tenantRel &&
              tenantRel.tenant &&
              typeof tenantRel.tenant === 'object' &&
              tenantRel.tenant?.id
            ) {
              data.tenant = tenantRel.tenant?.id
              break // Sort de la boucle après avoir trouvé le premier tenant valide
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error)
        // Gérer l'erreur, par exemple, en enregistrant un message d'erreur ou en définissant une valeur par défaut pour data.tenant
      }

      data.createdBy = req.user?.id
    }
  }

  return data
}
