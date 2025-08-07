import { CollectionConfig } from 'payload'
import { isAdmin } from './access/isAdmin'
import { canCreateTheme } from './access/canCreateTheme'
import { canReadTheme } from './access/canReadTheme'
import { canUpdateTheme } from './access/canUpdateTheme'
import { createTenantHook } from './hooks/createTenantHook'
import { updateTenantHook } from './hooks/updateTenantHook'
import { isSuperAdmin } from '@/access/isSuperAdmin'

const Themes: CollectionConfig = {
  slug: 'themes',
  labels: {
    singular: 'Theme',
    plural: 'Themes',
  },
  access: {
    read: ({ req }) => canReadTheme({ req }),
    create: ({ req }) => canCreateTheme({ req }),
    update: ({ req }) => canUpdateTheme({ req }),
    delete: ({ req }) => isAdmin({ req }),
  },

  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      // Uniquement visible par les super admin
      admin: {
        condition: (data, siblingData, { user }) => !!user?.roles?.includes('super-admin'),
        position: 'sidebar', // Optionnel, pour afficher dans la barre latérale
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom du Theme',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description du Theme',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media', // Reference the Media collection
      label: 'Image du Theme',
      required: true,
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Created By',
      admin: {
        hidden: true, // Correct way to hide a field
      },
    },
  ],
  admin: { useAsTitle: 'name' },
  hooks: {
    beforeChange: [createTenantHook, updateTenantHook],
  },
}

export default Themes
