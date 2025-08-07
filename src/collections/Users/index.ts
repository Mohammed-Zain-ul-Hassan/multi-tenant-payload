import type { CollectionConfig } from 'payload'

import { createAccess } from './access/create'
import { readAccess } from './access/read'
import { updateAndDeleteAccess } from './access/updateAndDelete'
import { externalUsersLogin } from './endpoints/externalUsersLogin'
import { ensureUniqueUsername } from './hooks/ensureUniqueUsername'
// import { setCookieBasedOnDomain } from './hooks/setCookieBasedOnDomain'

const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: createAccess,
    delete: updateAndDeleteAccess,
    read: readAccess,
    update: updateAndDeleteAccess,
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  endpoints: [externalUsersLogin],
  fields: [
    {
      name: 'roles',
      type: 'select',
      defaultValue: ['user'],
      hasMany: true,
      options: ['super-admin', 'user'],
      admin: {
        condition: (data, siblingData, { user }) => {
          return !!user?.roles?.includes('super-admin')
        },
      },
    },
    {
      name: 'tenants',
      type: 'array',
      fields: [
        {
          name: 'tenant',
          type: 'relationship',
          index: true,
          relationTo: 'tenants',
          required: true,
          saveToJWT: true,
        },
        {
          name: 'roles',
          type: 'select',
          defaultValue: ['tenant-viewer'],
          hasMany: true,
          options: ['tenant-admin', 'tenant-viewer'],
          required: true,
        },
      ],
      saveToJWT: true,
    },
    {
      name: 'username',
      type: 'text',
      hooks: {
        beforeValidate: [ensureUniqueUsername],
      },
      index: true,
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Biographie',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Image de Profil',
    },

    // ✅ NEW: Social Media Links Section
    {
      name: 'socialLinks',
      label: 'Social Media Links',
      type: 'group',
      admin: {
        description: 'Add links to your social media profiles',
      },
      fields: [
        {
          name: 'linkedin',
          label: 'LinkedIn',
          type: 'text',
        },
        {
          name: 'facebook',
          label: 'Facebook',
          type: 'text',
        },
        {
          name: 'twitter',
          label: 'Twitter',
          type: 'text',
        },
        {
          name: 'instagram',
          label: 'Instagram',
          type: 'text',
        },
        {
          name: 'whatsapp',
          label: 'WhatsApp',
          type: 'text',
        },
        {
          name: 'tiktok',
          label: 'TikTok',
          type: 'text',
        },
        {
          name: 'website',
          label: 'Website Profile',
          type: 'text',
        },
      ],
    },
  ],
  // hooks: {
  //   afterLogin: [setCookieBasedOnDomain],
  // },
}

export default Users
