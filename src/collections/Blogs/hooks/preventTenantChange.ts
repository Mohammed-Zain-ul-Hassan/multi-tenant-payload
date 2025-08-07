import type { FieldHook } from 'payload'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const preventTenantChange: FieldHook = async ({ req, originalDoc, value }) => {
  // Si l'utilisateur est 'super-admin', autorise la modification
  if (isSuperAdmin({ req })) {
    return value
  }

  // Sinon, renvoie la valeur originale du champ 'tenant', empêchant ainsi sa modification
  return originalDoc.tenant
}
