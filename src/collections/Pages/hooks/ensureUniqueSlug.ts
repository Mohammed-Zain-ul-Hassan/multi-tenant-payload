import type { FieldHook } from 'payload';

import { ValidationError } from 'payload';

import { getTenantAccessIDs } from '../../../utilities/getTenantAccessIDs';

export const ensureUniqueSlug: FieldHook = async ({ data, originalDoc, req, value }) => {
  // If value is unchanged, skip validation
  if (originalDoc.slug === value) {
    return value;
  }

  const incomingTenantID = typeof data?.tenant === 'object' ? data.tenant?.id : data?.tenant;
  const currentTenantID =
    typeof originalDoc?.tenant === 'object' ? originalDoc.tenant?.id : originalDoc?.tenant;
  const tenantIDToMatch = incomingTenantID || currentTenantID;

  const findDuplicateBlogs = await req.payload.find({
    collection: 'blogs', // Replace 'pages' with 'blogs' or the appropriate collection slug
    where: {
      and: [
        {
          tenant: {
            equals: tenantIDToMatch,
          },
        },
        {
          slug: {
            equals: value,
          },
        },
      ],
    },
  });

  if (findDuplicateBlogs.docs.length > 0 && req.user) {
    const tenantIDs = getTenantAccessIDs(req.user);
    // If the user is an admin or has access to more than 1 tenant
    // provide a more specific error message
    if (req.user.roles?.includes('super-admin') || tenantIDs.length > 1) {
      const attemptedTenantChange = await req.payload.findByID({
        id: tenantIDToMatch,
        collection: 'tenants',
      });

      throw new ValidationError({
        errors: [
          {
            message: `The "${attemptedTenantChange.name}" tenant already has a blog with the slug "${value}". Slugs must be unique per tenant.`,
            path: 'slug',
          },
        ],
      });
    }

    throw new ValidationError({
      errors: [
        {
          message: `A blog with the slug ${value} already exists. Slug must be unique per tenant.`,
          path: 'slug',
        },
      ],
    });
  }

  return value;
};
