import type { User } from '@/payload-types'
import type { Access, Where } from 'payload'

import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { getTenantAccessIDs } from '../../../utilities/getTenantAccessIDs'

export const readAccess: Access<User> = (args) => {
  const { req } = args
  if (!req?.user) {
    return false
  }

  if (isSuperAdmin(args)) {
    return true
  }

  const tenantIDs = getTenantAccessIDs(req.user)

  return {
    or: [
      {
        // L'utilisateur peut se voir lui-même
        id: {
          equals: req.user.id,
        },
      },
      {
        // Les tenant-admins et tenant-viewers peuvent voir les utilisateurs de leur tenant
        'tenants.tenant': {
          in: tenantIDs,
        },
      },
    ],
  } as Where
}
