import type { Access } from 'payload'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const canCreateMedia: Access = ({ req }) => {
  // Les super-admins peuvent tout créer
  if (isSuperAdmin({ req })) {
    return true
  }

  // Les utilisateurs de tenants peuvent créer des médias
  // Ajout de ?? 0 pour fournir une valeur par défaut de 0 si user?.tenants est undefined
  return Boolean(req.user?.tenants?.length ?? 0 > 0)
}
