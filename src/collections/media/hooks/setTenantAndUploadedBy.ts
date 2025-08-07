import { CollectionBeforeChangeHook } from 'payload'

export const setTenantAndUploadedBy: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  if (operation === 'create' && req.user) {
    // Définit le champ 'uploadedBy' avec l'email ou le nom d'utilisateur de l'utilisateur connecté
    data.uploadedBy = req.user.email || req.user.username // Utilise l'email ou le username

    // Si l'utilisateur est un super-admin, ne fait rien de plus
    // Correction ici : ajout de la vérification de l'existence de req.user et req.user.roles
    if (req.user && req.user.roles && req.user.roles.includes('super-admin')) {
      return data
    }

    try {
      const user = await req.payload.findByID({
        collection: 'users',
        id: req.user.id,
        depth: 2, // Récupère les données du tenant en profondeur
      })

      if (user && user.tenants && user.tenants.length > 0) {
        // Trouve le premier tenant qui est un objet et a une propriété 'id'
        for (const tenantRel of user.tenants) {
          if (
            tenantRel &&
            tenantRel.tenant &&
            typeof tenantRel.tenant === 'object' &&
            tenantRel.tenant.id
          ) {
            data.tenant = tenantRel.tenant.id
            break // Sort de la boucle après avoir trouvé le premier tenant valide
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error)
    }
  }

  return data
}
