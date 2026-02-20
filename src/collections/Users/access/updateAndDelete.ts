import type { Access, Where } from 'payload'
import type { User } from '@/payload-types'

import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { getTenantAdminTenantAccessIDs } from '../../../utilities/getTenantAccessIDs'

export const updateAndDeleteAccess: Access<User> = (args) => {
  const { req } = args
  if (!req.user) {
    return false
  }

  if (isSuperAdmin(args)) {
    return true
  }

  const adminTenantAccessIDs = getTenantAdminTenantAccessIDs(req.user)

  return {
    or: [
      {
        id: {
          equals: req.user.id,
        },
      },
      {
        'tenants.tenant': {
          in: adminTenantAccessIDs,
        },
      },
    ],
  } as Where
}
