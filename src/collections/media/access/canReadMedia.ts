import type { Access } from 'payload'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const canReadMedia: Access = ({ req }) => {
  // Les super-admins peuvent tout lire
  if (isSuperAdmin({ req })) {
    return true
  }

  // Si l'utilisateur est connecté et a des tenants, on applique la restriction
  if (req.user && req.user.tenants && req.user.tenants.length > 0) {
    const validTenantIds = req.user.tenants
      .map(({ tenant }) => (typeof tenant === 'object' ? tenant.id : null))
      .filter((id): id is string => id !== null)

    return {
      or: [
        {
          tenant: {
            in: validTenantIds.length > 0 ? validTenantIds : ['impossible_id'],
          },
        },
        {
          tenant: {
            exists: false,
          },
        },
      ],
    }
  }

  // Si l'utilisateur n'est pas connecté ou n'a pas de tenants, on autorise la lecture (images publiques)
  return true
}
