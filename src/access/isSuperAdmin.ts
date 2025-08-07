import type { PayloadRequest, User } from 'payload';

export const isSuperAdmin = ({
  req,
  user,
}: {
  req?: PayloadRequest;
  user?: User | null;
}) => {
  const targetUser = user || req?.user;

  if (!targetUser || !targetUser.roles) {
    return false;
  }

  return targetUser.roles.includes('super-admin');
};
