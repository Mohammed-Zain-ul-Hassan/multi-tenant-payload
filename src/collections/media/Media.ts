import { CollectionConfig } from 'payload';
import { canCreateMedia } from './access/canCreateMedia';
import { canDeleteMedia } from './access/canDeleteMedia';
import { canReadMedia } from './access/canReadMedia';
import { canUpdateMedia } from './access/canUpdateMedia';
import { setTenantAndUploadedBy } from './hooks/setTenantAndUploadedBy';

const Media: CollectionConfig = {
  slug: 'media', // This slug must match the 'relationTo' value in the Blogs collection
  labels: {
    singular: 'Media Item',
    plural: 'Media Library',
  },
  upload: {
    staticDir: 'media', // Directory where media files are stored
    adminThumbnail: 'card',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        condition: (data, siblingData, { user }) => !!user?.roles?.includes('super-admin'),
        position: 'sidebar',
      },
    },
    {
      name: 'alt',
      type: 'text',
      label: "Description de l'image (Alt)",
      required: true,
    },
    {
      name: 'uploadedBy',
      label: 'Uploader par',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  access: {
    read: ({ req }) => canReadMedia({ req }),
    create: ({ req }) => canCreateMedia({ req }),
    update: ({ req }) => canUpdateMedia({ req }),
    delete: ({ req }) => canDeleteMedia({ req }),
  },
  hooks: {
    beforeChange: [setTenantAndUploadedBy],
  },
};

export default Media;
