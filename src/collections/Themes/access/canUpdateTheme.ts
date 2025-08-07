import type { Access } from 'payload'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const canUpdateTheme: Access = ({ req: { user } }) => {
  if (isSuperAdmin({ user: user as any })) {
    return true
  }

  return user?.tenants?.length ? user.tenants.length > 0 : false;
}
