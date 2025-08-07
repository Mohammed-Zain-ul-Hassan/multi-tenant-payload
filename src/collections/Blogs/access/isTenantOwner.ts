import type { Access } from 'payload';
import { isSuperAdmin } from '@/access/isSuperAdmin';

export const isTenantOwner: Access = ({ req, data }) => {
  const { user } = req;

  console.log('isTenantOwner - user:', user);
  console.log('isTenantOwner - data:', data);

  if (user) {
    if (isSuperAdmin({ req })) {
      console.log('isTenantOwner - isSuperAdmin: true');
      return true;
    }

    if (user.roles?.includes('tenant-admin' as any) || user.roles?.includes('tenant-viewer' as any)) {
      console.log('isTenantOwner - tenant-admin or tenant-viewer: true');
      return true; // Return true directly
    }
  }

  console.log('isTenantOwner - returning false');
  return false;
};
