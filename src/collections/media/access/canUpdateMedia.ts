import type { Access } from 'payload'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const canUpdateMedia: Access = ({ req }) => {
  // Les super-admins peuvent tout modifier
  if (isSuperAdmin({ req })) {
    return true
  }

  // Les utilisateurs de tenants peuvent modifier les médias de leurs tenants
  return Boolean(req.user?.tenants?.length ?? 0 > 0)
}
