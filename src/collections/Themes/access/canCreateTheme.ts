import type { Access, User } from 'payload';
import { isSuperAdmin } from '@/access/isSuperAdmin';

export const canCreateTheme: Access = ({ req: { user } }) => {
  if (isSuperAdmin({ user: user as User })) {
    return true;
  }

  // Ensure `tenants` is defined before accessing its length
  return user?.tenants?.length ? user.tenants.length > 0 : false;
};
