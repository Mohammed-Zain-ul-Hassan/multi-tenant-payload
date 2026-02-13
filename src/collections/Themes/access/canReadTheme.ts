import type { Access, User } from 'payload';
import { isSuperAdmin } from '@/access/isSuperAdmin';

export const canReadTheme: Access = ({ req: { user } }) => {
  if (isSuperAdmin({ user: user as User })) {
    return true;
  }

  if ((user?.tenants ?? []).length > 0) {
    return {
      or: [
        {
          tenant: {
            in: user?.tenants?.map((tenant) =>
              typeof tenant.tenant === 'object' ? tenant.tenant?.id : tenant.tenant
            ),
          },
        },
        {
          tenant: {
            exists: false,
          },
        },
      ],
    };
  }

  return false;
};
