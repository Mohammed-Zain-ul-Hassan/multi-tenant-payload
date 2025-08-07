import type { Access } from 'payload'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const canDeleteMedia: Access = ({ req }) => {
  // Les super-admins peuvent tout supprimer
  if (isSuperAdmin({ req })) {
    return true
  }

  // Les utilisateurs de tenants peuvent supprimer les médias de leurs tenants
  return Boolean(req.user?.tenants?.length ?? 0 > 0)
}
